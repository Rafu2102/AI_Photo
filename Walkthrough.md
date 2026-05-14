# 全端架構雙軌制優化報告 (Walkthrough)

## 執行摘要 (Executive Summary)
本次無人值守重構流程已成功導入**「伺服器端 User-Agent 雙軌渲染架構」**。在完全保留原本「完美無損且霸氣的電腦端效果」前提下，針對行動裝置獨立建立了一套極致輕量與流暢的渲染流程，並新增了符合整體深色玻璃質感的回到頂部按鈕。

## 架構與效能變更 (Architectural Changes)

### 1. 伺服器端動態路由 (Server-Side User-Agent Parsing)
*   **技術實作**：在 Next.js Server Component (`app/page.tsx`) 中，透過讀取 `headers().get("user-agent")`，在伺服器端即刻判斷訪客設備 (`isMobile`)。
*   **優勢**：因為判斷邏輯是在伺服器處理的，系統會直接派發「對應裝置」的 HTML 給瀏覽器，**零延遲、不佔用客戶端算力，且絕對不會發生畫面閃爍 (Hydration Mismatch)**。

### 2. 雙軌渲染邏輯分離 (Dual-Track Rendering)
*   **電腦端 (Desktop)**：維持原生 `<img src="原檔">` 與 `<motion.img>` 標籤，保留了 4800 萬畫素的頂級解析度，並且維持原有的瀑布流 Framer Motion `layout` 自動排版特效。
*   **行動端 (Mobile)**：啟動 `next/image` 元件進行 WebP 極致壓縮，並**自動關閉**高耗能的 `layout` 動畫運算，確保手機瀏覽不再過熱卡頓。同時將 `Hero` 與 `About` 區塊的全螢幕定義切換為 `min-h-[100svh]`，修正 Safari 動態網址列造成的破圖問題。

### 3. 精緻互動元件 (UI Components)
*   **回到頂部按鈕 (BackToTop.tsx)**：新增了右下角的全域懸浮按鈕，採用與網站主體相同的 Glassmorphism (玻璃擬態) 與懸停微動效 (`group-hover:-translate-y-1`)。此元件具有智慧偵測功能，僅在頁面下拉超過 500px 時才會優雅浮現。

## 結論 (Conclusion)
系統目前已達致完美狀態。電腦版使用者將能享受最極致的原汁原味視覺震撼，而手機版使用者將享有最節省頻寬、如絲綢般流暢的滑動體驗，兩套邏輯完美共存於單一架構中。
