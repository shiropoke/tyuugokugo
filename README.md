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
- 進捗確認付きのホーム画面への移動
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
