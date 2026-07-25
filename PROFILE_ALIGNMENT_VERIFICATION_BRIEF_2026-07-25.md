# 3媒体プロフィール統一 公開確認ブリーフ

作成日: 2026-07-25
対象Owner Action: `owner-profile-first-time-alignment`
目的: 社長が X・Substack・note のプロフィールと X 固定投稿を更新したあと、AI が公開画面だけを読んで完了可否を同じ基準で判断できるようにする。

## 今回AIがやること

- 公開プロフィール確認の基準を固定する
- 公開URL、期待文言、合格条件、証拠の残し方を1枚にまとめる

## 今回AIがやらないこと

- X、Substack、note の外部プロフィール変更
- X固定投稿の公開・差し替え
- 反応数や流入の推測

## 確認する公開URL

- X: `https://x.com/TakaAirdropblo1`
- Substack: `https://stone1986.substack.com/`
- note: `https://note.com/tkbigstone1986`
- 案内先LP: `https://keisan-land.netlify.app/first-time.html`

## 期待状態

### X

- 表示名: `TK｜けいさんランド運営`
- 自己紹介に次の意味が入っている
  - 2児の父
  - 小学生向け無料計算ドリル「けいさんランド」
  - 登録不要
  - 印刷OK
- Website が `https://keisan-land.netlify.app/first-time.html`
- 固定投稿で次を確認する
  - `けいさんランド`
  - `登録不要`
  - `スマホでも印刷でも使えます`
  - `https://keisan-land.netlify.app/first-time.html`
- 旧情報 `5名のAI社員` が消えている

### Substack

- 表示名: `TK｜けいさんランド開発日記`
- 自己紹介に次の意味が入っている
  - 2児の父
  - 小学生向け無料計算ドリル「けいさんランド」
  - 開発日記
  - 登録不要
  - 印刷OK
- 固定案内URLが `https://keisan-land.netlify.app/first-time.html`

### note

- 表示名: `TK｜けいさんランド運営`
- 自己紹介に次の意味が入っている
  - 2児の父
  - 小学生向け無料計算ドリル「けいさんランド」
  - 文章題で止まったときの声かけ、または家庭学習で使える短い手順
  - 登録不要
  - 印刷OK
- プロフィールURLが `https://keisan-land.netlify.app/first-time.html`

## 確認手順

1. 3媒体を公開画面またはログアウト状態で開く
2. 表示名が監査案どおりか確認する
3. 自己紹介が「AI開発」中心ではなく、保護者・先生向けの教材価値を主役にしているか確認する
4. 固定URLまたはプロフィールURLが `first-time.html` に統一されているか確認する
5. X固定投稿で旧文言 `5名のAI社員` が消え、案内文とURLが更新されているか確認する
6. `first-time.html` が 200 で返り、タイトルと主要CTAが壊れていないことを確認する
7. 1つでも欠けたら `OWNER_ACTIONS.json` は `pending` のままにし、差分を事実だけで記録する

## 記録テンプレート

```markdown
確認日:

X:
- 表示名:
- 自己紹介:
- Website:
- 固定投稿:
- 判定: pass / fail

Substack:
- 表示名:
- 自己紹介:
- 固定案内URL:
- 判定: pass / fail

note:
- 表示名:
- 自己紹介:
- プロフィールURL:
- 判定: pass / fail

first-time.html:
- 200 OK:
- title:
- 主なCTA:
- 判定: pass / fail

差分:
- 

次の一手:
- 
```

## 合格条件

- 3媒体すべてで表示名が監査案どおり
- 3媒体すべてで `first-time.html` へ1回で進める
- X固定投稿から旧情報が消えている
- 変更後も `first-time.html` が入口ページとして正常

## 差し戻し条件

- どれか1媒体でも旧URLや旧文言が残る
- `first-time.html` 以外の固定URLに分散する
- AI社員数など変わりやすい数字が固定プロフィールに残る
- 公開画面で確認できないまま完了扱いにする

## 参照元

- `PROFILE_CONVERSION_AUDIT_2026-07-15.md`
- `OWNER_ACTIONS.json`
- `first-time.html`
