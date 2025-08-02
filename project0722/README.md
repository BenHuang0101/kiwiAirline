# 奇異鳥航空訂票網站

這是一個基於 Vue 3 開發的現代化航空訂票網站，提供完整的航班搜尋、訂票、付款和客服功能。

## 專案特色

- 🚀 **現代化技術棧**: Vue 3 + Composition API + Pinia + Vue Router
- 📱 **響應式設計**: 適配桌面端和移動端
- 🎨 **美觀的 UI**: 基於 Material Design 3.0 設計原則
- 🔐 **安全認證**: JWT Token 認證系統
- 💳 **多元付款**: 支援信用卡和 ATM 轉帳
- 🌍 **國際化**: 支援多語言和多幣別

## 功能特點

### 用戶功能

- 用戶註冊和登入
- 航班搜尋和篩選
- 多乘客訂票
- 線上付款
- 訂票記錄管理
- 客服聯繫

### 航班功能

- 即時航班查詢
- 價格比較
- 座位選擇
- 行李加購
- 特殊需求處理

### 訂票流程

1. 搜尋航班
2. 選擇航班
3. 填寫乘客資訊
4. 選擇付款方式
5. 確認訂票

## 技術架構

### 前端技術

- **Vue 3**: 漸進式 JavaScript 框架
- **Composition API**: 更好的邏輯組織和代碼重用
- **Pinia**: Vue 的官方狀態管理庫
- **Vue Router**: 單頁應用路由
- **Axios**: HTTP 客戶端
- **Vite**: 快速建構工具

### 狀態管理

- **Auth Store**: 用戶認證狀態
- **Flight Store**: 航班搜尋和選擇
- **Booking Store**: 訂票流程管理

### 組件架構

```
src/
├── components/          # 可重用組件
│   ├── AppHeader.vue   # 網站導航
│   ├── AppFooter.vue   # 網站底部
│   ├── FlightSearchForm.vue  # 航班搜尋表單
│   ├── PassengerForm.vue     # 乘客資訊表單
│   └── PaymentForm.vue       # 付款表單
├── views/              # 頁面組件
│   ├── HomeView.vue        # 首頁
│   ├── LoginView.vue       # 登入頁
│   ├── RegisterView.vue    # 註冊頁
│   ├── SearchResultsView.vue # 搜尋結果
│   ├── BookingView.vue     # 訂票頁面
│   ├── MyBookingsView.vue  # 我的訂票
│   └── ContactView.vue     # 客服聯繫
├── stores/             # 狀態管理
│   ├── auth.js        # 認證狀態
│   ├── flight.js      # 航班狀態
│   └── booking.js     # 訂票狀態
├── services/           # API服務
│   └── api.js         # 統一API介面
└── router/             # 路由配置
    └── index.js       # 路由定義
```

## 安裝和運行

### 環境要求

- Node.js 16.0+
- npm 7.0+

### 安裝依賴

```bash
npm install
```

### 開發模式

```bash
npm run dev
```

### 生產建構

```bash
npm run build
```

### 預覽生產版本

```bash
npm run preview
```

## 環境配置

### 開發環境

複製 `.env.development` 並設定相關配置：

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=奇異鳥航空
VITE_ENABLE_CHAT=true
VITE_DEBUG_MODE=true
```

### 生產環境

複製 `.env.production` 並設定相關配置：

```env
VITE_API_BASE_URL=https://api.kiwiairline.com
VITE_APP_NAME=奇異鳥航空
VITE_ENABLE_CHAT=true
VITE_DEBUG_MODE=false
```

## API 端點

### 認證相關

- `POST /auth/login` - 用戶登入
- `POST /auth/register` - 用戶註冊
- `POST /auth/logout` - 用戶登出
- `GET /auth/user` - 獲取用戶資訊

### 航班相關

- `GET /flights/search` - 搜尋航班
- `GET /flights/:id` - 獲取航班詳情
- `GET /flights/popular-destinations` - 熱門目的地
- `GET /airports` - 機場列表

### 訂票相關

- `POST /bookings` - 創建訂單
- `GET /bookings/user` - 獲取用戶訂單
- `GET /bookings/:id` - 獲取訂單詳情
- `PUT /bookings/:id/cancel` - 取消訂單
- `PUT /bookings/:id` - 修改訂單

### 付款相關

- `POST /payments/process` - 處理付款
- `GET /payments/:id/status` - 獲取付款狀態
- `POST /bookings/:id/refund` - 申請退款

### 客服相關

- `POST /support/contact` - 提交客服表單
- `GET /support/faq` - 獲取常見問題
- `POST /support/chat/start` - 開始聊天會話

## 設計系統

### 顏色配置

- **主要色彩**:
  - 奇異鳥藍: `#0077cc`
  - 奇異鳥橙: `#ff6b35`
  - 深海藍: `#003366`
