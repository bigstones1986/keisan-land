# 2026-07-25 日次成長レポート

## 今日の重点

検索表示の母数を増やすため、分析担当、検索露出改善担当、SEO担当を、需要発見から7日後判定まで再現できるチームへ育成する。

## Search Console

- 確認日: 2026年7月25日
- 確認方法: Chrome
- データ最終日: 2026年7月22日

### サイト全体

| 期間 | クリック | 表示回数 | CTR | 平均掲載順位 |
| --- | ---: | ---: | ---: | ---: |
| 直近7日 | 1 | 6 | 16.7% | 8.0 |
| 直近28日 | 4 | 41 | 9.8% | 12.0 |

### 重点ページ

`https://keisan-land.netlify.app/grade1-addition-word-problems.html`

- 直近7日: 表示なし
- 直近28日: 1クリック、15表示
- 直近28日CTR: 6.7%

### 重点検索語

- `足し算 文章題 1年生`: 0クリック、2表示、平均9.0位
- `1年生 足し算 文章問題`: 0クリック、1表示、平均10.0位
- 直近7日に表示された非匿名クエリ: `けいさんドリル`、0クリック、1表示

### 前回との比較

- 直近7日の表示回数は6回で変わらない
- 直近7日のクリックは2回から1回
- 直近28日の表示回数は41回で変わらない
- 直近28日の平均掲載順位は13.2位から12.0位へ改善
- 重点ページの28日表示は17回から15回
- 重点検索語の表示は合計3回のまま

母数が少ないため、クリックやCTRの1件差だけで主要要素を変えない。

## 担当別レビュー

- 分析担当: 平均掲載順位は改善したが、表示回数が増えていない。匿名化クエリがあるため、表に見える検索語の合計をサイト全体と同一視しない。
- 検索露出改善担当: 重点語の表記違いを一つのクエリ群にまとめ、重点ページだけを案内先にする。
- SEO担当: 現在のtitle、description、h1、本文には、無料、登録不要、毎回ちがう10問、答え、印刷、図がそろっている。7月29日まで固定する。
- 発信戦略責任者: 7月24日に公開したnoteとSubstackから重点ページへのリンクを維持し、外部入口として観測する。
- QA担当: 変更した要素と変えなかった要素、確認日を自動検査する。
- 編集長: 新しい役職を増やさず、既存3担当へ検索需要、検索結果観察、ページ対応表、7日後判定を追加する。

## 検索結果観察

近い検索では、長期間運営されている無料プリントページとPDF教材が表示される。

けいさんランドは、次の実在価値で差を作る。

- ブラウザでそのまま解ける
- 毎回ちがう10問
- 答えが10まで
- 場面、丸の図、式をつなぐ
- 問題と答えを印刷できる
- 登録不要、無料

競合の見出しや本文は使わない。

## 編集長判断

- 採用:
  - 検索成長AI社員プレイブック
  - 検索機会スコア
  - ページ・検索語対応表
  - 検索結果観察
  - 7月29日まで重点ページの主要SEO要素を固定
- 保留:
  - title、description、h1の再変更
  - 重点語に似た新規ページ
  - Search Consoleの登録リクエスト
- やらない:
  - 順位だけを成果にする
  - 上位ページの表現を写す
  - 薄いページを量産する
  - 1日の変動で成功・失敗を決める

## 実施内容

- `SEARCH_GROWTH_EMPLOYEE_PLAYBOOK.md`を作成
- `SEARCH_OPPORTUNITY_MAP_2026-07-25.md`を作成
- 分析担当へ集計差と匿名化クエリの確認を追加
- 検索露出改善担当へクエリ群、検索機会スコア、検索結果観察を追加
- SEO担当へ一意な案内先と検索結果の約束の照合を追加
- AI社員制度QAへ検索成長能力と実データの検査を追加
- 検索露出改善担当をL2からL3へ更新

## 100点評価

- 事実の正確さ: 20/20
- 役割分担: 20/20
- 再現可能性: 20/20
- 暴走防止: 20/20
- 結果学習: 16/20
- 合計: 96/100

