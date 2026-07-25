# 明成個別 夏期講習 小テスト記録

中3夏期講習の毎日の小テスト結果を、生徒がその場で入力し、先生が一覧・推移で確認できるアプリです。
Next.js + Vercel Marketplaceの Redis(Upstash) で作られていて、**GitHubとVercelだけ**でデプロイできます。
Firebaseのような外部サービスに別途登録する必要はありません。

## できること

- 生徒:名前を選んでログイン → 科目・満点・得点を入力 → 90%以上で合格(緑)、未満で不合格(赤)+「夜のコマに残って自学をすること」の警告
- 先生:合言葉でログイン → 全生徒の推移(合否ドット)一覧、生徒ごとの得点率の折れ線グラフ(科目別に絞り込み可)、名簿管理

データはNext.jsのAPI Routes(サーバー側)経由でRedisに保存されるので、合言葉やDBのアクセス情報がブラウザ側に漏れることはありません。

## デプロイ手順(Vercel + GitHubのみ)

### 1. GitHubにpushする

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<あなたのアカウント>/meisei-quiz-tracker.git
git push -u origin main
```

### 2. Vercelにインポート

1. https://vercel.com で「Add New... > Project」→ 上記GitHubリポジトリを選択してインポート
2. Framework Presetは自動で「Next.js」になります
3. そのまま「Deploy」してOKです(この時点ではまだデータ保存はできません)

### 3. Storageタブでデータベースを追加(ここがポイント)

1. デプロイ後、プロジェクトの「Storage」タブを開く
2. 「Create Database」→ 一覧から **Redis(Upstash)** を選択
3. データベース名やリージョンを選んで作成すると、そのまま今のプロジェクトに接続されます
   (Upstashのアカウントも裏側で自動作成されるので、別サイトで登録する必要はありません)
4. 接続すると `KV_REST_API_URL` / `KV_REST_API_TOKEN` が自動でVercelの環境変数に追加されます
5. Vercelのダッシュボードから「Redeploy」を1回実行すれば、環境変数が反映されて完了です

これで生徒がスマホで入力した結果が、先生の画面にも(数十秒以内の自動更新で)反映されるようになります。

## ローカルで動作確認したい場合(任意)

```bash
npm install
vercel link          # 作成したVercelプロジェクトと紐付け
vercel env pull .env.development.local   # Storageの接続情報を自動取得
npm run dev
```

http://localhost:3000 で確認できます。

## データの持ち方(Redis)

- キー `roster`:生徒名の配列
- キー `results`:`{ 生徒名: [ { date, subject, max, score, ts }, ... ] }`
- キー `teacher-passcode`:先生用画面に入るための合言葉

すべてサーバー側の `pages/api/*.js` 経由でのみ読み書きされ、ブラウザからRedisに直接アクセスすることはありません。

## セキュリティについて

先生用画面は「合言葉」による簡易的な保護です。合言葉の値自体はAPIの中だけで照合していて、ブラウザ側には一切送らない作りにしています。
ただし本格的なアカウント認証(ログイン試行回数の制限など)ではないので、校内での運用ツールとしては十分ですが、
生徒の個人情報など機密性の高いデータを扱うようになったら、より強固な認証の導入を検討してください。
