import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const files = await readdir(rootDir);
const targetUrl = "https://keisan-land.netlify.app/grade1-addition-word-problems.html";
const homeUrl = "https://keisan-land.netlify.app/";
const errors = [];
const warnings = [];

function latestMatching(pattern, label) {
  const matches = files.filter((name) => pattern.test(name)).sort((a, b) =>
    a.localeCompare(b, "ja", { numeric: true }),
  );
  if (matches.length === 0) {
    errors.push(`${label}: 対象原稿がありません`);
    return null;
  }
  return matches.at(-1);
}

async function load(name) {
  return { name, source: await readFile(path.join(rootDir, name), "utf8") };
}

function addError(file, message) {
  errors.push(`${file}: ${message}`);
}

function addWarning(file, message) {
  warnings.push(`${file}: ${message}`);
}

function requireText(file, source, expected, message) {
  if (!source.includes(expected)) addError(file, message);
}

function markdownText(source) {
  return source
    .replace(/https?:\/\/\S+/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*]>?\s*/gm, "")
    .replace(/^\d+\.\s*/gm, "")
    .replace(/[\[\]()`*_>]/g, "")
    .trim();
}

function frontmatter(source) {
  const block = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1];
  if (!block) return null;

  return Object.fromEntries(
    block
      .split(/\r?\n/)
      .map((line) => line.match(/^([^:]+):\s*(.*)$/))
      .filter(Boolean)
      .map((match) => [match[1].trim(), match[2].trim()]),
  );
}

function addDays(dateString, days) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString ?? "")) return null;
  const date = new Date(`${dateString}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function checkEditorialMetadata(file, metadata) {
  if (!metadata) return;

  if (!metadata.reader || Array.from(metadata.reader).length < 12) {
    addError(file, "readerに具体的な対象読者を12文字以上で記録してください");
  }

  const score = Number(metadata.editorial_score);
  if (!Number.isInteger(score) || score < 90 || score > 100) {
    addError(file, `editorial_scoreは90〜100の整数にしてください（${metadata.editorial_score ?? "未設定"}）`);
  }

  if (!metadata.editorial_focus || Array.from(metadata.editorial_focus).length < 20) {
    addError(file, "editorial_focusに今回の編集焦点を20文字以上で記録してください");
  }

  const expected24h = addDays(metadata.date, 1);
  const expected7d = addDays(metadata.date, 7);
  if (expected24h && metadata.review_24h !== expected24h) {
    addError(file, `review_24hは公開予定日の翌日にしてください（正: ${expected24h}）`);
  }
  if (expected7d && metadata.review_7d !== expected7d) {
    addError(file, `review_7dは公開予定日の7日後にしてください（正: ${expected7d}）`);
  }
}

async function imageDimensions(filePath) {
  const data = await readFile(filePath);
  const signature = data.subarray(0, 8).toString("hex");
  if (signature === "89504e470d0a1a0a" && data.length >= 24) {
    return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
  }

  if (data[0] === 0xff && data[1] === 0xd8) {
    let offset = 2;
    const startOfFrame = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
    while (offset + 8 < data.length) {
      if (data[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = data[offset + 1];
      offset += 2;
      if (marker === 0xd8 || marker === 0xd9) continue;
      if (offset + 2 > data.length) break;
      const blockLength = data.readUInt16BE(offset);
      if (blockLength < 2 || offset + blockLength > data.length) break;
      if (startOfFrame.has(marker)) {
        return { width: data.readUInt16BE(offset + 5), height: data.readUInt16BE(offset + 3) };
      }
      offset += blockLength;
    }
  }

  return null;
}

function checkClaims(file, source) {
  const forbidden = [
    /絶対/u,
    /必ず(?:成績|伸び|でき|解け)/u,
    /成績が上がる/u,
    /苦手がなくなる/u,
    /検索(?:1位|トップ)にな/u,
  ];
  for (const pattern of forbidden) {
    if (pattern.test(source)) addError(file, `効果を保証する表現があります（${pattern}）`);
  }

  const artificial = [/以下の通り/u, /結論として/u, /いかがでしたか/u, /まとめると/u];
  for (const pattern of artificial) {
    if (pattern.test(source)) addWarning(file, `定型的に見えやすい表現があります（${pattern}）`);
  }
}

function checkParagraphs(file, source, maxLength) {
  const content = source.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, "");
  const paragraphs = content
    .split(/\r?\n\s*\r?\n/)
    .map((value) => value.replace(/^#{1,6}\s+/, "").trim())
    .filter((value) => value && !value.startsWith("|") && !value.startsWith("- ["));
  const longParagraph = paragraphs.find((value) => Array.from(markdownText(value)).length > maxLength);
  if (longParagraph) {
    addError(file, `スマホで長すぎる段落があります（${Array.from(markdownText(longParagraph)).length}文字）`);
  }
}

const xNames = files
  .filter((name) => /^x-posts-\d{4}-\d{2}-\d{2}\.md$/.test(name))
  .filter((name) => name >= "x-posts-2026-07-16.md")
  .sort((a, b) => a.localeCompare(b, "ja", { numeric: true }));
const noteName = latestMatching(/^note-.*\.md$/u, "note");
const substackName = latestMatching(/^dev-diary-\d+-substack-ready\.md$/, "Substack");
const readyXNames = [];

if (xNames.length === 0) errors.push("X: 2026-07-16以降の対象原稿がありません");

for (const xName of xNames) {
  const { source } = await load(xName);
  const metadata = frontmatter(source);
  const filenameDate = xName.match(/(\d{4}-\d{2}-\d{2})/)?.[1];

  if (!metadata) {
    addError(xName, "公開管理用のfrontmatterがありません");
    continue;
  }
  if (metadata.channel !== "x") addError(xName, "channelはxにしてください");
  if (metadata.date !== filenameDate) addError(xName, `dateがファイル名と一致しません（${metadata.date ?? "未設定"}）`);
  if (!["ready", "published", "hold"].includes(metadata.status)) {
    addError(xName, `statusが不正です（${metadata.status ?? "未設定"}）`);
  }
  if (!["required", "none"].includes(metadata.link_policy)) {
    addError(xName, `link_policyが不正です（${metadata.link_policy ?? "未設定"}）`);
  }
  checkEditorialMetadata(xName, metadata);
  if (metadata.status !== "ready") continue;

  readyXNames.push(xName);
  const adopted = source.match(/## 採用案[^\n]*\r?\n([\s\S]*?)(?=\r?\n## |$)/)?.[1]?.trim();
  if (!adopted) {
    addError(xName, "採用案が見つかりません");
  } else {
    const counted = adopted.replace(/https?:\/\/\S+/g, "x".repeat(23));
    const length = Array.from(markdownText(counted)).length;
    if (length > 280) addError(xName, `投稿が280文字を超えています（${length}文字換算）`);
    if (metadata.link_policy === "required" && !adopted.includes(targetUrl)) {
      addError(xName, "重点教材への直接URLがありません");
    }
    if (metadata.link_policy === "none" && /https?:\/\//.test(adopted)) {
      addError(xName, "リンクなし投稿にURLが含まれています");
    }
    if (/#[^\s#]+/u.test(adopted)) addWarning(xName, "ハッシュタグが含まれています");
    checkClaims(xName, adopted);
    checkParagraphs(xName, adopted, 90);
  }
  if (metadata.link_policy === "required") {
    if (!metadata.media) {
      addError(xName, "リンク投稿の添付画像が未設定です");
    } else {
      const mediaPath = path.resolve(rootDir, metadata.media);
      if (!mediaPath.startsWith(`${rootDir}${path.sep}`)) {
        addError(xName, "Xの添付画像はプロジェクト内のファイルを指定してください");
      } else {
        try {
          await access(mediaPath);
          const dimensions = await imageDimensions(mediaPath);
          if (!dimensions) {
            addError(xName, "Xの添付画像の寸法を確認できません");
          } else if (dimensions.width < 1200 || dimensions.height < 630) {
            addError(xName, `Xの添付画像が小さすぎます（${dimensions.width}×${dimensions.height}）`);
          }
        } catch {
          addError(xName, `Xの添付画像が見つかりません（${metadata.media}）`);
        }
      }
    }
    if (!metadata.media_alt || Array.from(metadata.media_alt).length < 20) {
      addError(xName, "X画像の代替テキストを20文字以上で設定してください");
    }

    const packageName = `X_PUBLISHING_PACKAGE_${metadata.date}.md`;
    if (files.includes(packageName)) {
      const { source: packageSource } = await load(packageName);
      requireText(packageName, packageSource, xName, "対象のX原稿名が一致しません");
      requireText(packageName, packageSource, adopted, "X原稿の投稿文が一致しません");
      requireText(packageName, packageSource, metadata.media, "X原稿の添付画像が一致しません");
      requireText(packageName, packageSource, metadata.media_alt, "X原稿の代替テキストが一致しません");
      requireText(packageName, packageSource, metadata.review_24h, "24時間後の確認日が一致しません");
      requireText(packageName, packageSource, metadata.review_7d, "7日後の確認日が一致しません");
    }
  }
  if (!source.includes("## 公開後に記録")) addError(xName, "公開後の記録欄がありません");
  if (!source.includes("- 読者が使った言葉:")) addError(xName, "読者の言葉を残す欄がありません");
  if (!source.includes("- 次の投稿で直すこと:")) addError(xName, "次の投稿へ学びを戻す欄がありません");
}

if (noteName) {
  const { source } = await load(noteName);
  const metadata = frontmatter(source);
  const h1 = source.match(/^#\s+.+$/gm) ?? [];
  const h2 = source.match(/^##\s+.+$/gm) ?? [];
  const title = h1[0]?.replace(/^#\s+/, "") ?? "";
  const readerDateMatch = source.match(/^更新日:\s*(\d{4})年(\d{1,2})月(\d{1,2})日$/mu);
  const textLength = Array.from(markdownText(source)).length;
  if (!metadata) {
    addError(noteName, "公開管理用のfrontmatterがありません");
  } else {
    if (metadata.channel !== "note") addError(noteName, "channelはnoteにしてください");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(metadata.date ?? "")) {
      addError(noteName, "dateはYYYY-MM-DD形式にしてください");
    }
    if (!["ready", "published", "hold"].includes(metadata.status)) {
      addError(noteName, `statusが不正です（${metadata.status ?? "未設定"}）`);
    }
    checkEditorialMetadata(noteName, metadata);

    const cover = metadata.cover;
    if (!cover) {
      addError(noteName, "noteの見出し画像が未設定です");
    } else {
      const coverPath = path.resolve(rootDir, cover);
      if (!coverPath.startsWith(`${rootDir}${path.sep}`)) {
        addError(noteName, "見出し画像はプロジェクト内のファイルを指定してください");
      } else {
        try {
          await access(coverPath);
          const dimensions = await imageDimensions(coverPath);
          if (!dimensions) {
            addError(noteName, "見出し画像の寸法を確認できません");
          } else {
            const ratio = dimensions.width / dimensions.height;
            if (dimensions.width < 1200 || dimensions.height < 630) {
              addError(noteName, `見出し画像が小さすぎます（${dimensions.width}×${dimensions.height}）`);
            }
            if (ratio < 1.75 || ratio > 2) {
              addError(noteName, `見出し画像の横長比率がnote向けではありません（${ratio.toFixed(2)}:1）`);
            }
          }
        } catch {
          addError(noteName, `見出し画像が見つかりません（${cover}）`);
        }
      }
    }

    if (!metadata.cover_alt || Array.from(metadata.cover_alt).length < 20) {
      addError(noteName, "見出し画像の代替テキストを20文字以上で設定してください");
    }

    const tags = (metadata.tags ?? "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    if (tags.length < 3 || tags.length > 7) {
      addError(noteName, `noteのタグは3〜7個にしてください（現在${tags.length}個）`);
    }
    if (new Set(tags).size !== tags.length) addError(noteName, "noteのタグが重複しています");
    for (const requiredTag of ["小学1年生", "算数", "文章題"]) {
      if (!tags.includes(requiredTag)) addError(noteName, `重点テーマのタグ「${requiredTag}」がありません`);
    }
  }
  if (h1.length !== 1) addError(noteName, `h1は1つ必要です（現在${h1.length}）`);
  if (h2.length < 4) addError(noteName, `見出しが不足しています（現在${h2.length}）`);
  if (!title.includes("1年生") || !title.includes("足し算") || !title.includes("文章題")) {
    addError(noteName, "重点検索意図に合う学年・単元・文章題がタイトルにありません");
  }
  if (!readerDateMatch) {
    addError(noteName, "読者向けの更新日がありません");
  } else if (metadata) {
    const readerDate = [
      readerDateMatch[1],
      readerDateMatch[2].padStart(2, "0"),
      readerDateMatch[3].padStart(2, "0"),
    ].join("-");
    if (readerDate !== metadata.date) {
      addError(noteName, `更新日と公開管理日が一致しません（更新日${readerDate} / 公開管理日${metadata.date}）`);
    }
  }
  if (textLength < 900) addError(noteName, `保存版として本文が短すぎます（${textLength}文字）`);
  if (textLength > 3500) addError(noteName, `スマホで読む保存版として長すぎます（${textLength}文字）`);
  if (!source.includes(targetUrl)) addError(noteName, "重点教材へのURLがありません");
  if (!source.includes("けいさんランド")) addError(noteName, "けいさんランド名がありません");
  if (!source.includes("mext.go.jp") || !source.includes("nier.go.jp")) {
    addError(noteName, "教育内容の参考にした公的資料が不足しています");
  }
  checkClaims(noteName, source);
  checkParagraphs(noteName, source, 120);

  if (metadata?.date) {
    const packageName = `NOTE_PUBLISHING_PACKAGE_${metadata.date}.md`;
    try {
      const { source: packageSource } = await load(packageName);
      requireText(packageName, packageSource, noteName, "対象のnote原稿名が一致しません");
      requireText(packageName, packageSource, title, "note原稿のタイトルが一致しません");
      requireText(packageName, packageSource, metadata.cover, "note原稿の見出し画像が一致しません");
      requireText(packageName, packageSource, metadata.cover_alt, "note原稿の代替テキストが一致しません");
      requireText(packageName, packageSource, targetUrl, "重点教材URLがありません");
      requireText(packageName, packageSource, "24時間後", "24時間後の記録欄がありません");
      requireText(packageName, packageSource, "7日後", "7日後の記録欄がありません");
    } catch {
      addError(noteName, `公開パッケージが見つかりません（${packageName}）`);
    }
  }
}

if (substackName) {
  const { source } = await load(substackName);
  const metadata = frontmatter(source);
  const title = source.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? "";
  const h2 = source.match(/^##\s+.+$/gm) ?? [];
  if (!metadata) {
    addError(substackName, "公開管理用のfrontmatterがありません");
  } else {
    if (metadata.channel !== "substack") addError(substackName, "channelはsubstackにしてください");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(metadata.date ?? "")) {
      addError(substackName, "dateはYYYY-MM-DD形式にしてください");
    }
    if (!["ready", "published", "hold"].includes(metadata.status)) {
      addError(substackName, `statusが不正です（${metadata.status ?? "未設定"}）`);
    }
    checkEditorialMetadata(substackName, metadata);
  }
  if (!/（開発日記 #\d+）$/u.test(title)) addError(substackName, "タイトル末尾の開発日記番号がありません");
  if (h2.length < 2) addError(substackName, `見出しが不足しています（現在${h2.length}）`);
  if (!source.includes(targetUrl)) addError(substackName, "記事内容と一致する教材URLがありません");
  if (!source.includes(homeUrl)) addError(substackName, "文末のけいさんランドURLがありません");
  if (!source.includes("けいさんランド")) addError(substackName, "けいさんランド名がありません");
  checkClaims(substackName, source);
  checkParagraphs(substackName, source, 120);

  if (metadata?.date) {
    const packageName = `SUBSTACK_PUBLISHING_PACKAGE_${metadata.date}.md`;
    try {
      const { source: packageSource } = await load(packageName);
      requireText(packageName, packageSource, substackName, "対象のSubstack原稿名が一致しません");
      requireText(packageName, packageSource, title, "Substack原稿のタイトルが一致しません");
      requireText(packageName, packageSource, targetUrl, "重点教材URLがありません");
      requireText(packageName, packageSource, homeUrl, "けいさんランドURLがありません");
      requireText(packageName, packageSource, metadata.review_24h, "24時間後の確認日が一致しません");
      requireText(packageName, packageSource, metadata.review_7d, "7日後の確認日が一致しません");
    } catch {
      addError(substackName, `公開パッケージが見つかりません（${packageName}）`);
    }
  }
}

console.log("けいさんランド 発信原稿QA");
console.log(`対象: ${[...readyXNames, noteName, substackName].filter(Boolean).join(" / ")}`);
console.log(`エラー: ${errors.length} / 注意: ${warnings.length}`);

for (const warning of warnings) console.log(`注意: ${warning}`);
for (const error of errors) console.error(`エラー: ${error}`);

if (errors.length > 0) process.exitCode = 1;
else console.log("PASS: X・note・Substackの媒体別必須条件を確認しました。");