結果学習は7月29日の7日比較を完走していないため満点にしない。

## 確認結果

- AI社員制度QA: エラー0
- サイト点検: 27ページ、エラー0、注意0
- 教材完成度: 180/180
- 計算と文章題: 37,000問PASS
- 発信原稿QA: エラー0、注意0
- 公開用フォルダ: 47ファイル、HTML 27ページ

## AI社員ダッシュボード

- ローカル専用の`employee-dashboard`を作成
- 育成マトリクス、4交代勤務、活動履歴、Search Console、社長用投稿ボックスを自動集計
- 00:30、06:30、12:30、20:30の毎日4勤務を有効化
- `ACTIVE`は稼働予約済み、活動ログがある仕事だけを完了として表示
- 外部公開、送信、広告費、Search Console送信は自動実行しない
- ダッシュボードQA: AI社員16名、自動勤務4/4、活動履歴2件、エラー0

表示確認:

- 組み込みブラウザではローカルURLが安全設定で遮断された
- HTML、CSS、JavaScript、データ、スマホ用レイアウトを自動検査
- 初回の`open-ai-employee-dashboard.cmd`はWindowsの改行解釈で失敗
- 1行の起動入口とPowerShell処理へ分離し、実行成功を確認
- 社長は`open-ai-employee-dashboard.cmd`から更新して開ける

## 未確認事項

- Search Consoleが認識した外部リンクの最新値
- noteとSubstackの24時間後の閲覧、反応、教材流入
- 重点語が複数日に表示されるか
- 7月24日公開記事がGoogleに認識される時期

## 次回

- 2026年7月25日22時55分以降: noteとSubstackの24時間後確認
- 2026年7月29日: 同条件で検索露出の7日比較
- 2026年7月31日: 公開済みnote・Substackの7日後確認
- 2026年7月31日: L4昇格可否と8月の検索テーマを判断

## 昼の改善勤務 12時30分

`ready` の仕事は1件あったが、`公開済みnote・Substackの24時間後確認` の期限は 2026年7月25日22時55分で未到来だった。

検索の7日比較も 2026年7月29日待ちのため、今日は主要SEO要素を変えず、公開済み発信の受け皿である重点ページ `grade1-addition-word-problems.html` の教材品質確認を次の最優先仕事として追加した。

追加した仕事:

- `qa-focus-page-mobile-print`
- 内容: 重点ページのスマホ390px相当、印刷、関連導線を確認し、結果と未確認を分けて残す
- 理由: 公開済みnoteとSubstackが同じ重点ページへ直接案内しており、検索比較条件を崩さずに読者価値と安全性を上げられるため
- ダッシュボード更新: AI社員16名、AI判断2/2、仕事待ち2件、活動履歴3件
- ダッシュボードQA: エラー0

変えなかった要素:

- title
- description
- h1
- 本文の主要訴求

未確認のまま残したこと:

- noteとSubstackの24時間後の閲覧、反応、教材流入
- Search Consoleの7日比較結果

## 昼の改善勤務 重点ページのスマホ・印刷QA

`qa-focus-page-mobile-print` を完了した。対象は重点ページ `grade1-addition-word-problems.html` で、主要SEO要素は固定したまま教材品質と受け皿品質だけを確認した。

確認結果:

- `http://127.0.0.1:4173/grade1-addition-word-problems.html` をローカル配信し、390px相当で冒頭、丸の図、関連ドリル、フッターまで崩れなし
- `新しい10問` は10問を生成し、`答えを見る` は10件の答えを開閉できた
- 関連導線9件は localhost 上ですべて 200
- console warn/error は 0
- `npm.cmd run qa:word-problems`: `PASS: 小学1年生の足し算文章題 10,000問を確認しました。`
- 印刷は `style.css` の `@media print` 分岐と `grade1-addition-word-problems.js` の `print-generated-word-problems` 切替を確認

未確認事項:

