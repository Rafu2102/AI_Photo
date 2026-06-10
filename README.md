# AI Photo - 頂級空拍攝影作品集 & 後台管理系統

這是一個為空拍攝影創作者打造的頂級個人攝影作品集與後台管理系統。本專案採用前後端實體分離的目錄結構設計，前端基於 **Next.js 16**，後端資料庫與圖片儲存服務基於 **Supabase**。

---

## 📂 專案目錄結構

專案已將前端應用程式碼與後端資料庫配置進行物理分離整理：

```text
AI Photo/
├── backend/                     # 📂 後端與資料庫相關配置
│   ├── supabase_schema.sql      # 📄 資料表 Schema 與 RLS 存取政策
│   └── storage_fix.sql          # 📄 儲存桶 (Bucket) 建立與讀寫政策
├── frontend/                    # 📂 前端與全端 Next.js 應用程式碼
│   ├── src/                     # 📂 專案原始碼 (包含頁面、UI 元件與全域狀態)
│   ├── public/                  # 📂 靜態資源檔案
│   ├── .env.local               # 📄 本機環境變數設定檔 (不提交至 Git)
│   ├── package.json             # 📄 前端套件依賴與腳本定義檔
│   └── (其他 Next.js 設定檔)
└── README.md                    # 📄 專案根目錄說明文件
```

---

## ⚙️ 快速開始 (Quick Start)

### 1. 後端資料庫與儲存設定 (backend/)
本專案的後端由 Supabase 託管，請在您的 Supabase 後台依序執行以下設定：
1. 建立一個新的 Supabase 專案。
2. 點選左側選單的 **「SQL Editor」**（終端機 `>_` 圖示），建立一個 New query，複製 [backend/supabase_schema.sql](file:///d:/AI%20Photo/backend/supabase_schema.sql) 中的所有內容並點擊 **「Run」**。這會初始化 `photos` 與 `settings` 資料表。
3. 再次點選 **「New query」**，複製 [backend/storage_fix.sql](file:///d:/AI%20Photo/backend/storage_fix.sql) 中的所有內容並點擊 **「Run」**。這會建立 `portfolio-images` 儲存桶並設定公開存取與安全上傳規則。

### 2. 設定前端環境變數 (frontend/)
請進入 `frontend/` 目錄，建立 [frontend/.env.local](file:///d:/AI%20Photo/frontend/.env.local) 檔案，並填入以下資訊：
```env
# 後台管理登入帳密
NEXT_PUBLIC_ADMIN_USERNAME=您的管理員帳號
NEXT_PUBLIC_ADMIN_PASSWORD=您的管理員密碼

# Supabase 連線憑證 (可至 Supabase -> Project Settings -> API 取得)
NEXT_PUBLIC_SUPABASE_URL=https://您的專案ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=您的anon金鑰
```

### 3. 前端本機執行 (frontend/)
請開啟終端機並切換至 `frontend/` 目錄，依序執行以下指令：
```bash
# 1. 切換至前端目錄
cd frontend

# 2. 安裝前端依賴套件
npm install

# 3. 啟動本機開發伺服器
npm run dev
```
啟動後即可在瀏覽器中開啟以下網址進行開發測試：
* 網站首頁：[http://localhost:3000](http://localhost:3000)
* 管理後台：[http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🌐 線上部署 (Vercel)

本專案可以直接匯入至 Vercel 進行部署：
1. 在 Vercel 後台點擊 **「Add New Project」** 並匯入此 GitHub 專案。
2. 在 Vercel 設定專案時，**「Root Directory」 請務必選擇 `frontend` 資料夾**。
3. 在 **「Environment Variables」** 設定區塊中，填入與 [frontend/.env.local](file:///d:/AI%20Photo/frontend/.env.local) 相同的環境變數。
4. 點擊 **「Deploy」** 開始部署。
5. 若未來更新環境變數，請至專案的 Settings -> Environment Variables 更新，並在 Deployments 分頁中，選擇最新部署點選 **「Redeploy」** 重新部署以套用設定。
