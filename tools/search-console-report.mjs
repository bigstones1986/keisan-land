import { mkdir, readFile, writeFile } from "node:fs/promises";

const CLIENT_FILE = "gsc-oauth-client.json";
const TOKEN_FILE = "gsc-token.json";
const REPORT_DIR = "search-console-private/reports";
const SITE_URL = process.env.GSC_SITE_URL || "https://keisan-land.netlify.app/";
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DEFAULT_INSPECTION_URLS = [
  "https://keisan-land.netlify.app/",
  "https://keisan-land.netlify.app/first-time.html",
  "https://keisan-land.netlify.app/step-calculation.html",
  "https://keisan-land.netlify.app/grade2-kuku-word-problems.html"
];

function formatDate(date) {
  return new Date(date.getTime() + JST_OFFSET_MS).toISOString().slice(0, 10);
}

function daysAgo(days) {
  return formatDate(new Date(Date.now() - days * 24 * 60 * 60 * 1000));
}

function getClientConfig(raw) {
  const config = JSON.parse(raw);
  return config.installed || config.web || config;
}

async function refreshAccessToken() {
  const client = getClientConfig(await readFile(CLIENT_FILE, "utf8"));
  const token = JSON.parse(await readFile(TOKEN_FILE, "utf8"));
  if (!token.refresh_token) {
    throw new Error(`${TOKEN_FILE} に refresh_token がありません。認証をやり直してください。`);
  }

  const body = new URLSearchParams({
    client_id: client.client_id,
    client_secret: client.client_secret,
    refresh_token: token.refresh_token,
    grant_type: "refresh_token"
  });
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`アクセストークン更新に失敗しました: ${JSON.stringify(data, null, 2)}`);
  }

  const nextToken = { ...token, ...data, saved_at: Date.now() };
  await writeFile(TOKEN_FILE, JSON.stringify(nextToken, null, 2), "utf8");
  return nextToken.access_token;
}

async function gscPost(url, accessToken, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`${url} に失敗しました: ${JSON.stringify(data, null, 2)}`);
  }
  return data;
}

async function searchAnalytics(accessToken, body) {
  const encodedSite = encodeURIComponent(SITE_URL);
  return gscPost(`https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`, accessToken, body);
}

async function inspectUrl(accessToken, inspectionUrl) {
  return gscPost("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", accessToken, {
    inspectionUrl,
    siteUrl: SITE_URL,
    languageCode: "ja-JP"
  });
}

function metricLine(row) {
  if (!row) return "クリック 0 / 表示 0 / CTR 0.00% / 平均順位 -";
  const ctr = `${(Number(row.ctr || 0) * 100).toFixed(2)}%`;
  const position = row.position ? Number(row.position).toFixed(1) : "-";
  return `クリック ${row.clicks || 0} / 表示 ${row.impressions || 0} / CTR ${ctr} / 平均順位 ${position}`;
}

function table(rows, headers) {
  if (!rows?.length) return "データなし";
  const lines = [headers.join(" | "), headers.map(() => "---").join(" | ")];
  for (const row of rows) lines.push(row.join(" | "));
  return lines.join("\n");
}

function inspectionSummary(result) {
  const index = result.inspectionResult?.indexStatusResult || {};
  return {
    verdict: index.verdict || "UNKNOWN",
    coverageState: index.coverageState || "不明",
    indexingState: index.indexingState || "不明",
    robotsTxtState: index.robotsTxtState || "不明",
    lastCrawlTime: index.lastCrawlTime || "不明",
    googleCanonical: index.googleCanonical || "不明",
    userCanonical: index.userCanonical || "不明"
  };
}

async function main() {
  const accessToken = await refreshAccessToken();
  const targetDate = process.env.GSC_TARGET_DATE || daysAgo(3);
  const sevenDaysStart = process.env.GSC_START_DATE || daysAgo(9);
  const sevenDaysEnd = process.env.GSC_END_DATE || daysAgo(3);
  const inspectionUrls = (process.env.GSC_INSPECTION_URLS || DEFAULT_INSPECTION_URLS.join(","))
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);

  const summary = await searchAnalytics(accessToken, {
    startDate: targetDate,
    endDate: targetDate,
    type: "web"
  });

  const pageRows = await searchAnalytics(accessToken, {
    startDate: sevenDaysStart,
    endDate: sevenDaysEnd,
    type: "web",
    dimensions: ["page"],
    rowLimit: 10
  });

  const queryRows = await searchAnalytics(accessToken, {
    startDate: sevenDaysStart,
    endDate: sevenDaysEnd,
    type: "web",
    dimensions: ["query"],
    rowLimit: 10
  });

  const inspections = [];
  for (const url of inspectionUrls) {
    try {
      inspections.push({ url, ok: true, ...inspectionSummary(await inspectUrl(accessToken, url)) });
    } catch (error) {
      inspections.push({ url, ok: false, error: error.message.replace(/\s+/g, " ") });
    }
  }

  const pageTable = table((pageRows.rows || []).map((row) => [
    row.keys?.[0] || "-",
    row.clicks || 0,
    row.impressions || 0,
    `${(Number(row.ctr || 0) * 100).toFixed(2)}%`,
    Number(row.position || 0).toFixed(1)
  ]), ["ページ", "クリック", "表示", "CTR", "平均順位"]);

  const queryTable = table((queryRows.rows || []).map((row) => [
    row.keys?.[0] || "-",
    row.clicks || 0,
    row.impressions || 0,
    `${(Number(row.ctr || 0) * 100).toFixed(2)}%`,
    Number(row.position || 0).toFixed(1)
  ]), ["検索語", "クリック", "表示", "CTR", "平均順位"]);

  const inspectionTable = table(inspections.map((item) => item.ok
    ? [item.url, item.verdict, item.coverageState, item.lastCrawlTime]
    : [item.url, "ERROR", item.error, "-"]
  ), ["URL", "判定", "状態", "最終クロール"]);

  const reportDate = formatDate(new Date());
  const report = `# Search Console 自動レポート ${reportDate}\n\n対象サイト: ${SITE_URL}\n\n## ${targetDate} の全体\n\n${metricLine(summary.rows?.[0])}\n\n## 直近対象期間\n\n${sevenDaysStart} 〜 ${sevenDaysEnd}\n\n## ページ別 上位\n\n${pageTable}\n\n## 検索語 上位\n\n${queryTable}\n\n## URL検査\n\n${inspectionTable}\n\n## 今日見るポイント\n\n- 表示回数が増えているページがあれば、タイトルや導線を強化する\n- 表示はあるのにクリックがない検索語は、検索結果での見え方を見直す\n- URL検査で登録されていない重要ページは、Search Console画面から手動で登録リクエストする\n`;

  await mkdir(REPORT_DIR, { recursive: true });
  const reportPath = `${REPORT_DIR}/${reportDate}.md`;
  await writeFile(reportPath, report, "utf8");
  console.log(report);
  console.log(`\n保存先: ${reportPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
