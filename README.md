# Mindmap App

**Mindmap App** は、Webブラウザ上でマインドマップの作成・編集・共有ができるアプリケーションです。以下の機能を備えています。

- ユーザー認証（ログイン／新規登録）
- マイページ（自分のマインドマップ一覧表示・新規作成・削除）
- Editor画面（ドラッグ＆ドロップでマップを編集、ありがとう機能、公開リンクの発行など）
- マインドマップからMarkdown形式へのエクスポート（ExportMarkdown画面）
- 公開リンクで読み取り専用表示＆複製

---

## 構成

```
mindmap-app/
├─ server/                // Node.js (Express) サーバー
│   ├─ controllers/
│   ├─ models/
│   ├─ routes/
│   ├─ app.js
│   └─ ...
├─ client/                // Reactフロントエンド
│   ├─ src/
│   │   ├─ pages/
│   │   ├─ components/
│   │   └─ ...
│   ├─ public/
│   │   └─ index.html
│   └─ ...
└─ README.md              // 本ファイル
```

- **server** : マインドマップのCRUDや認証APIを提供  
- **client** : Reactアプリ。マインドマップエディターやマイページ等のUIを提供  

---

## 前提環境

- Node.js v14+（サーバー側 / 開発用）
- npm または yarn
- MongoDBなどのデータベース（本番環境で利用）

---

## インストール & 起動手順

1. **リポジトリのクローン**

```bash
git clone https://github.com/JiNenn/mindmap-app.git
cd mindmap-app
```

2. **サーバー側のセットアップ**

```bash
cd server
npm install
```

3. **クライアント側のセットアップ**

```bash
cd ../client
npm install
```

4. **環境変数設定**  
   - `.env` あるいは環境変数で下記を指定（例：JWT_SECRET、DB接続URLなど）
   - 例：  
     ```
     JWT_SECRET=xxxxxxx
     MONGODB_URI=mongodb+srv://...
     ```

5. **サーバーを起動**

```bash
cd ../server
npm run dev    # 開発用 (nodemon)
# or
npm start      # 本番用
```

6. **クライアントを起動**

```bash
cd ../client
npm start
```

- デフォルトでポート3000番でReactが起動し、ポート4000番でExpressサーバーが起動します。

---

## ビルド (フロントエンド)

本番運用の場合、以下のコマンドで最適化ビルドを生成し、出力された静的ファイルをサーバーでホスティングします。

```bash
cd client
npm run build
```

`client/build` フォルダ以下に生成されたファイルを、NginxやAWS S3などで配信してください。

---

## スクリーンショットについて

アプリのドキュメントや紹介用に、以下の画面をスクリーンショットとして撮影しました。

1. **ログイン画面**  
   - **ファイル名**: `screenshots/screenshot-login.png`  
   - ユーザー名/パスワード入力欄が表示されている状態

2. **マイページ画面**  
   - **ファイル名**: `screenshots/screenshot-mypage.png`  
   - ユーザーがログイン後に表示されるマインドマップ一覧。カードが並んでいる状態

3. **Editor画面**  
   - **ファイル名**: `screenshots/screenshot-editor.png`  
   - ノードを追加した状態。キャンバスではドラッグ＆ドロップUIを実現

4. **公開リンク画面 (読み取り専用)**  
   - **ファイル名**: `screenshots/screenshot-public.png`  
   - 公開されたマップが読み取り専用で表示されている

5. **Markdownエクスポート画面**  
   - **ファイル名**: `screenshots/screenshot-export.png`  
   - Markdownテキストが表示されている状態。コピー機能が充実