- OSの印刷プレビュー画面そのものの目視確認
- 2026年7月25日22時55分以降のnote・Substack 24時間後結果
- 2026年7月29日のSearch Console 7日比較結果

次の一手:

1. 2026年7月25日22時55分以降に `review-published-longform-24h` を開始する
2. 2026年7月29日に `search-exposure-7d-review` を同条件で実施する

## 昼の改善勤務 期限前キュー整理と7日後確認追加

2026年7月25日15時51分時点で、期限到来済みまたは期限なしの `ready` 仕事はなかった。

- `review-published-longform-24h` は 2026年7月25日22時55分まで未到来
- `search-exposure-7d-review` は 2026年7月29日待ち
- 公開済みnoteとSubstackの `review_7d` は 2026年7月31日で、仕事キュー未登録だった

対応:

- `review-published-longform-24h` を `ready` から `waiting` へ修正
- `review-published-longform-7d` を `waiting` で1件追加
- 主要SEO要素、新規発信、外部送信は実施していない

確認結果:

- 仕事キューは `ready` 0件、`waiting` 3件、`completed` 1件
- 追加した仕事は `review-published-longform-7d` の1件だけ
- 次に動く仕事は時刻順で、2026年7月25日22時55分の24時間後確認、2026年7月29日の検索露出7日比較、2026年7月31日の公開済み発信7日後確認

未確認事項:

- 2026年7月25日22時55分以降のnote・Substack 24時間後結果
- 2026年7月29日のSearch Console 7日比較結果
- 2026年7月31日の公開済みnote・Substack 7日後結果

## AI社員カンパニー自律運営への移行

社長の要望:

- 勤務表を眺める画面ではなく、AI社員が常に動くゲーム風の運営室にする
- 固定時刻の作業だけでなく、検索上位へ向けて自分で次の仕事を選ぶ

実施内容:

- PC起動中に動く `tools/ai-company-runtime.mjs` を作成
- 20秒ごとの心拍、30秒ごとの画面更新、15分ごとの運営室QA、変更後サイトQA、6時間ごとの全社QAを実装
- `AI_EMPLOYEE_WORK_QUEUE.json`へ期限、優先度、成功条件、許可操作、禁止操作、失敗回数を記録
- 固定の00:30、06:30、12:30勤務を廃止
- `けいさんランド自律成長ディレクター`を1時間ごとの判断パルスへ変更
- 20:30のnote・Substack下書きは締切担当として維持
- Windowsログイン時の自動起動を登録
- ダッシュボードへ4つの作業エリア、動くAI社員、ライブコードログ、仕事キューを追加

事実として確認できた自律行動:

- 期限未到来の24時間後確認を完了扱いせず`waiting`へ修正
- 重点ページのスマホ・印刷QAを自分で一件だけ起票
- スマホ390px相当、10問生成、答え表示、関連導線9件、consoleエラー0、文章題10,000問を確認
- 7月31日の公開記事7日後確認を重複なく追加

安全境界:

- 外部投稿、公開、送信、広告費、Search Console送信は自動実行しない
- 一度に変える主要要素は一つ
- 同じ仕事が3回失敗したら自動停止
- 心拍が90秒を超えたら画面上のキャラクターとライブ表示も停止

未確認:

- Windows再ログイン後に常駐監督が自動起動する実地結果
- ゲーム風画面の組み込みブラウザによるスクリーンショット
- 7日後結果を次の優先順位へ戻すL4学習

最終QA:

- AI社員: 16名
- AI判断担当: 2/2有効
- 仕事キュー: 5件
- ダッシュボードQA: エラー0
- サイト: 27ページ、エラー0、注意0
- 教材: 37,000問PASS、完成度180/180
- 発信と安全ゲート: エラー0
- 公開用フォルダ: 47ファイル、HTML 27ページ

## 社長ToDoの可視化

採用判断:

- 社長にしかできない外部操作だけを、ライブ運営室の独立したタブへ集約する
- 期限超過、今日、今後の順に並べ、クリックで具体的な操作とAI確認結果を表示する
- 投稿待ちは既存の投稿ボックスから自動集約し、その他は専用台帳へ記録する

