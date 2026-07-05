# けいさんランド 引き継ぎ書

作成日: 2026-06-23

## 最上位方針

けいさんランドは、「AIっぽく派手に見せること」ではなく、「親が安心して子どもに使わせられる無料学習サイト」を目指す。

判断に迷ったら、次の順番で優先する。

1. 子どもが安全に使えること
2. 保護者や先生が安心できること
3. 学習内容が正確で分かりやすいこと
4. 無料学習サイトとして長く運営できること
5. 見た目や演出が楽しく、でも邪魔にならないこと

## 現在の大方針

2026年6月23日時点では、Search Consoleの数字を追いすぎず、教材品質と使いやすさを積み上げる方針。

教材は増やす。ただし、一気に大量追加しない。

- 1回に増やす教材ページは1〜2ページ
- 既存ページの型を使う
- 答えミスを必ず確認する
- 学年に合った内容にする
- スマホと印刷を確認する
- sitemapと内部リンクを更新する
- 作業後に `PROJECT_STATUS.md` へ記録する

合言葉:

- どんどん増やす
- でも雑には増やさない
- 小さく、確実に、信頼を守る

## 現在のページ状況

HTMLページ数: 22

sitemap登録URL数: 22

主要ページ:

- トップページ: `index.html`
- 使い方: `how-to-use.html`
- 先生向け印刷利用ガイド: `teacher-print.html`
- 夏休み前の計算ドリル準備: `summer-2026.html`
- 運営者情報: `about.html`
- プライバシーポリシー: `privacy.html`
- お問い合わせ: `contact.html`
- sitemap: `sitemap.xml`
- robots: `robots.txt`

## 主な教材ページ

小学1年生:

- `grade1-addition.html`
- `grade1-subtraction.html`
- `grade1-addition-word-problems.html`
- `grade1-subtraction-word-problems.html`

小学2年生:

- `grade2-addition.html`
- `grade2-subtraction.html`
- `grade2-addition-word-problems.html`
- `grade2-subtraction-word-problems.html`
- `grade2-kuku.html`

小学3年生:

- `grade3-multiplication.html`
- `grade3-multiplication-2digit.html`
- `grade3-multiplication-word-problems.html`
- `grade3-division.html`
- `grade3-division-remainder.html`
- `grade3-division-word-problems.html`

## 直近で完了した重要作業

2026-06-22に完了したこと:

- OGP画像 `ogp-image.png` の日本語文字化けを修正
- Xのキャッシュ対策として `ogp-image-20260622.png` を追加
- `index.html` のOGP、Twitterカード、構造化データを新OGP画像へ変更
- トップページに「目的に合わせて選べます」セクションを追加
- 「夏休み前に復習する」「印刷して配る」「はじめて使う」の導線を追加
- 先生向け印刷利用ガイド `teacher-print.html` を追加
- 全HTMLページから `teacher-print.html` へ導線を追加
- `sitemap.xml` を更新
- Substack #04 の下書きを作成し、Chrome連携でSubstack下書きまで保存
- 社長側でX投稿、Substack #04、スマホ画面確認まで実施済み
- 本番デプロイ後、主要URLと新OGP画像の200応答を確認済み

本番確認済みURL:

- `https://keisan-land.netlify.app/`
- `https://keisan-land.netlify.app/ogp-image-20260622.png`
- `https://keisan-land.netlify.app/teacher-print.html`
- `https://keisan-land.netlify.app/sitemap.xml`
- `https://keisan-land.netlify.app/teacher-print`
- `https://keisan-land.netlify.app/how-to-use`
- `https://keisan-land.netlify.app/summer-2026`

## Search Consoleについて

Search Consoleは、しばらく優先度を下げる。

理由:

- すぐ数字が増えないと気持ちが削られる
- 今は数字確認より、教材品質と使いやすさを増やす時期
- 確認するなら週1回程度でよい

新しいチャットでSearch Consoleを強く勧めすぎないこと。

## 次にやる最有力候補

小学3年生「あまりのある割り算の文章問題」ページを1つ追加する。

理由:

- 既に `grade3-division-remainder.html` がある
- 小学3年生の割り算教材の自然な次の一手
- 夏休み前の復習教材として使いやすい
- 1ページ追加で品質管理しやすい

作業イメージ:

1. 既存の文章問題ページの型を確認する
2. `grade3-division-remainder-word-problems.html` を作る
3. あまりのある割り算の文章問題を10問作る
4. 答え一覧を作る
5. 印刷しやすい構成にする
6. トップページ、小学3年生関連ページ、夏休みページ、使い方ページなどから必要な内部リンクを追加する
7. `sitemap.xml` に追加する
8. QAでリンク、h1、description、canonical、問題数、答え数、答えの正確性を確認する
9. `PROJECT_STATUS.md` に記録する

## 新教材追加時のQAチェック

必ず確認すること:

- h1は1つだけ
- title、description、canonicalがある
- 問題数と答え数が一致している
- 答えが正しい
- 学年に合った難易度
- 割り算は意図したあまりになっている
- 印刷時に問題と答えが分かれて使いやすい
- スマホで文字が詰まらない
- 内部リンク切れがない
- 画像切れがない
- `sitemap.xml` に追加されている

## 発信運用

運用中:

- X
- Substack
- note

方針:

- 宣伝よりも開発記録と信頼の積み上げを優先する
- 「なぜこの教材を作ったか」を残す
- 保護者や先生が安心できる言葉を使う
- 過度な煽り、成果誇張、不安をあおる表現は避ける

直近の発信:

- Substack #04 実施済み
- X投稿実施済み
- `x-posts-2026-06-22.md` に投稿案あり

## AI社員の役割

SEO担当:

- title、description、h1、canonical、sitemap、内部リンクを確認
- ただし、Search Console数字を毎回追いすぎない

UX担当:

- スマホ表示、ボタン、読みやすさ、印刷導線を確認
- 子ども、保護者、先生が迷わない画面にする

教材担当:

- 学年に合った正確な問題を作る
- 答えミス、難易度ミスを防ぐ

QA担当:

- リンク、画像、問題数、答え、印刷、スマホを確認
- 未確認のまま完了扱いにしない

収益化担当:

- 今は広告や収益化を急がない
- 信頼できる教材と導線の土台を優先する

編集長:

- 全体方針を守る
- 作業後に `PROJECT_STATUS.md` を更新する
- 迷ったら「親が安心して子どもに使わせられる無料学習サイト」に近づくかで判断する

## 新しいチャット開始時に読むファイル

最初に読むこと:

1. `AGENTS.md`
2. `PROJECT_STATUS.md`
3. `SUMMER_2026_STRATEGY.md`
4. `HANDOFF_TO_NEW_CHAT.md`

## 新しいチャットへの依頼文例

```text
けいさんランドの作業を続けます。
AGENTS.md、PROJECT_STATUS.md、SUMMER_2026_STRATEGY.md、HANDOFF_TO_NEW_CHAT.md を読んで、現在の状況を把握してください。

最上位方針は「親が安心して子どもに使わせられる無料学習サイト」です。
Search Consoleの数字確認はしばらく優先度を下げ、教材品質と使いやすさを少しずつ積み上げる方針です。

まず今日やるべきことを整理し、必要な作業を進めてください。
```

