/** @type {import('next').NextConfig} */
const nextConfig = {
  // スタンドアロンモードを有効化して、必要最低限のファイルのみをデプロイ
  output: "standalone",

  // 環境変数の設定
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL, // Azureで設定されたAPI URLを使用
    NODE_ENV: process.env.NODE_ENV, // 環境モード（production）
    PORT: process.env.PORT || 3000, // ポート番号（デフォルトは3000）
  },
};

export default nextConfig;