実施:

- `社長ToDo`タブ、件数表示、優先順位、詳細展開、原稿への入口を追加
- 現在の投稿待ち3件を、期限超過1件、今日1件、今後1件として表示
- AI社員が今後の社長専用作業を登録する`OWNER_ACTIONS.json`を追加
- 完了報告や外部確認なしに、ToDoを完了扱いにしないルールを追加

確認:

- AI承認4/4の投稿待ち3件と社長ToDo 3件が一致
- ダッシュボード生成とQAはエラー0
- JavaScript構文と優先順を確認
- 実ブラウザのローカル画面接続は未確認

## 夕方の改善勤務 公開済み発信の受け皿導線QA

2026年7月25日16時台の時点でも、期限到来済みまたは期限なしの `ready` 仕事は 0 件だった。

- `review-published-longform-24h` は 2026年7月25日22:55 JST まで未到来
- `search-exposure-7d-review` は 2026年7月29日待ち
- `review-published-longform-7d` は 2026年7月31日待ち

このため、未来タスクを前倒しせず、公開済みnote・Substackの受け皿になっている重点ページ導線の事実確認を一件だけ追加して完了した。

確認内容:

- `OWNER_PUBLISHING_INBOX.json` の `published_entries` を照合し、Substack #12 は重点ページとトップページ、note は重点ページへのリンク確認記録があることを確認
- `index.html`、`how-to-use.html`、`grade1-addition.html` から `grade1-addition-word-problems.html` への導線を確認
- `npm.cmd run qa:site`: 27ページ、エラー0、注意0
- `npm.cmd run qa:publishing`: X 3本、note 1本、Substack 1本、エラー0、注意0

変えなかった要素:

- 重点ページの title
- description
- h1
- 本文の主要訴求
- 外部公開、投稿、送信

未確認事項:

- この実行では公開URLそのもののHTTP到達や画面表示を外部取得で再確認していない
- 2026年7月25日22:55 JST 以降のnote・Substack 24時間後の閲覧、反応、教材流入

次の一手:

1. 2026年7月25日22:55 JST 以降に `review-published-longform-24h` を開始する
2. 公開後24時間の閲覧、反応、教材流入を事実ベースで記録する
3. 次稿で変える一つだけを決める
## 2026-07-25 夕方の改善勤務 3媒体プロフィール導線の社長ToDo起票

現在地:

- 期限到来済みまたは期限なしの `ready` 仕事は 0 件
- `review-published-longform-24h` は 2026年7月25日22:55 JST まで未到来
- `search-exposure-7d-review` と `review-published-longform-7d` も未来時刻待ち
- `PROFILE_CONVERSION_AUDIT_2026-07-15.md` は作成済みだが、外部プロフィール変更はまだ社長ToDoに載っていなかった

担当別意見:

- 発信戦略責任者: プロフィール固定URLを `first-time.html` にそろえると、初めて来た保護者・先生が迷いにくい
- QA担当: `qa:profiles` が PASS なので、更新前の監査素材として十分
- 安全・ブランド監査責任者: 外部プロフィール変更とX固定投稿差し替えは社長操作が必要
- 編集長: 待機中レビューを前倒しせず、今できる準備仕事だけを一件追加して終える

編集長判断:

- 採用:
  - `prepare-profile-conversion-owner-action` を追加して完了
  - `OWNER_ACTIONS.json` に 3媒体プロフィール更新の社長操作を追加
- 保留:
  - 公開画面での変更確認
  - 変更後24時間の反応確認
- やらない:
  - AIによる外部プロフィール変更
  - 未来期限レビューの前倒し

実施内容:

- `PROFILE_CONVERSION_AUDIT_2026-07-15.md` の推奨表示名、自己紹介、固定URL、X固定投稿案を確認
- `npm.cmd run qa:profiles` を実行して PASS を確認
- `OWNER_ACTIONS.json` に、X、Substack、noteの表示名・自己紹介・固定URL、X固定投稿の更新タスクを追加
- 仕事キュー、活動ログ、日次レポートを更新

