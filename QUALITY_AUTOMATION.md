# けいさんランド 品質自動点検

ページ、教材、発信原稿、AI社員制度を変更したあと、公開前に品質点検を実行します。

まとめて実行する場合:

```powershell
npm run qa
```

## AI社員制度の点検

```powershell
node tools\employee-system-qa.mjs
```

確認する内容:

- 発信、編集、教材品質、検索露出など必須社員の目的と禁止事項
- L1からL4の成熟度と、証拠なし昇格の禁止
- 発信、教材、検索露出、紹介・信頼の改善ループ
- 分析から実行、QA、結果確認までの引き継ぎ
- `ready`、`verify`、`reschedule`、`published`、`review`、`hold`の状態管理

## サイト全体の点検

```powershell
node tools\site-audit.mjs
```

確認する内容:

- 全HTMLのtitle、meta description、canonical、h1、robots
- title、説明文、canonicalの重複
- 内部リンク、CSS、JavaScript、画像の参照先
- 画像のalt属性
- JSON-LDの形式
- canonicalとsitemap.xmlの一致

## 毎日ステップ計算の点検

```powershell
node tools\step-calculation-qa.mjs
```

確認する内容:

- 17ステップを各1,000問、合計17,000問生成
- 足し算、引き算、九九、掛け算、割り算の答え
- 各学年・ステップの出題範囲
- あまりのある割り算の商とあまり
- 全角数字入力の変換

`npm run qa`に含まれるすべての点検が `PASS` になってから公開します。

## 自動実行

- GitHubの `main` へ送信したときと、プルリクエスト作成時に自動点検します。
- Netlifyも公開処理の前に `npm run qa` を実行します。
- 点検が失敗した場合は公開処理が止まり、問題のある状態を本番へ出しにくくします。
