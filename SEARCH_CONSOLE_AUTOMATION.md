# Search Console 自動レポート設定手順

目的:

- Search Consoleの数字を手動で見に行かなくても、クリック数、表示回数、CTR、平均順位、URL検査結果をローカルでレポート化する。
- インデックス登録リクエストはGoogle公式APIでは自動送信できないため、必要なURLだけSearch Console画面で手動リクエストする。

## できること

- 検索パフォーマンスの取得
- ページ別・検索語別の上位確認
- 重要URLのインデックス状態確認
- ローカル非公開フォルダ `search-console-private/reports/` へのレポート保存

## できないこと

- Search Consoleの「インデックス登録をリクエスト」ボタンをAPIで自動クリックすること

## 最初に社長がやること

1. Google Cloud Consoleを開く
   - https://console.cloud.google.com/
2. 新しいプロジェクトを作る
   - 例: `keisan-land-search-console`
3. APIライブラリで `Google Search Console API` を有効化する
4. OAuth同意画面を設定する
   - User Type: 外部でも内部でも、選べる方でOK
   - アプリ名: `けいさんランド Search Console レポート`
   - テストユーザーに社長のGoogleアカウントを追加
5. 認証情報でOAuthクライアントIDを作る
   - アプリケーションの種類: デスクトップアプリ
   - 名前: `keisan-land-local-report`
6. JSONをダウンロードして、この名前でプロジェクト直下に置く
   - `gsc-oauth-client.json`

このJSONは秘密情報なので、GitHubには上げない。
`.gitignore` で除外済み。

## 初回認証

プロジェクト直下で実行:

```bash
node tools/search-console-auth.mjs
```

表示されたURLをブラウザで開き、Search Consoleを使っているGoogleアカウントで承認する。
成功すると `gsc-token.json` が作成される。

このファイルも秘密情報なので、GitHubには上げない。
`.gitignore` で除外済み。

## レポート作成

```bash
node tools/search-console-report.mjs
```

レポートはここに保存される:

```text
search-console-private/reports/YYYY-MM-DD.md
```

## 毎朝自動化する場合

Windowsのタスクスケジューラで、毎朝1回次を実行する。

プログラム:

```text
node
```

引数:

```text
tools/search-console-report.mjs
```

開始フォルダ:

```text
C:\Users\taka0\Documents\keisan-land
```

## 見るべきポイント

- 表示回数が増えたページ
- 表示はあるがクリックされていない検索語
- `step-calculation.html` や `first-time.html` のインデックス状態
- 登録されていない重要ページ

## 注意

- Search Consoleのデータは数日遅れることがあるため、レポートは基本的に3日前のデータを見る。
- URL検査APIは状態確認用で、ライブテストや登録リクエスト自体はできない。