QA結果:

- `qa:profiles`: PASS
- 仕事キューは `ready` 0件、`waiting` 3件を維持
- 社長ToDoにプロフィール固定URL統一の新規案件を追加

未確認事項:

- 変更後のX、Substack、note公開プロフィール画面
- X固定投稿の旧情報差し替え
- 変更後24時間のプロフィール遷移や反応

次の一手:

1. 社長が `PROFILE_CONVERSION_AUDIT_2026-07-15.md` を見ながら3媒体のプロフィールとX固定投稿を更新する
2. AI社員は更新後の公開画面を確認し、社長ToDoを完了へ移す
3. 2026-07-25 22:55 JST 以降に `review-published-longform-24h` を開始する

## 夜前の改善勤務 期限超過X完成稿のverify整理

2026年7月25日18時台の時点でも、期限到来済みまたは期限なしの `ready` 仕事は 0 件だった。

- `review-published-longform-24h` は 2026年7月25日22:55 JST まで未到来
- `search-exposure-7d-review` は 2026年7月29日待ち
- `review-published-longform-7d` は 2026年7月31日待ち
- `x-posts-2026-07-24.md` だけが候補日超過なのに `owner_ready` のまま残っていた

このため、新規原稿や外部確認を増やさず、公開進行の状態管理を一件だけ正した。

担当別意見:

- 発信進行・公開管理担当: 候補日を過ぎた `ready` は公開証拠がなければ `verify` へ移し、当日以降の完成稿と混ぜない
- X投稿・コミュニティ担当: 7月24日分Xは未公開と断定せず、本文を保ったまま公開確認待ちへ戻す
- QA担当: 原稿、投稿ボックスJSON、投稿ボックスMD、ダッシュボードの表示件数を一致させる
- 編集長: 今回は新しい発信を増やさず、状態の不一致だけを直す

実施内容:

- `x-posts-2026-07-24.md` を `status: verify` へ更新
- `OWNER_PUBLISHING_INBOX.json` から 2026-07-24 分Xを社長投稿待ち一覧から外し、7/25 と 7/27 の2件だけを残した
- `OWNER_PUBLISHING_INBOX.md` にも同じ整理を反映した
- 仕事キュー、活動ログ、日次成長レポートを更新した

QA結果:

- `npm.cmd run qa:publishing`: PASS
- `npm.cmd run qa:draft-inbox`: PASS
- `node tools/build-employee-dashboard.mjs`: 更新成功
- `npm.cmd run qa:dashboard`: PASS

未確認事項:

- 2026-07-24分Xが実際に公開済みか未公開かの外部証拠
- 2026-07-25分Xの当日投稿結果
- 2026-07-25 22:55 JST 以降のnote・Substack 24時間後の閲覧、反応、教材流入

次の一手:

1. 2026年7月25日22:55 JST 以降に `review-published-longform-24h` を開始する
2. 2026-07-24分Xは、公開証拠を確認できたら `published`、未公開を確認できたら `reschedule` へ進める
3. 2026-07-25分と2026-07-27分のX完成稿だけを社長投稿待ちとして維持する

## 2026-07-25 夜の改善勤務 はじめての方ページの導線QA

2026年7月25日19時台の時点でも、期限到来済みまたは期限なしの `ready` 仕事は 0 件だった。

- `review-published-longform-24h` は 2026年7月25日22:55 JST まで未到来
- `search-exposure-7d-review` は 2026年7月29日 06:30 待ち
- `review-published-longform-7d` は 2026年7月31日 22:55 待ち
- `first-time.html` は今後のプロフィール固定URLと入口導線の受け皿だが、今日の改善勤務ではページ自体の主要CTA到達先をまだ確認していなかった

このため、未来タスクを前倒しせず、保護者・先生の初回導線に直結する `first-time.html` の受け皿品質確認を一件だけ追加して完了した。

確認内容:

