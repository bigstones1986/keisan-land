# けいさんランド 品質自動点検

ページ、教材、発信原稿、AI社員制度、社長用投稿ボックスを変更したあと、公開前に品質点検を実行します。

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

## AI発信承認ゲートの点検

```powershell
npm run qa:autopublish
```

確認する内容:

- 編集、QA、安全、公開承認の4工程
- 全工程とpayloadのcontent_hash一致
- Green、Yellow、Redの引き渡し判断
- 個人情報、保証表現、禁止テーマ、許可外URL
- 投稿上限、予定時刻、投稿経路、公開台帳
- XのWeb自動操作など、許可されていない投稿経路
- 外部投稿が無効な状態で実投稿しないこと

安全な模擬投稿は通し、危険・不一致・未承認・無効経路の模擬投稿は拒否できた場合だけ合格とします。

## 社長用投稿ボックスの点検

```powershell
npm run qa:draft-inbox
```

確認する内容:

- 完成稿がGreenかつ90点以上
- 編集、QA、安全、引き渡しの4工程が別のreview_idで承認済み
- 4工程と原稿ファイルのSHA-256が一致
- 原稿の日付、媒体、`ready`、`owner_ready`が投稿ボックスと一致
- Xは最大5本、Substackとnoteは各2本
- 外部投稿の最後の操作が社長に固定されている

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
