# Search Consoleチェックリスト 2026-06-21

対象:

- https://keisan-land.netlify.app/grade3-multiplication-word-problems.html
- https://keisan-land.netlify.app/grade3-division-word-problems.html

## デプロイ後に確認すること

1. 本番ページが表示できる
2. 問題が10問ある
3. 答えが10個ある
4. 印刷ボタンが表示されている
5. スマホで文字切れや横はみ出しがない
6. 印刷プレビューで問題と答えが分かれて出る
7. sitemap.xml に2ページが含まれている

## Search Consoleで行うこと

1. sitemap.xml の検出URL数を確認する
2. `grade3-multiplication-word-problems.html` をURL検査する
3. `grade3-division-word-problems.html` をURL検査する
4. インデックス登録をリクエストする
5. 検索パフォーマンスで表示回数、クリック数、検索クエリを記録する

## PROJECT_STATUS.mdに残すこと

- 本番表示確認の結果
- スマホ確認の結果
- 印刷プレビュー確認の結果
- URL検査の結果
- インデックス登録リクエストの結果
- sitemap検出URL数