- `first-time.html` のヒーローCTA、学年カード4件、おすすめ導線5件、終盤CTA、フッター導線を確認
- 相対リンク17件を抽出し、すべて既存ファイルまたは拡張子なしで既存ページへ解決できることを確認
- `step-calculation` は拡張子なし導線でも `step-calculation.html` に解決
- `npm.cmd run qa:site`: 27ページ、エラー0、注意0、PASS

変えなかった要素:

- `first-time.html` の title
- description
- h1
- 本文の主要訴求
- 外部プロフィール、投稿、公開

未確認事項:

- 本番 `first-time.html` の画面そのものの再確認
- 社長による3媒体プロフィール更新後の遷移や反応
- 2026年7月25日22:55 JST 以降のnote・Substack 24時間後の閲覧、反応、教材流入

次の一手:

1. 2026年7月25日22:55 JST 以降に `review-published-longform-24h` を開始する
2. 公開済み記事の24時間後確認とあわせて、`first-time.html` が入口として機能しているかを事実ベースで記録する
3. 社長がプロフィール固定URLを更新した後、公開画面を読んで `OWNER_ACTIONS.json` の完了可否を判断する

## 20時30分 note・Substack毎日下書き

2026年7月25日20時33分の時点で、`review-published-longform-24h` は 2026年7月25日22時55分 JST まで未到来だった。

このため、前日2026年7月24日22時54分公開のnoteと、22時55分公開のSubstackの24時間後確認より先に、新しい長文を重ねて増やさない判断を優先した。

確認できた事実:

- noteはChromeでログイン済みだった。`note.com` のヘッダーに `TK｜2児の父親×AI開発` が表示され、公開済み記事 `小学1年生が足し算の文章題で止まったら。式より先に試したい3つの声かけ` が21時間前の記事として見えた
- `https://note.com/notes/new` からnoteの新規編集画面へ到達できた
- 今日の改善材料は `first-time.html` の導線QAと、3媒体プロフィール固定URLを `first-time.html` へそろえる社長ToDo起票だった
- `https://stone1986.substack.com/publish/posts` へのChrome操作は、ブラウザ安全ポリシーにより拒否された

編集長判断:

- 採用:
  - 今日のnote新規下書きは見送る
  - 今日のSubstack新規下書きは見送る
  - 22時55分以降の24時間後確認を先に進める
- 保留:
  - `first-time.html` とプロフィール更新後の導線を扱う次回長文候補
- やらない:
  - 前日公開記事と読者・教材が近い長文の新規化
  - ブラウザ安全ポリシーを迂回したSubstack操作

理由:

- noteは前日公開記事と題材が近く、今日の追加改善だけでは100点評価90点以上の新規保存版に届かない
- SubstackはChromeで本番下書き保存に必要な publish 画面へ進めなかった

QA結果:

- `npm.cmd run qa:publishing`: PASS
- `npm.cmd run qa:draft-inbox`: PASS
- `node tools/build-employee-dashboard.mjs`: 更新成功
- `npm.cmd run qa:dashboard`: PASS

未確認事項:

- 2026年7月25日22時55分以降のnote・Substack 24時間後の閲覧、反応、教材流入
- 社長による3媒体プロフィール固定URL更新後の遷移変化

次の一手:

1. 2026年7月25日22時55分以降に `review-published-longform-24h` を開始する
2. 新しい読者事実が出た場合だけ、次のnote・Substack題材を再判定する

## 2026-07-25 夜の改善勤務 重点ページの検索7日比較ブリーフ

`ready` の仕事がなく、次の検索レビュー `search-exposure-7d-review` は 2026年7月29日 06:30 JST 待ちだったため、新しいページ改修ではなく判断条件の固定化を一件だけ進めた。

確認できた事実:

- 重点ページは `grade1-addition-word-problems.html`
- データ最終日は 2026年7月22日
- 7日比較対象は 2026年7月16日〜2026年7月22日、28日比較対象は 2026年6月25日〜2026年7月22日
- 重点クエリ群は `1年生・足し算・文章問題`、案内先は1ページへ固定
- 2026年7月29日までは title、description、h1、canonical、主な本文見出し、URL を変えない方針

