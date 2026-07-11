import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";

const REPORT_DIR = "search-console-private/reports";
const OUTPUT_DIR = "substack-private";

function today() {
  return new Date().toISOString().slice(0, 10);
}

async function latestReport() {
  try {
    const files = (await readdir(REPORT_DIR))
      .filter((file) => file.endsWith(".md"))
      .sort();
    if (!files.length) return { name: "", content: "Search Consoleレポートはまだありません。" };
    const name = files[files.length - 1];
    return { name, content: await readFile(`${REPORT_DIR}/${name}`, "utf8") };
  } catch {
    return { name: "", content: "Search Consoleレポートはまだありません。" };
  }
}

function tail(text, marker, maxLength = 7000) {
  const index = text.lastIndexOf(marker);
  const sliced = index >= 0 ? text.slice(index) : text.slice(-maxLength);
  return sliced.length > maxLength ? sliced.slice(-maxLength) : sliced;
}

async function main() {
  const date = today();
  const status = await readFile("PROJECT_STATUS.md", "utf8");
  const report = await latestReport();
  const recentStatus = status.slice(-9000);

  const brief = `# Substack下書きブリーフ ${date}

## 今日の材料

- PROJECT_STATUS.md の最新記録
- Search Console最新レポート: ${report.name || "なし"}
- 毎日ステップ計算
- 自動デプロイ
- Search Console API自動レポート

## 今日の有力タイトル案

毎日ちょっとずつ進める計算ドリルを、1年生から3年生まで広げました（開発日記 #11）

## 伝えること

- けいさんランドは派手さより、安心して使える学習サイトを目指している
- 毎日ステップ計算を1年生から3年生まで広げた
- あまりのあるわり算は、商とあまりを分けて入力できるようにした
- デプロイとSearch Console確認も少しずつ自動化している
- まだGoogleに認識されていないページもあるので、焦らず観測する

## Search Console要約

${report.content}

## PROJECT_STATUS 抜粋

${recentStatus}

## 文末案内

けいさんランドでは、小学生向けの無料計算ドリルを少しずつ作っています。
登録不要で、スマホでも印刷でも使えます。

けいさんランドはこちら:
https://keisan-land.netlify.app/

毎日ステップ計算はこちら:
https://keisan-land.netlify.app/step-calculation
`;

  await mkdir(OUTPUT_DIR, { recursive: true });
  const outputPath = `${OUTPUT_DIR}/${date}-brief.md`;
  await writeFile(outputPath, brief, "utf8");
  console.log(brief);
  console.log(`\n保存先: ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
