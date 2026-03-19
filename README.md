# 加密貨幣交易所前端 (Cryptocurrency Exchange Frontend)

## 專案簡介 (Introduction)
這是一個基於 React 19 與 Vite 構建的加密貨幣交易所前端專案。透過現代化的技術棧，提供高效能、流暢的用戶體驗與即時的市場數據更新。

## 技術棧 (Tech Stack)
- **核心框架**: React 19
- **建置工具**: Vite 7
- **路由管理**: React Router DOM 7
- **網路請求**: Axios
- **樣式與 UI**: Tailwind CSS 3, PostCSS, Autoprefixer
- **資料可視化**: Lightweight Charts (用於專業的 K 線圖/走勢圖), Recharts (用於各式統計圖表)
- **代碼規範**: ESLint

## 環境變數配置 (Environment Variables)
在本地啟動或部署專案前，請先配置所需的環境變數。你可以複製專案提供的範例檔：

```bash
cp .env.example .env
```

目前支援的環境變數如下：
- `VITE_API_BASE_URL`: 後端 REST API 基礎路徑 (預設值: `http://localhost:8084/api/v1`)
- `VITE_WS_URL`: 用於即時市場數據與訂單更新的 WebSocket URL (預設值: `ws://localhost:8084/ws`)

## 安裝與依賴 (Installation Setup)
建議使用 Node.js (v18 或以上版本)。在前端專案根目錄下，執行以下指令以安裝依賴：

```bash
npm install
# 或者使用 pnpm (推薦)
pnpm install
```

## 可用的腳本指令 (Available Scripts)
在專案目錄下，支援以下 NPM 指令：

- `npm run dev`: 啟動支援即時熱更新 (HMR) 的 Vite 開發伺服器。
- `npm run build`: 將開發源碼編譯並最佳化，打包出用於生產環境 (Production) 的靜態檔案。
- `npm run lint`: 執行 ESLint 針對專案進行語法和風格檢查。
- `npm run preview`: 在本地預覽由 `build` 產生出的生產環境版本。

## Docker 支援 (Docker Support)
本專案現已支援 Docker 容器化。包含 `Dockerfile` 以供環境打包，同時 `.dockerignore` 檔案中已設定排除 `node_modules` 與本地 `.env`，以確保建置的 Docker 映像檔精簡且不洩漏本地機密變數。

## 開發規劃與後續展望 (Development Notes)
- **React Compiler**: 本模板預設未開啟 React Compiler（考量到其對開發與構建效能的潛在影響）。如欲加入以提供進一步的最佳化，可參考 [官方安裝文件](https://react.dev/learn/react-compiler/installation)。
- **型別檢查擴展 (TypeScript)**: 目前專案基於標準 JavaScript ESM。若是面對複雜的生產級應用程式擴展，強烈建議導入 TypeScript 以提升代碼的健壯度（可參考 Vite 官方提供的 [TS Template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts)）。