実施内容:

- `SEARCH_REVIEW_BRIEF_GRADE1_ADDITION_WORD_PROBLEMS_2026-07-25.md` を追加
- 重点ページの基準値、固定要素、確認日、判断条件、2026年7月29日の確認手順を整理
- `prepare-search-review-brief-grade1-addition` を完了として仕事キューへ記録

QA結果:

- ブリーフの数値は `SEARCH_OPPORTUNITY_MAP_2026-07-25.md` と一致
- `node tools/build-employee-dashboard.mjs`: 更新成功
- `npm.cmd run qa:employees`: PASS
- `npm.cmd run qa:dashboard`: PASS

未確認事項:

- 2026年7月25日22:55 JST 以降のnote・Substack 24時間後確認
- 2026年7月29日のSearch Console実測比較

次の一手:

1. 2026年7月25日22時55分以降に `review-published-longform-24h` を開始する
2. 2026年7月29日06時30分以降に `search-exposure-7d-review` を開始する
3. 7日比較が終わるまでは重点ページの主要SEO要素を変えない

## 2026-07-25 夜の改善勤務 公開済み長文の24時間後確認ブリーフ

2026年7月25日21時55分時点でも、期限到来済みまたは期限なしの `ready` 仕事は 0 件だった。

- `review-published-longform-24h` は 2026年7月25日22:55 JST まで未到来
- `search-exposure-7d-review` は 2026年7月29日06:30 JST 待ち
- `review-published-longform-7d` は 2026年7月31日22:55 JST 待ち

このため、未来レビューは前倒しせず、公開済みnote・Substackの24時間後確認で使う専用ブリーフを一件だけ追加して完了した。

確認内容:

- `OWNER_PUBLISHING_INBOX.json` の公開済み2件から、公開URL、公開時刻、重点ページ、確認日を再確認
- `NOTE_PUBLISHING_PACKAGE_2026-07-17.md` と `SUBSTACK_PUBLISHING_PACKAGE_2026-07-28.md` を読み、媒体別の確認済み事実と未確認を整理
- `PUBLISHING_RUNBOOK.md` の24時間後確認項目を、今回の2本専用の記録欄へ固定
- `PUBLISHED_LONGFORM_24H_REVIEW_BRIEF_2026-07-25.md` を追加

変えなかった要素:

- note公開記事のタイトル、本文、リンク
- Substack公開記事のタイトル、本文、リンク
- 重点ページの title、description、h1
- 外部投稿、公開、予約、送信

QA結果:

- ブリーフ内の公開URL、公開時刻、読者、重点ページは台帳と公開パッケージに一致
- `node tools/build-employee-dashboard.mjs`: 更新成功
- `npm.cmd run qa:employees`: PASS
- `npm.cmd run qa:dashboard`: PASS

未確認事項:

- 2026年7月25日22:55 JST 以降のnote・Substack 24時間後の閲覧、反応、購読、教材反応
- 社長のプロフィール更新後に `first-time.html` が入口として実際に使われたか

次の一手:

1. 2026年7月25日22時55分以降に `review-published-longform-24h` を開始する
2. ブリーフの記録欄へ、見えた数字だけを事実ベースで残す
3. 次稿で変える一つだけを決める

## 2026-07-25 夜の進捗: 公開済み長文の24時間後確認

現在地:

- 22時56分以降に `review-published-longform-24h` を実行した
- 対象は前夜公開の note 1本と Substack 1本
- 7日後確認 `review-published-longform-7d` は 2026年7月31日22:55 JST の待機のまま

確認できたこと:

- note は公開URL、見出し、本文、重点教材リンク、見出し画像なし公開を確認できた
- note 編集画面で本文 1,345 文字を確認できた
- Substack は Chrome の安全ポリシーで `stone1986.substack.com` の読取りが拒否され、24時間後確認を実行できなかった

今回の判断:

