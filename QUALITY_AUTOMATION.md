# けいさんランド 品質自動点検

ページや教材を変更したあと、公開前に次の2つを実行します。

まとめて実行する場合:

```powershell
npm run qa
```

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

両方が `PASS` になってから公開します。

## 自動実行

- GitHubの `main` へ送信したときと、プルリクエスト作成時に自動点検します。
- Netlifyも公開処理の前に `npm run qa` を実行します。
- 点検が失敗した場合は公開処理が止まり、問題のある状態を本番へ出しにくくします。
