import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, stableValue(value[key])]),
    );
  }
  return value;
}

export function payloadHash(payload) {
  const serialized = JSON.stringify(stableValue(payload));
  return `sha256:${createHash("sha256").update(serialized, "utf8").digest("hex")}`;
}

function collectText(payload) {
  return [
    payload?.title,
    payload?.text,
    payload?.body,
    ...(Array.isArray(payload?.links) ? payload.links : []),
    ...(Array.isArray(payload?.tags) ? payload.tags : []),
  ]
    .filter(Boolean)
    .join("\n");
}

function extractUrls(text) {
  return text.match(/https?:\/\/[^\s)\]}>、。]+/gu) ?? [];
}

function xCharacterCount(text) {
  return Array.from(text.replace(/https?:\/\/\S+/gu, "x".repeat(23))).length;
}

function jstParts(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

function minutes(value) {
  const match = /^(\d{2}):(\d{2})$/.exec(value ?? "");
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

function hoursBetween(a, b) {
  return Math.abs(a.getTime() - b.getTime()) / 3_600_000;
}

export function evaluateManifest(
  policy,
  ledger,
  manifest,
  { external = false, handoff = false } = {},
) {
  const errors = [];
  const warnings = [];
  const add = (message) => errors.push(message);

  if (policy.schema_version !== 1) add("未対応のポリシースキーマです");
  if (!policy.autonomous_approval_enabled) add("AI承認ゲートが無効です");
  if (ledger.paused) add(`公開台帳が停止中です: ${ledger.pause_reason ?? "理由未記録"}`);
  if (manifest.schema_version !== 1) add("未対応のマニフェストスキーマです");
  if (!manifest.publication_id || manifest.publication_id.includes("replace-")) {
    add("publication_idが未設定です");
  }

  const channelRule = policy.channel_rules?.[manifest.channel];
  if (!channelRule) add(`未許可の媒体です: ${manifest.channel ?? "未設定"}`);
  if (manifest.operation !== "create_post") add("create_post以外の操作は許可されていません");
  if (!["green", "yellow", "red"].includes(manifest.risk_level)) add("risk_levelが不正です");
  if (manifest.risk_level === "yellow") add("Yellow投稿は社長の個別確認が必要です");
  if (manifest.risk_level === "red") add("Red投稿は公開できません");

  if (!manifest.payload || typeof manifest.payload !== "object") {
    add("payloadがありません");
  }

  const expectedHash = payloadHash(manifest.payload ?? {});
  if (manifest.content_hash !== expectedHash) {
    add(`payloadのハッシュが一致しません: 正 ${expectedHash}`);
  }

  const approvalRules = policy.approval_chain ?? {};
  const reviewIds = new Set();
  for (const key of approvalRules.required ?? []) {
    const approval = manifest.approvals?.[key];
    if (!approval) {
      add(`${key}承認がありません`);
      continue;
    }
    if (approval.role !== approvalRules.required_roles?.[key]) {
      add(`${key}承認の担当が不正です`);
    }
    if (approval.decision !== "approve") add(`${key}承認がapproveではありません`);
    if (approval.content_hash !== expectedHash) add(`${key}承認のハッシュが一致しません`);
    if (!approval.review_id || approval.review_id.includes("replace-")) {
      add(`${key}承認のreview_idが未設定です`);
    } else if (reviewIds.has(approval.review_id)) {
      add("同じreview_idが複数工程で使われています");
    } else {
      reviewIds.add(approval.review_id);
    }
    if (!approval.reviewed_at || Number.isNaN(new Date(approval.reviewed_at).getTime())) {
      add(`${key}承認の日時が不正です`);
    }
  }

  if (manifest.approvals?.editorial?.score < 90) add("編集評価が90点未満です");
  if ((manifest.approvals?.safety?.findings ?? []).length > 0) {
    add("安全監査に未解決の指摘があります");
  }
  if (
    approvalRules.creator_cannot_approve &&
    Object.values(approvalRules.required_roles ?? {}).includes(manifest.created_by)
  ) {
    add("原稿作成担当は承認担当を兼ねられません");
  }

  for (const [name, value] of Object.entries(manifest.risk_declarations ?? {})) {
    if (value !== false) add(`リスク申告 ${name} がfalseではありません`);
  }
  const requiredRiskDeclarations = [
    "contains_personal_data",
    "contains_unverified_claims",
    "contains_third_party_quote",
    "contains_paid_offer",
    "changes_profile",
    "uses_reply_or_mention",
  ];
  for (const name of requiredRiskDeclarations) {
    if (!(name in (manifest.risk_declarations ?? {}))) add(`リスク申告 ${name} がありません`);
  }

  const text = collectText(manifest.payload);
  for (const phrase of policy.forbidden_phrases ?? []) {
    if (text.includes(phrase)) add(`禁止表現があります: ${phrase}`);
  }
  for (const term of policy.blocked_terms ?? []) {
    if (text.includes(term)) add(`禁止テーマを示す語があります: ${term}`);
  }
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/iu.test(text)) {
    add("メールアドレスらしき個人情報があります");
  }
  if (/(?:^|\D)0\d{1,4}-\d{1,4}-\d{3,4}(?:\D|$)/u.test(text)) {
    add("電話番号らしき個人情報があります");
  }

  for (const rawUrl of extractUrls(text)) {
    try {
      const host = new URL(rawUrl).hostname.toLowerCase();
      if (!(policy.allowed_link_hosts ?? []).includes(host)) {
        add(`許可されていないリンク先です: ${host}`);
      }
    } catch {
      add(`URLを解析できません: ${rawUrl}`);
    }
  }

  const scheduledAt = new Date(manifest.scheduled_at);
  if (Number.isNaN(scheduledAt.getTime())) {
    add("scheduled_atが不正です");
  } else {
    const parts = jstParts(scheduledAt);
    const scheduledMinutes = Number(parts.hour) * 60 + Number(parts.minute);
    const start = minutes(policy.publish_window_jst?.start);
    const end = minutes(policy.publish_window_jst?.end);
    if (start === null || end === null || scheduledMinutes < start || scheduledMinutes > end) {
      add("公開予定時刻が許可時間外です");
    }
  }

  const transport = manifest.transport ?? {};
  if (channelRule && !channelRule.allowed_transports?.includes(transport.kind)) {
    add(`許可されていない投稿経路です: ${transport.kind ?? "未設定"}`);
  }

  if (manifest.channel === "x" && channelRule) {
    if (typeof manifest.payload?.text !== "string") add("X本文がありません");
    else if (xCharacterCount(manifest.payload.text) > channelRule.max_characters) {
      add(`X本文が${channelRule.max_characters}文字を超えています`);
    }
    if (manifest.payload?.reply_to) add("Xの自動返信は許可されていません");
    if (!channelRule.allow_mentions && /@[A-Za-z0-9_]{1,15}/u.test(manifest.payload?.text ?? "")) {
      add("Xの自動メンションは許可されていません");
    }
    if (transport.kind === "x_api" && transport.estimated_cost_usd > channelRule.max_api_cost_usd_per_post) {
      add("X APIの想定費用が上限を超えています");
    }
  }

  if (manifest.channel === "substack" && channelRule) {
    if (!manifest.payload?.title || !manifest.payload?.body) add("Substackのタイトルまたは本文がありません");
    if (
      manifest.payload?.delivery !== channelRule.default_delivery &&
      !channelRule.allow_email_delivery_without_owner
    ) {
      add("Substackのメール配信は社長の個別確認が必要です");
    }
    if (manifest.payload?.paid === true) add("Substackの有料投稿は許可されていません");
  }

  if (manifest.channel === "note" && channelRule) {
    if (!manifest.payload?.title || !manifest.payload?.body) add("noteのタイトルまたは本文がありません");
    if (manifest.payload?.paid === true) add("noteの有料投稿は許可されていません");
  }

  if (!Number.isNaN(scheduledAt.getTime()) && channelRule) {
    const previous = (ledger.publications ?? [])
      .filter((item) => item.channel === manifest.channel && item.status === "published")
      .map((item) => new Date(item.published_at))
      .filter((date) => !Number.isNaN(date.getTime()))
      .sort((a, b) => b - a);
    if (previous[0] && hoursBetween(previous[0], scheduledAt) < channelRule.min_hours_between_publications) {
      add("前回投稿からの最低間隔を満たしていません");
    }

    if (manifest.channel === "x") {
      const target = jstParts(scheduledAt);
      const sameJstDay = previous.filter((date) => {
        const value = jstParts(date);
        return value.year === target.year && value.month === target.month && value.day === target.day;
      });
      if (sameJstDay.length >= channelRule.max_publications_per_day) add("Xの1日投稿上限を超えます");
    } else {
      const recent = previous.filter((date) => {
        const hours = (scheduledAt.getTime() - date.getTime()) / 3_600_000;
        return hours >= 0 && hours < 24 * 7;
      });
      if (recent.length >= channelRule.max_publications_per_7_days) {
        add(`${manifest.channel}の7日間投稿上限を超えます`);
      }
    }
  }

  if (external && handoff) add("外部投稿と社長引き渡しを同時には指定できません");

  if (external) {
    if (!policy.external_publish_enabled) add("外部自動投稿が無効です");
    if (channelRule && !channelRule.transport_enabled) add(`${manifest.channel}の投稿経路が無効です`);
    if (transport.kind === "dry_run") add("dry_runは外部投稿に使えません");
  } else if (handoff) {
    if (policy.owner_charter?.final_external_action !== "owner_only") {
      add("最終投稿者が社長に固定されていません");
    }
    if (channelRule && !channelRule.owner_handoff_enabled) {
      add(`${manifest.channel}の社長引き渡しが無効です`);
    }
    if (transport.kind !== "owner_manual_chrome") {
      add("社長引き渡しはowner_manual_chromeだけを使えます");
    }
  } else if (transport.kind !== "dry_run") {
    warnings.push("外部投稿せず、投稿経路の設定だけを検査しました");
  }

  const approvedStatus = external
    ? "APPROVED_FOR_EXTERNAL_PUBLISH"
    : handoff
      ? "APPROVED_FOR_OWNER_POST"
      : "APPROVED_DRY_RUN";

  return {
    ok: errors.length === 0,
    status: errors.length === 0 ? approvedStatus : "BLOCKED",
    expected_hash: expectedHash,
    errors,
    warnings,
  };
}

function finalizedManifest(overrides = {}) {
  const payload = {
    text: "たし算の文章題で止まったら、式の前に「はじめはいくつ？」を確認します。\n\nhttps://keisan-land.netlify.app/grade1-addition-word-problems.html",
    links: ["https://keisan-land.netlify.app/grade1-addition-word-problems.html"],
    media: [],
    delivery: "public",
    reply_to: null,
    ...(overrides.payload ?? {}),
  };
  const hash = payloadHash(payload);
  const manifest = {
    schema_version: 1,
    publication_id: "self-test-x-001",
    channel: "x",
    operation: "create_post",
    risk_level: "green",
    created_by: "X投稿・コミュニティ担当",
    created_at: "2026-07-23T09:00:00+09:00",
    scheduled_at: "2026-07-24T09:00:00+09:00",
    source_file: "x-posts-2026-07-24.md",
    payload,
    content_hash: hash,
    risk_declarations: {
      contains_personal_data: false,
      contains_unverified_claims: false,
      contains_third_party_quote: false,
      contains_paid_offer: false,
      changes_profile: false,
      uses_reply_or_mention: false,
    },
    approvals: {
      editorial: {
        role: "編集長",
        review_id: "self-editorial-001",
        decision: "approve",
        score: 96,
        content_hash: hash,
        reviewed_at: "2026-07-23T09:10:00+09:00",
      },
      qa: {
        role: "QA担当（品質保証担当）",
        review_id: "self-qa-001",
        decision: "approve",
        content_hash: hash,
        reviewed_at: "2026-07-23T09:15:00+09:00",
      },
      safety: {
        role: "安全・ブランド監査責任者",
        review_id: "self-safety-001",
        decision: "approve",
        findings: [],
        content_hash: hash,
        reviewed_at: "2026-07-23T09:20:00+09:00",
      },
      publication: {
        role: "AI公開承認責任者",
        review_id: "self-publication-001",
        decision: "approve",
        content_hash: hash,
        reviewed_at: "2026-07-23T09:25:00+09:00",
      },
    },
    transport: {
      kind: "dry_run",
      estimated_cost_usd: 0,
    },
    ...overrides,
  };

  if (overrides.payload) {
    manifest.payload = payload;
    manifest.content_hash = payloadHash(payload);
    for (const approval of Object.values(manifest.approvals)) {
      approval.content_hash = manifest.content_hash;
    }
  }
  return manifest;
}

async function selfTest(policy, ledger) {
  const cases = [
    {
      name: "安全なX投稿を承認",
      manifest: finalizedManifest(),
      shouldPass: true,
    },
    {
      name: "保証表現を拒否",
      manifest: finalizedManifest({ payload: { text: "この教材なら必ず成績が上がる" } }),
      shouldPass: false,
    },
    {
      name: "ハッシュ不一致を拒否",
      manifest: { ...finalizedManifest(), content_hash: "sha256:invalid" },
      shouldPass: false,
    },
    {
      name: "安全承認なしを拒否",
      manifest: (() => {
        const value = finalizedManifest();
        delete value.approvals.safety;
        return value;
      })(),
      shouldPass: false,
    },
    {
      name: "許可外URLを拒否",
      manifest: finalizedManifest({
        payload: { text: "こちらを確認 https://example.com/test", links: ["https://example.com/test"] },
      }),
      shouldPass: false,
    },
    {
      name: "個人情報らしきメールを拒否",
      manifest: finalizedManifest({ payload: { text: "連絡先は child@example.com です" } }),
      shouldPass: false,
    },
    {
      name: "作成担当と承認担当の兼務を拒否",
      manifest: finalizedManifest({ created_by: "編集長" }),
      shouldPass: false,
    },
    {
      name: "長すぎるX投稿を拒否",
      manifest: finalizedManifest({ payload: { text: "算".repeat(281), links: [] } }),
      shouldPass: false,
    },
    {
      name: "XのWeb自動操作経路を拒否",
      manifest: finalizedManifest({ transport: { kind: "browser_script", estimated_cost_usd: 0 } }),
      shouldPass: false,
    },
    {
      name: "社長が最終投稿するChrome引き渡しを承認",
      manifest: finalizedManifest({
        transport: { kind: "owner_manual_chrome", estimated_cost_usd: 0 },
      }),
      shouldPass: true,
      handoff: true,
    },
    {
      name: "外部投稿無効時の実投稿を拒否",
      manifest: finalizedManifest({
        transport: { kind: "owner_manual_chrome", estimated_cost_usd: 0 },
      }),
      shouldPass: false,
      external: true,
    },
  ];

  const failures = [];
  for (const testCase of cases) {
    const result = evaluateManifest(policy, ledger, testCase.manifest, {
      external: testCase.external ?? false,
      handoff: testCase.handoff ?? false,
    });
    if (result.ok !== testCase.shouldPass) failures.push(`${testCase.name}: ${result.errors.join(" / ")}`);
  }

  const manifestDir = path.join(rootDir, "auto-publish-manifests");
  const manifestNames = (await readdir(manifestDir).catch(() => []))
    .filter((name) => name.endsWith(".json"))
    .sort();
  for (const name of manifestNames) {
    const manifest = JSON.parse(await readFile(path.join(manifestDir, name), "utf8"));
    const result = evaluateManifest(policy, ledger, manifest);
    if (!result.ok) failures.push(`${name}: ${result.errors.join(" / ")}`);
  }

  console.log("けいさんランド AI発信承認ゲートQA");
  console.log(`テスト: ${cases.length}`);
  console.log(`実マニフェスト: ${manifestNames.length}`);
  console.log(`失敗: ${failures.length}`);
  for (const failure of failures) console.error(`失敗: ${failure}`);
  if (failures.length > 0) process.exitCode = 1;
  else console.log("PASS: 安全投稿を通し、危険・不一致・未承認・無効経路を拒否しました。");
}

async function main() {
  const policy = JSON.parse(await readFile(path.join(rootDir, "AUTO_PUBLISH_POLICY.json"), "utf8"));
  const ledger = JSON.parse(
    await readFile(path.join(rootDir, "AUTONOMOUS_PUBLICATION_LEDGER.json"), "utf8"),
  );
  const args = process.argv.slice(2);

  if (args.includes("--self-test")) {
    await selfTest(policy, ledger);
    return;
  }

  const manifestArg = args.find((arg) => !arg.startsWith("--"));
  if (!manifestArg) {
    console.error(
      "使い方: node tools/autonomous-publication-gate.mjs <manifest.json> [--handoff | --external]",
    );
    process.exitCode = 1;
    return;
  }

  const manifestPath = path.resolve(rootDir, manifestArg);
  if (!manifestPath.startsWith(`${rootDir}${path.sep}`)) {
    console.error("マニフェストはプロジェクト内のファイルを指定してください");
    process.exitCode = 1;
    return;
  }

  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  if (args.includes("--hash")) {
    console.log(payloadHash(manifest.payload ?? {}));
    return;
  }

  const result = evaluateManifest(policy, ledger, manifest, {
    external: args.includes("--external"),
    handoff: args.includes("--handoff"),
  });
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}

await main();