- 見えた数字だけを残し、見えない数値は未確認のまま維持する
- 次稿で変える一つは、公開パッケージに24時間後確認用の読取り画面URLを媒体ごとに1本明記することに固定した

QA結果:

- `node tools/build-employee-dashboard.mjs`: 更新成功
- `npm.cmd run qa:employees`: PASS
- `npm.cmd run qa:dashboard`: PASS

未確認事項:

- note の閲覧、スキ、コメント数
- Substack の公開画面と24時間後の閲覧、反応、新規購読
- 社長のプロフィール更新後に `first-time.html` が入口として使われたか

次の一手:

1. 2026年7月29日06:30 JST に `search-exposure-7d-review` を実行する
2. 2026年7月31日22:55 JST に `review-published-longform-7d` を実行する
3. 次の長文公開パッケージに、24時間後確認で使う読取り画面URLを媒体ごとに1本だけ残す
## GitHub品質管理フロー復旧

- 直近4回の`Quality checks`失敗を確認
- サイトや教材ではなく、GitHubにローカル専用AI自動勤務設定がないことを`qa:dashboard`が誤判定していた
- GitHubではリポジトリ内定義、ローカルでは自動勤務2/2まで確認するよう検査範囲を分離
- GitHub相当環境の全`npm run qa`はPASS
- 修正後run `30160755435`は`success`
- 品質基準を下げず、実行場所に応じた正しい検査へ修正

## 2026-07-25 深夜の改善勤務 3媒体プロフィール統一の公開確認ブリーフ

`ready` の仕事が 0 件だったため、公開サイト、発信キュー、検索確認日、教材QAを見直した。公開済み記事の future review はすでに待機中で、サイトQAと教材QAも通過済みだった。一方で、2026年7月26日が期限の `owner-profile-first-time-alignment` は社長操作待ちで、変更後の公開確認基準だけが未整備だった。

担当別判断:

- 発信戦略責任者: 3媒体プロフィールは保護者・先生の最初の入口なので、変更後に同じ基準で確認できるブリーフを先に固定する価値が高い
- 安全・ブランド監査責任者: 外部プロフィール変更やX固定投稿差し替えは社長だけが行い、AIは公開画面確認だけにとどめる
- QA担当: 公開URL、期待文言、差し戻し条件、証拠の残し方が1枚にまとまっていれば、変更後の判定がぶれない
- 編集長: future review と重ならず、読者価値と安全性の両方を上げる一件として採用する

実施内容:

- `PROFILE_ALIGNMENT_VERIFICATION_BRIEF_2026-07-25.md` を新規作成
- X、Substack、note の公開URL、期待表示名、期待自己紹介、固定URL確認点を整理
- X固定投稿で確認する必須文言と、旧情報 `5名のAI社員` を差し戻し条件へ明記
- `first-time.html` を入口LPとして再確認する手順と記録テンプレートを追加
- `AI_EMPLOYEE_WORK_QUEUE.json` に `prepare-profile-alignment-verification-brief` を completed で追加
- `AI_EMPLOYEE_ACTIVITY_LOG.json` に今回の完了記録を追加

QA結果:

- `PROFILE_CONVERSION_AUDIT_2026-07-15.md`、`OWNER_ACTIONS.json`、`first-time.html` とブリーフの内容を照合
- 外部操作を含まない更新だけに限定していることを確認
- `node tools/build-employee-dashboard.mjs`: 更新成功
- `npm.cmd run qa:profiles`: PASS
- `npm.cmd run qa:dashboard`: PASS

未確認事項:

- 社長による3媒体プロフィール更新そのもの
- 更新後の公開プロフィール画面
- 更新後24時間のプロフィール遷移や反応

次の一手:

1. 社長が `owner-profile-first-time-alignment` を実施する
2. 変更後に `PROFILE_ALIGNMENT_VERIFICATION_BRIEF_2026-07-25.md` に沿って公開画面を読み、pass / fail を記録する
3. 差分がなければ `OWNER_ACTIONS.json` を完了へ、差分があれば事実だけを残して pending を維持する
