# 中国語 拼音クイズ

GitHubリポジトリ `tyuugokugo` で公開する、拼音を見て対応する簡体字の中国語を答える学習用クイズサイトです。外部ライブラリやビルド処理を使わず、ブラウザだけで動作します。

## 主な機能

- 10問・20問・全77問から出題数を選択
- Fisher–Yates法による、重複のないランダム出題
- 日本語の意味を必要なときだけ表示
- Web Speech APIによる中国語の発音再生
- Enterキーによる答え合わせと次の問題への移動
- 空白や空欄記号を除外した解答判定
- 得点、正答率、全解答履歴の表示
- 間違えた問題を `localStorage` に保存
- 保存した間違いだけを復習し、正解した問題を保存一覧から削除
- 中国語・拼音・日本語の意味を検索できる全77項目の単語一覧
- 解答済み問題だけを集計するクイズ途中結果
- History APIによる単語一覧・クイズ・結果画面のブラウザ履歴対応
- スマートフォンのページ全体を利用するレスポンシブUI
- PC・スマートフォン対応

## 使用技術

- HTML5
- CSS3
- Vanilla JavaScript
- Web Speech API（SpeechSynthesis）
- GitHub Actions / GitHub Pages

## 音声再生について

発音機能はブラウザ標準のWeb Speech APIを使用し、中国語音声を優先して再生します。実際の声質や発音は、利用する端末やブラウザにインストールされている中国語音声によって異なる場合があります。

Web Speech APIに対応していないブラウザでは発音ボタンが無効になり、クイズと単語一覧のその他の機能はそのまま利用できます。外部の音声ファイルや有料APIは使用していません。

## スマートフォン対応

解答入力欄と検索欄は16px以上の文字サイズにし、iPhone Safariで仮想キーボードを表示した際の自動ズームを防いでいます。画面には `100dvh` を使用し、入力欄へフォーカスしたときは必要な場合だけ操作領域が見える位置へスクロールします。

クイズ・結果・単語一覧は中央の小さなカードに閉じ込めず、ページ幅全体を利用するレスポンシブUIです。viewportでは `user-scalable=no` や `maximum-scale=1` を使用していないため、アクセシビリティに必要なピンチズームを利用できます。

## 画面履歴と途中結果

ホーム、クイズ、結果、単語一覧の画面状態をHistory APIで管理しています。ホームから単語一覧へ移動した後は、ブラウザの戻るボタンやiPhone Safariの戻るスワイプでホームへ戻れます。

クイズを途中終了した場合は、答え合わせ済みの問題だけを途中結果として表示します。入力途中や未出題の問題は結果・正答率・間違い保存の対象に含みません。クイズ中にブラウザの戻る操作を行った場合も、解答履歴があれば確認済みの途中結果を表示します。

## ローカルでの確認方法

簡単に確認する場合は、`index.html` をブラウザで開きます。

ローカルHTTPサーバーを使う場合は、リポジトリのルートで次を実行します。

```bash
python -m http.server 8000
```

その後、ブラウザで `http://localhost:8000/` を開きます。環境によって `python` が見つからない場合は、`python3 -m http.server 8000` を使用してください。

## GitHub Pagesでの公開方法

1. GitHub上のリポジトリ名が `tyuugokugo` であることを確認します。
2. リポジトリの **Settings → Pages** を開きます。
3. **Build and deployment** の **Source** で **GitHub Actions** を選択します。
4. `main` ブランチへpushすると、`.github/workflows/deploy.yml` がサイトを公開します。

公開URLは次の形式です。

```text
https://ユーザー名.github.io/tyuugokugo/
```

CSSとJavaScriptは相対パスで読み込むため、`/tyuugokugo/` のサブディレクトリでも動作します。

## ファイル構成

```text
tyuugokugo/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── .gitignore
├── index.html
├── style.css
├── script.js
├── speech.js
├── words.js
└── README.md
```

- `index.html`: 画面構造
- `style.css`: レイアウトと表示デザイン
- `script.js`: 画面切り替え、クイズ進行、解答履歴、検索、保存処理
- `speech.js`: 中国語音声の選択と再生制御
- `words.js`: 77項目の単語データ
- `.github/workflows/deploy.yml`: GitHub Pagesへの公開ワークフロー