- **狀態色彩**:
  - 成功: `#28a745`
  - 警告: `#ffc107`
  - 錯誤: `#dc3545`
  - 資訊: `#17a2b8`

### 間距系統

- Space 1: 4px
- Space 2: 8px
- Space 3: 12px
- Space 4: 16px
- Space 5: 20px
- Space 6: 24px
- Space 7: 28px
- Space 8: 32px

### 字體系統

- 標題: Noto Sans TC
- 內文: system-ui, -apple-system, sans-serif
- 等寬: 'Fira Code', monospace

## 項目結構說明

### 頁面說明

1. **首頁 (HomeView)**: 航班搜尋、熱門目的地、服務介紹
2. **登入頁 (LoginView)**: 用戶登入介面
3. **註冊頁 (RegisterView)**: 用戶註冊介面
4. **搜尋結果 (SearchResultsView)**: 航班搜尋結果顯示
5. **訂票頁面 (BookingView)**: 多步驟訂票流程
6. **我的訂票 (MyBookingsView)**: 用戶訂票記錄管理
7. **客服聯繫 (ContactView)**: 客服聯繫表單和常見問題

### 組件說明

1. **AppHeader**: 網站導航、用戶選單、語言切換
2. **AppFooter**: 網站資訊、友站連結、版權聲明
3. **FlightSearchForm**: 航班搜尋表單，支援多種搜尋條件
4. **PassengerForm**: 乘客資訊表單，支援多乘客輸入
5. **PaymentForm**: 付款表單，支援多種付款方式

## 開發指南

### 代碼風格

- 使用 Vue 3 Composition API
- 使用 TypeScript（可選）
- 遵循 Vue 官方風格指南
- 使用 ESLint 和 Prettier 進行代碼格式化

### 組件開發

- 使用`<script setup>`語法
- 合理使用組合式函數
- 提供適當的 props 驗證
- 使用 emit 進行組件通信

### 狀態管理

- 使用 Pinia 進行狀態管理
- 按功能模組化 store
- 使用 computed 進行派生狀態
- 合理使用 actions 進行異步操作

## 部署說明

### 建構生產版本

```bash
npm run build
```

### 使用 Docker 部署

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

### 使用 Nginx 部署

```nginx
server {
    listen 80;
    server_name kiwiairline.com;

    location / {
        root /var/www/kiwiairline/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 測試

### 單元測試

```bash
npm run test
```

### E2E 測試

```bash
npm run test:e2e
```

### 測試覆蓋率

```bash
npm run test:coverage
```

## 貢獻指南

1. Fork 專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 版本歷史

### v1.0.0

- 初始版本發布
- 基本航班搜尋功能
- 用戶認證系統
- 訂票流程
- 付款功能
- 客服系統

## 授權協議

本專案使用 MIT 授權協議 - 詳見 [LICENSE](LICENSE) 文件

## 聯繫方式

- **官網**: https://kiwiairline.com
- **客服郵箱**: service@kiwiairline.com
- **技術支援**: tech@kiwiairline.com
- **客服電話**: 0800-123-456

## 致謝

感謝所有為此專案做出貢獻的開發者和設計師。

---

**奇異鳥航空** - 讓旅行更簡單 ✈️
