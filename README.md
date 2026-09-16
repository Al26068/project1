# その場で給料

バイトの予定・勤務時間をその場で記録し、給与を自動計算するアプリ。複数のバイト先を掛け持ちしている人が、シフトの記録・給与確認・貯金管理をするときに使う想定。

このプロジェクトのルール・仕様の正本は [CLAUDE.md](./CLAUDE.md)。開発の経緯・現在の進捗は [HANDOFF.md](./HANDOFF.md)（現在のスナップショット）と [LOG.md](./LOG.md)（時系列の変更ログ）を参照。

## 技術構成

- React + TypeScript + Vite
- react-router-dom（画面遷移）
- 通常のCSS（Tailwind等は不使用）
- 状態管理は useState / useContext のみ
- データ保存は localStorage のみ（外部DB・認証なし）

## セットアップ（別PCで作業を始めるとき）

1. Node.js のバージョンを合わせる（`.nvmrc` に記載のバージョンを使用）

   ```bash
   nvm install
   nvm use
   ```

   **注意（WSL環境の場合）**：Windows側のnode.exeがWSL内のプロジェクトを実行すると、パス解決に失敗して開発サーバーが起動直後にクラッシュすることがある。必ず `nvm` でインストールしたLinuxネイティブのNode.jsを使うこと（`which node` が `/mnt/c/...` ではなく `/home/.../.nvm/...` を指しているか確認）。

2. 依存パッケージをインストール

   ```bash
   npm install
   ```

3. 開発サーバーを起動

   ```bash
   npm run dev
   ```

   `http://localhost:5173` で開く。ポートは `vite.config.ts` で `5173` に固定している（`strictPort: true`）。**別のプロセスが5173を使っていて起動に失敗した場合は、そのプロセスを終了させてから再実行すること。** ポート番号がずれると、localStorageに保存したデータ（職場情報・勤務記録など）が別オリジン扱いになり、前のPCで入力したデータが「消えたように」見えてしまうため。

## データについて

すべてのデータ（職場情報・勤務記録・カレンダーの予定など）は各ブラウザの localStorage に保存されており、サーバー側には何も送信されない。そのため、**PCを変えたりブラウザを変えたりすると、入力したデータは引き継がれない**（コードはGitHubで同期されるが、データはされない）。

## その他のコマンド

```bash
npm run build    # 型チェック + 本番ビルド
npm run lint     # oxlint によるlint
npm run preview  # ビルド結果のプレビュー
```
