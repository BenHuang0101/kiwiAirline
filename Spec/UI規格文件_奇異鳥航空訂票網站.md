# 🛫 奇異鳥航空訂票網站 - UI 規格文件

> **本文件用途**：定義奇異鳥航空訂票網站的完整 UI 設計規範與頁面實作細節
>
> **適用場景**：航空訂票網站的所有頁面設計與組件規範
>
> **共用實作參考**：詳細的通用元件行為 (如資料處理、彈窗標準) 請參考 [共用實作備註文件](../../shared-implementation-notes.md)

---

## 📍 基本資訊

- **專案名稱**：奇異鳥航空訂票網站
- **技術架構**：Vue.js + 響應式設計
- **設計語言**：Material Design 3.0 風格
- **瀏覽器支援**：Chrome、Firefox、Safari、Edge (最新版本 -2)
- **設備支援**：桌機、平板、手機
- **權限架構**：訪客、會員、管理員

---

## 🎨 設計系統（Design System）

### 品牌色彩定義

```css
:root {
  /* 主色彩 */
  --kiwi-blue: #0077cc; /* 品牌主色 */
  --kiwi-orange: #ff6b35; /* 強調色 */
  --deep-sea: #003366; /* 深色文字 */

  /* 功能色彩 */
  --success: #28a745; /* 成功狀態 */
  --warning: #ffc107; /* 警告狀態 */
  --danger: #dc3545; /* 危險狀態 */
  --info: #17a2b8; /* 資訊狀態 */

  /* 中性色彩 */
  --white: #ffffff; /* 純白背景 */
  --light-gray: #f8f9fa; /* 淺灰背景 */
  --medium-gray: #6c757d; /* 中灰文字 */
  --dark-gray: #343a40; /* 深灰文字 */
  --border-gray: #e9ecef; /* 邊框顏色 */
}
```

### 字體系統

```css
/* 字體家族 */
--font-chinese: "Noto Sans TC", "Microsoft JhengHei", sans-serif;
--font-english: "Inter", "Helvetica Neue", Arial, sans-serif;
--font-number: "Roboto Mono", monospace;

/* 字體大小 */
--text-xs: 12px; /* 輔助說明 */
--text-sm: 14px; /* 小型文字 */
--text-base: 16px; /* 基礎文字 */
--text-lg: 18px; /* 大型文字 */
--text-xl: 20px; /* 小標題 */
--text-2xl: 24px; /* 副標題 */
--text-3xl: 32px; /* 主標題 */
```

### 間距系統

```css
/* 間距單位 (8px 基礎) */
--space-1: 4px; /* 極小間距 */
--space-2: 8px; /* 小間距 */
--space-3: 12px; /* 中小間距 */
--space-4: 16px; /* 中間距 */
--space-5: 20px; /* 中大間距 */
--space-6: 24px; /* 大間距 */
--space-8: 32px; /* 極大間距 */
--space-12: 48px; /* 超大間距 */
--space-16: 64px; /* 巨大間距 */
```

### 陰影系統

```css
/* 陰影層級 */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
```

---

## 🏗️ 頁面架構設計

### 整體布局結構

```
┌─────────────────────────────────────────────────────────────┐
│                        Header (72px)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    Main Content Area                        │
│                  (最大寬度 1200px)                          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                       Footer (120px)                       │
└─────────────────────────────────────────────────────────────┘
```

### 響應式斷點

| 設備類型 | 螢幕寬度       | 容器寬度 | 欄位數 |
| -------- | -------------- | -------- | ------ |
| 手機     | < 768px        | 100%     | 1      |
| 平板     | 768px - 1024px | 750px    | 2      |
| 桌機     | > 1024px       | 1200px   | 3+     |

---

## 📄 核心頁面設計

### 1. 首頁 (Homepage)

**路由**：`/`
**頁面名稱**：HomeView.vue
**頁面類型**：Landing Page
**權限要求**：無需登入

#### 頁面結構

```
┌─────────────────────────────────────────────────────────────┐
│                    Hero Section                             │
│              [航班搜尋表單區塊]                             │
├─────────────────────────────────────────────────────────────┤
│                   Feature Section                           │
│              [服務特色介紹]                                 │
├─────────────────────────────────────────────────────────────┤
│                 Popular Destinations                        │
│              [熱門航線推薦]                                 │
├─────────────────────────────────────────────────────────────┤
│                   Testimonials                              │
│              [客戶評價]                                     │
└─────────────────────────────────────────────────────────────┘
```

#### 航班搜尋表單區塊

**區塊說明**：核心功能區域，提供航班搜尋功能

**欄位設計**：

| 欄位名稱 | 欄位類型      | 必填 | 驗證規則         | 預設值 | 說明             |
| -------- | ------------- | ---- | ---------------- | ------ | ---------------- |
| 出發地   | select-search | ✓    | 必須選擇有效機場 | -      | 支援搜尋和選擇   |
| 目的地   | select-search | ✓    | 必須選擇有效機場 | -      | 支援搜尋和選擇   |
| 出發日期 | date-picker   | ✓    | 不可選擇過去日期 | 今日   | 格式：YYYY-MM-DD |
| 回程日期 | date-picker   | -    | 晚於出發日期     | -      | 來回程時顯示     |
| 乘客人數 | number-input  | ✓    | 1-9 人           | 1      | 成人+兒童總數    |
| 艙等     | select        | -    | 經濟艙/商務艙    | 經濟艙 | 下拉選單         |

#### 操作按鈕

| 按鈕名稱 | 按鈕類型  | 位置     | 觸發條件     | 操作說明         | 對應 API                  |
| -------- | --------- | -------- | ------------ | ---------------- | ------------------------- |
| 搜尋航班 | primary   | 表單右側 | 必填欄位完成 | 跳轉至搜尋結果頁 | `GET /api/flights/search` |
| 清除條件 | secondary | 表單左側 | 任何時候     | 重置所有欄位     | 無                        |

### 2. 航班搜尋結果頁 (Search Results)

**路由**：`/flights/search`
**頁面名稱**：SearchResultsView.vue
**頁面類型**：列表頁面
**權限要求**：無需登入

#### 頁面結構

```
┌─────────────────────────────────────────────────────────────┐
│                   搜尋條件摘要                               │
├─────────────────────────────────────────────────────────────┤
│  篩選器    │                                              │
│  側邊欄    │            航班卡片列表                       │
│  (280px)   │         (分頁顯示, 每頁10筆)                  │
│            │                                              │
└─────────────────────────────────────────────────────────────┘
```

#### 篩選器區塊

**區塊說明**：幫助用戶精確篩選航班選項

**篩選選項**：

| 篩選項目 | 篩選類型       | 說明                       |
| -------- | -------------- | -------------------------- |
| 出發時間 | checkbox-group | 早班機、上午、下午、晚班機 |
| 航空公司 | checkbox-group | 從搜尋結果動態生成         |
| 價格範圍 | range-slider   | 最低價至最高價             |
| 飛行時間 | range-slider   | 最短至最長飛行時間         |
| 轉機次數 | radio-group    | 直飛、1 次轉機、2 次轉機   |

#### 航班卡片設計

**卡片結構**：

```
┌─────────────────────────────────────────────────────────────┐
│ [航空公司Logo] KW001    08:00 ──────→ 12:30                │
│                        TPE           NRT                    │
│                     台北桃園       東京成田                  │
│                                                             │
│ 直飛 • 4小時30分鐘             NT$ 15,000    [選擇] 按鈕   │
└─────────────────────────────────────────────────────────────┘
```

**卡片狀態**：

- 正常狀態：白色背景，淺灰邊框
- 懸停狀態：陰影加深，輕微上移
- 已售完：灰色背景，價格顯示"已售完"

### 3. 乘客資訊填寫頁 (Passenger Details)

**路由**：`/booking/passengers`
**頁面名稱**：PassengerDetailsView.vue
**頁面類型**：表單頁面
**權限要求**：建議登入 (可匿名購票)

#### 頁面結構

```
┌─────────────────────────────────────────────────────────────┐
│                   進度指示器                                │
│    ① 選擇航班 → ② 填寫資訊 → ③ 確認付款 → ④ 完成          │
├─────────────────────────────────────────────────────────────┤
│  乘客資訊表單            │        訂單摘要                  │
│  (佔 2/3 寬度)           │       (佔 1/3 寬度)              │
│                          │                                  │
│  [乘客1資訊卡片]         │   [航班資訊]                    │
│  [乘客2資訊卡片]         │   [價格明細]                    │
│  [聯絡人資訊卡片]        │   [總價顯示]                    │
│                          │                                  │
│  [下一步按鈕]            │                                  │
└─────────────────────────────────────────────────────────────┘
```

#### 乘客資訊表單

**區塊說明**：收集每位乘客的必要資訊

**表單區塊**：

##### 區塊一：乘客基本資訊

| 欄位名稱 | 欄位類型    | 必填 | 驗證規則     | 預設值   | 說明           |
| -------- | ----------- | ---- | ------------ | -------- | -------------- |
| 稱謂     | select      | ✓    | 必須選擇     | -        | 先生/女士/小姐 |
| 中文姓名 | input-text  | ✓    | 2-20 字元    | -        | 用於國內證件   |
| 英文姓名 | input-text  | ✓    | 2-50 字元    | -        | 護照英文姓名   |
| 護照號碼 | input-text  | ✓    | 護照格式驗證 | -        | 大寫英數字     |
| 出生日期 | date-picker | ✓    | 合理年齡範圍 | -        | 用於年齡驗證   |
| 性別     | radio-group | ✓    | 必須選擇     | -        | 男/女          |
| 國籍     | select      | ✓    | 必須選擇     | 中華民國 | 國家下拉選單   |

##### 區塊二：聯絡人資訊

| 欄位名稱   | 欄位類型    | 必填 | 驗證規則     | 預設值 | 說明         |
| ---------- | ----------- | ---- | ------------ | ------ | ------------ |
| 聯絡人姓名 | input-text  | ✓    | 2-20 字元    | -      | 可與乘客相同 |
| 手機號碼   | input-text  | ✓    | 台灣手機格式 | -      | 09xxxxxxxx   |
| 電子郵件   | input-email | ✓    | Email 格式   | -      | 接收電子機票 |
| 通訊地址   | textarea    | -    | 最多 100 字  | -      | 選填         |

#### 操作按鈕

| 按鈕名稱 | 按鈕類型  | 位置     | 觸發條件     | 操作說明       | 對應 API                        |
| -------- | --------- | -------- | ------------ | -------------- | ------------------------------- |
| 下一步   | primary   | 表單底部 | 表單驗證通過 | 跳轉至付款頁面 | `POST /api/bookings/passengers` |
| 上一步   | secondary | 表單底部 | 任何時候     | 返回航班選擇頁 | 無                              |
| 暫存資料 | default   | 表單右上 | 任何時候     | 儲存填寫進度   | `POST /api/bookings/save-draft` |

### 4. 付款確認頁 (Payment)

**路由**：`/booking/payment`
**頁面名稱**：PaymentView.vue
**頁面類型**：付款表單頁面
**權限要求**：建議登入

#### 頁面結構

```
┌─────────────────────────────────────────────────────────────┐
│                   進度指示器                                │
│    ① 選擇航班 → ② 填寫資訊 → ③ 確認付款 → ④ 完成          │
├─────────────────────────────────────────────────────────────┤
│  付款方式選擇            │        訂單確認                  │
│  (佔 2/3 寬度)           │       (佔 1/3 寬度)              │
│                          │                                  │
│  [付款方式選項]          │   [航班資訊]                    │
│  [付款表單]              │   [乘客資訊]                    │
│  [安全提示]              │   [價格明細]                    │
│                          │   [總價顯示]                    │
│  [確認付款按鈕]          │                                  │
└─────────────────────────────────────────────────────────────┘
```

#### 付款方式選擇

**區塊說明**：提供多種付款方式供用戶選擇

**付款選項**：

| 付款方式 | 圖示 | 說明                  | 額外費用 |
| -------- | ---- | --------------------- | -------- |
| 信用卡   | 💳   | Visa、MasterCard、JCB | 無       |
| ATM 轉帳 | 🏧   | 虛擬帳號轉帳          | 無       |
| 銀行轉帳 | 🏦   | 人工確認              | 無       |

#### 信用卡表單

**區塊說明**：信用卡付款資訊輸入

| 欄位名稱   | 欄位類型   | 必填 | 驗證規則   | 預設值 | 說明                |
| ---------- | ---------- | ---- | ---------- | ------ | ------------------- |
| 卡號       | input-text | ✓    | 信用卡格式 | -      | 16 位數字，自動分組 |
| 持卡人姓名 | input-text | ✓    | 英文姓名   | -      | 與卡片相同          |
| 有效期限   | input-text | ✓    | MM/YY 格式 | -      | 不可過期            |
| 安全碼     | input-text | ✓    | 3-4 位數字 | -      | CVV/CVC             |

#### 操作按鈕

| 按鈕名稱 | 按鈕類型  | 位置     | 觸發條件     | 操作說明           | 對應 API                     |
| -------- | --------- | -------- | ------------ | ------------------ | ---------------------------- |
| 確認付款 | primary   | 表單底部 | 表單驗證通過 | 處理付款並完成訂票 | `POST /api/payments/process` |
| 上一步   | secondary | 表單底部 | 任何時候     | 返回乘客資訊頁     | 無                           |

### 5. 會員中心 (Member Center)

**路由**：`/member`
**頁面名稱**：MemberCenterView.vue
**頁面類型**：會員專區
**權限要求**：需要登入

#### 頁面結構

```
┌─────────────────────────────────────────────────────────────┐
│                   會員導覽列                                │
├─────────────────────────────────────────────────────────────┤
│  側邊選單         │              主要內容區域               │
│  (240px)          │                                        │
│                   │                                        │
│  [個人資料]       │          [動態內容區域]                │
│  [我的訂單]       │                                        │
│  [修改密碼]       │                                        │
│  [登出]           │                                        │
│                   │                                        │
└─────────────────────────────────────────────────────────────┘
```

#### 我的訂單頁面

**區塊說明**：顯示用戶的所有訂單記錄

**訂單卡片設計**：

```
┌─────────────────────────────────────────────────────────────┐
│ 訂單編號: KW20231026001     狀態: [已確認]                   │
│ ────────────────────────────────────────────────────────── │
│ 航班: KW001  TPE → NRT     2023-12-01 08:00                │
│ 乘客: 王小明 (1人)         總金額: NT$ 15,000              │
│ ────────────────────────────────────────────────────────── │
│                    [查看詳情] [修改] [取消]                  │
└─────────────────────────────────────────────────────────────┘
```

**訂單狀態顏色**：

- 待付款：橘色 `#FFC107`
- 已確認：綠色 `#28A745`
- 已取消：紅色 `#DC3545`
- 已完成：藍色 `#007BFF`

---

## 🎛️ 組件規範

### 按鈕組件

#### Primary Button

```css
.btn-primary {
  background-color: var(--kiwi-blue);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background-color: #0056a3;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
```

#### Secondary Button

```css
.btn-secondary {
  background-color: transparent;
  color: var(--kiwi-blue);
  border: 2px solid var(--kiwi-blue);
  padding: 10px 22px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background-color: var(--kiwi-blue);
  color: white;
}
```

### 表單組件

#### 輸入框

```css
.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border-gray);
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--kiwi-blue);
  box-shadow: 0 0 0 3px rgba(0, 119, 204, 0.1);
}

.form-input.error {
  border-color: var(--danger);
}
```

#### 下拉選單

```css
.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border-gray);
  border-radius: 8px;
  font-size: 16px;
  background-color: white;
  cursor: pointer;
}

.form-select:focus {
  outline: none;
  border-color: var(--kiwi-blue);
}
```

### 卡片組件

#### 基礎卡片

```css
.card {
  background-color: white;
  border: 1px solid var(--border-gray);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s;
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
```

#### 航班卡片

```css
.flight-card {
  background-color: white;
  border: 1px solid var(--border-gray);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.2s;
  position: relative;
}

.flight-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.flight-card.selected {
  border-color: var(--kiwi-blue);
  border-width: 2px;
}
```

---

## 📱 響應式設計

### 手機端適配

#### 導覽設計

```css
/* 手機端漢堡選單 */
@media (max-width: 767px) {
  .header-nav {
    position: fixed;
    top: 0;
    left: -100%;
    width: 80%;
    height: 100vh;
    background-color: white;
    transition: left 0.3s;
    z-index: 1000;
  }

  .header-nav.active {
    left: 0;
  }
}
```

#### 表單適配

```css
/* 手機端表單調整 */
@media (max-width: 767px) {
  .form-row {
    flex-direction: column;
  }

  .form-col {
    width: 100%;
    margin-bottom: 16px;
  }

  .btn {
    width: 100%;
    margin-bottom: 12px;
  }
}
```

### 平板端適配

#### 卡片佈局

```css
/* 平板端卡片佈局 */
@media (min-width: 768px) and (max-width: 1023px) {
  .flight-cards {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .sidebar {
    width: 250px;
  }
}
```

---

## 🔄 互動狀態設計

### 載入狀態

#### 頁面載入

```css
.loading-skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

#### 按鈕載入

```css
.btn-loading {
  position: relative;
  color: transparent;
}

.btn-loading::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
```

### 錯誤狀態

#### 表單錯誤

```css
.form-error {
  color: var(--danger);
  font-size: 14px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.form-error::before {
  content: "⚠️";
  font-size: 12px;
}
```

#### 系統錯誤

```html
<div class="error-page">
  <div class="error-icon">✈️💔</div>
  <h1>糟糕！出了點問題</h1>
  <p>我們正在努力修復這個問題，請稍後再試。</p>
  <button class="btn-primary" onclick="location.reload()">重新載入</button>
</div>
```

### 成功狀態

#### 成功訊息

```css
.success-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: var(--success);
  color: white;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

---

## 🔄 API 整合規範

### 請求格式

```javascript
// 統一的 API 請求格式
const apiRequest = async (endpoint, options = {}) => {
  const defaultOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...defaultOptions,
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return await response.json();
};
```

### 錯誤處理

```javascript
// 統一的錯誤處理
const handleApiError = (error) => {
  switch (error.status) {
    case 400:
      showErrorMessage("請求格式錯誤，請檢查輸入資料");
      break;
    case 401:
      showErrorMessage("請重新登入");
      redirectToLogin();
      break;
    case 403:
      showErrorMessage("權限不足");
      break;
    case 404:
      showErrorMessage("找不到相關資料");
      break;
    case 500:
      showErrorMessage("系統暫時無法服務，請稍後再試");
      break;
    default:
      showErrorMessage("發生未知錯誤，請聯絡客服");
  }
};
```

---

## 🎯 無障礙設計

### 鍵盤導覽

```css
/* 焦點指示器 */
.focusable:focus {
  outline: 2px solid var(--kiwi-blue);
  outline-offset: 2px;
}

/* 跳過連結 */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--kiwi-blue);
  color: white;
  padding: 8px;
  z-index: 1000;
  text-decoration: none;
  border-radius: 4px;
}

.skip-link:focus {
  top: 6px;
}
```

### 螢幕閱讀器

```html
<!-- 語義化標記範例 -->
<main role="main" aria-label="主要內容">
  <section aria-labelledby="search-heading">
    <h2 id="search-heading">航班搜尋</h2>
    <form role="search" aria-label="搜尋航班">
      <label for="departure">出發地</label>
      <input
        id="departure"
        type="text"
        aria-required="true"
        aria-describedby="departure-help"
      />
      <div id="departure-help" class="sr-only">請輸入出發機場名稱或代碼</div>
    </form>
  </section>
</main>
```

### 色彩對比

```css
/* 確保色彩對比符合 WCAG 2.1 AA 標準 */
.text-primary {
  color: #003366;
} /* 對比度 > 4.5:1 */
.text-secondary {
  color: #495057;
} /* 對比度 > 4.5:1 */
.btn-primary {
  background-color: #0077cc;
} /* 對比度 > 4.5:1 */
```

---

## 🧪 測試清單

### 功能測試

- [ ] 所有表單欄位正常運作
- [ ] 驗證規則正確執行
- [ ] API 整合測試通過
- [ ] 支付流程完整測試
- [ ] 會員功能正常
- [ ] 搜尋功能準確
- [ ] 篩選功能正常
- [ ] 響應式佈局適配

### 瀏覽器測試

- [ ] Chrome (最新版本)
- [ ] Firefox (最新版本)
- [ ] Safari (最新版本)
- [ ] Edge (最新版本)
- [ ] 行動版 Safari
- [ ] 行動版 Chrome

### 性能測試

- [ ] 首頁載入時間 < 3 秒
- [ ] 搜尋結果載入 < 2 秒
- [ ] 圖片最佳化
- [ ] 字體載入最佳化
- [ ] JavaScript 包大小最佳化

### 無障礙測試

- [ ] 鍵盤導覽完整
- [ ] 螢幕閱讀器相容
- [ ] 色彩對比度符合標準
- [ ] 替代文字完整
- [ ] 語義化標記正確

---

## 📋 開發交付清單

### 設計資源

- [ ] Figma 設計稿完成
- [ ] 組件庫建立
- [ ] 圖示資源準備
- [ ] 色彩規範文件
- [ ] 字體資源準備

### 技術規範

- [ ] CSS 變數定義
- [ ] 組件命名規範
- [ ] 響應式斷點設定
- [ ] 動畫效果定義
- [ ] 無障礙屬性標準

### 品質保證

- [ ] 設計一致性檢查
- [ ] 使用者體驗測試
- [ ] 性能最佳化
- [ ] 瀏覽器相容性測試
- [ ] 無障礙標準驗證

---

✏️ _最後更新時間：2025-07-18_

#### 輔助色彩（Secondary Colors）

- **天空藍 (Sky Blue)：** `#E6F3FF` - 背景色、卡片底色
- **珊瑚橙 (Coral)：** `#FFE6DC` - 警告背景、優惠標籤
- **成功綠 (Success Green)：** `#28A745` - 成功狀態、確認訊息
- **警告紅 (Warning Red)：** `#DC3545` - 錯誤狀態、刪除操作

#### 中性色彩（Neutral Colors）

- **純白 (Pure White)：** `#FFFFFF` - 主背景
- **淺灰 (Light Gray)：** `#F8F9FA` - 區塊分隔、輸入框背景
- **中灰 (Medium Gray)：** `#6C757D` - 次要文字、說明文字
- **深灰 (Dark Gray)：** `#343A40` - 主要文字、內容標題

### 1.2 字體系統（Typography）

#### 字體家族

- **中文字體：** 'Noto Sans TC', 'Microsoft JhengHei', sans-serif
- **英文字體：** 'Inter', 'Helvetica Neue', Arial, sans-serif
- **數字字體：** 'Roboto Mono', monospace (用於價格、時間顯示)

#### 字體大小階層

- **H1 主標題：** 32px / 2rem - 頁面主標題
- **H2 副標題：** 24px / 1.5rem - 區塊標題
- **H3 小標題：** 20px / 1.25rem - 卡片標題
- **Body Large：** 18px / 1.125rem - 重要內容
- **Body Regular：** 16px / 1rem - 一般內容
- **Body Small：** 14px / 0.875rem - 說明文字
- **Caption：** 12px / 0.75rem - 輔助說明

### 1.3 間距系統（Spacing System）

#### 基礎間距單位

- **基礎單位：** 8px
- **空間階層：** 4px, 8px, 16px, 24px, 32px, 48px, 64px

#### 組件間距

- **按鈕內邊距：** 12px 24px
- **卡片內邊距：** 24px
- **表單欄位間距：** 16px
- **區塊間距：** 32px

### 1.4 圓角與陰影（Border Radius & Shadows）

#### 圓角設定

- **小圓角：** 4px - 按鈕、標籤
- **中圓角：** 8px - 卡片、輸入框
- **大圓角：** 16px - 大型卡片、模態視窗

#### 陰影系統

- **輕微陰影：** `box-shadow: 0 2px 4px rgba(0,0,0,0.1)` - 按鈕懸停
- **卡片陰影：** `box-shadow: 0 4px 12px rgba(0,0,0,0.15)` - 卡片組件
- **深度陰影：** `box-shadow: 0 8px 24px rgba(0,0,0,0.2)` - 模態視窗

---

## 2. 頁面佈局設計（Page Layout）

### 2.1 整體佈局架構

```
[Header Navigation]
[Main Content Area]
[Footer]
```

#### 網格系統

- **容器最大寬度：** 1200px
- **網格欄位：** 12 欄位系統
- **中斷點：**
  - 手機：< 768px
  - 平板：768px - 1024px
  - 桌機：> 1024px

### 2.2 頁首設計（Header）

```
[Logo] [搜尋欄] [登入/註冊] [會員選單]
```

#### 頁首規格

- **高度：** 72px
- **背景色：** `#FFFFFF`
- **邊框：** 底部 1px `#E9ECEF`
- **Logo 尺寸：** 高度 40px
- **搜尋欄寬度：** 320px（桌機）

#### 導覽選單

- **主要導覽：** 首頁、航班搜尋、我的訂單、客服中心
- **次要導覽：** 登入、註冊、會員中心、登出

### 2.3 頁尾設計（Footer）

```
[公司資訊] [快速連結] [客服聯絡] [社群媒體]
[版權聲明]
```

#### 頁尾規格

- **背景色：** `#003366`
- **文字色：** `#FFFFFF`
- **內邊距：** 48px 0
- **連結懸停色：** `#0077CC`

---

## 3. 核心頁面設計

### 3.1 首頁（Homepage）

#### 頁面結構

```
[Hero Section - 航班搜尋]
[Feature Section - 服務特色]
[Popular Destinations - 熱門目的地]
[Testimonials - 用戶評價]
```

#### 航班搜尋表單設計

- **佈局：** 水平排列（桌機）/ 垂直排列（手機）
- **背景：** 漸層背景 `linear-gradient(135deg, #0077CC 0%, #003366 100%)`
- **表單欄位：**
  - 出發地（下拉選單 + 搜尋）
  - 目的地（下拉選單 + 搜尋）
  - 出發日期（日期選擇器）
  - 乘客人數（數字選擇器）
  - 搜尋按鈕（主要 CTA）

#### 搜尋按鈕設計

- **樣式：** 主要按鈕
- **顏色：** `#FF6B35`
- **文字：** 白色 16px
- **尺寸：** 高度 48px，寬度 120px
- **懸停效果：** 顏色加深 10%

### 3.2 航班搜尋結果頁（Search Results）

#### 頁面結構

```
[搜尋條件摘要]
[篩選側邊欄] [航班列表]
[分頁導航]
```

#### 搜尋條件摘要

- **顯示內容：** 路線、日期、乘客人數
- **編輯功能：** 點擊可修改搜尋條件
- **樣式：** 淺藍背景 `#E6F3FF`

#### 篩選側邊欄

- **寬度：** 280px
- **篩選項目：**
  - 出發時間
  - 航空公司
  - 價格範圍
  - 航班類型
- **重置按鈕：** 次要按鈕樣式

#### 航班卡片設計

```
[航空公司Logo] [航班號碼] [出發時間] → [抵達時間]
[出發機場] [飛行時間] [抵達機場]
[價格] [選擇按鈕]
```

- **卡片尺寸：** 最小高度 120px
- **背景：** 白色
- **邊框：** 1px `#E9ECEF`
- **懸停效果：** 陰影加深
- **價格顯示：** 大號字體 24px `#003366`

### 3.3 乘客資訊填寫頁（Passenger Details）

#### 頁面結構

```
[進度指示器]
[航班資訊摘要]
[乘客資訊表單]
[價格摘要]
[下一步按鈕]
```

#### 進度指示器

- **步驟：** 1.選擇航班 → 2.填寫資訊 → 3.付款 → 4.完成
- **當前步驟：** 高亮顯示 `#0077CC`
- **完成步驟：** 綠色勾選 `#28A745`

#### 乘客資訊表單

- **每位乘客卡片：** 獨立區塊
- **必填欄位：** 姓名、護照號碼、出生日期
- **欄位驗證：** 即時驗證並顯示錯誤訊息
- **錯誤狀態：** 紅色邊框 `#DC3545`

#### 價格摘要

- **位置：** 右側固定（桌機）/ 底部固定（手機）
- **內容：** 機票費用、稅金、總價
- **樣式：** 卡片設計，強調總價

### 3.4 付款頁面（Payment）

#### 頁面結構

```
[進度指示器]
[訂單摘要]
[付款方式選擇]
[付款表單]
[確認付款按鈕]
```

#### 付款方式選擇

- **選項：** 信用卡、ATM 轉帳、銀行轉帳
- **設計：** 單選按鈕 + 圖示
- **預設選擇：** 信用卡

#### 信用卡表單

- **欄位：** 卡號、有效期限、CVV、持卡人姓名
- **安全提示：** SSL 加密說明
- **卡片識別：** 自動識別卡片類型並顯示圖示

#### 確認付款按鈕

- **樣式：** 主要按鈕，大尺寸
- **顏色：** `#28A745`
- **文字：** "確認付款 NT$15,000"
- **載入狀態：** 顯示旋轉圖示

### 3.5 會員中心（Member Center）

#### 頁面結構

```
[側邊導覽] [主要內容區]
```

#### 側邊導覽

- **選項：** 個人資料、我的訂單、修改密碼、登出
- **寬度：** 240px
- **樣式：** 垂直導覽列

#### 我的訂單頁面

```
[訂單篩選] [訂單列表]
```

#### 訂單卡片設計

```
[訂單編號] [訂單狀態]
[航班資訊：出發地 → 目的地 | 日期]
[乘客資訊] [總價] [操作按鈕]
```

- **狀態顏色：**
  - 待付款：`#FFC107`
  - 已確認：`#28A745`
  - 已取消：`#DC3545`
- **操作按鈕：** 查看詳情、修改、取消

---

## 4. 組件設計規範

### 4.1 按鈕組件（Buttons）

#### 主要按鈕（Primary Button）

- **顏色：** `#0077CC` 背景，白色文字
- **懸停：** `#0056A3`
- **按下：** `#004080`
- **禁用：** `#6C757D`
- **尺寸：** 高度 40px，內邊距 12px 24px

#### 次要按鈕（Secondary Button）

- **顏色：** 透明背景，`#0077CC` 邊框和文字
- **懸停：** `#E6F3FF` 背景
- **尺寸：** 高度 40px，內邊距 12px 24px

#### 危險按鈕（Danger Button）

- **顏色：** `#DC3545` 背景，白色文字
- **懸停：** `#C82333`
- **用途：** 取消訂單、刪除等操作

### 4.2 表單組件（Form Components）

#### 輸入框（Input Field）

- **邊框：** 1px `#CED4DA`
- **焦點：** 2px `#0077CC` 邊框
- **錯誤：** 2px `#DC3545` 邊框
- **高度：** 40px
- **圓角：** 4px

#### 下拉選單（Dropdown）

- **樣式：** 與輸入框一致
- **箭頭：** 向下箭頭圖示
- **選項懸停：** `#E6F3FF` 背景

#### 日期選擇器（Date Picker）

- **日曆樣式：** 簡潔的月曆設計
- **今天標記：** `#0077CC` 背景
- **選中日期：** `#FF6B35` 背景

### 4.3 卡片組件（Cards）

#### 基礎卡片

- **背景：** `#FFFFFF`
- **邊框：** 1px `#E9ECEF`
- **圓角：** 8px
- **陰影：** `0 2px 4px rgba(0,0,0,0.1)`
- **內邊距：** 24px

#### 航班卡片

- **特殊樣式：** 左側彩色邊框（航空公司色彩）
- **懸停效果：** 陰影加深、輕微向上移動
- **選中狀態：** `#0077CC` 邊框

### 4.4 模態視窗（Modal）

#### 基礎模態視窗

- **背景遮罩：** `rgba(0,0,0,0.5)`
- **視窗背景：** `#FFFFFF`
- **最大寬度：** 600px
- **圓角：** 12px
- **陰影：** `0 8px 24px rgba(0,0,0,0.2)`

#### 確認對話框

- **標題：** 警告圖示 + 文字
- **按鈕：** 確認（危險按鈕）+ 取消（次要按鈕）

---

## 5. 響應式設計

### 5.1 中斷點設定

#### 桌機（Desktop）

- **寬度：** > 1024px
- **航班搜尋表單：** 水平排列
- **側邊欄：** 顯示完整篩選器
- **航班列表：** 3 欄卡片佈局

#### 平板（Tablet）

- **寬度：** 768px - 1024px
- **航班搜尋表單：** 2x2 網格
- **側邊欄：** 摺疊式篩選器
- **航班列表：** 2 欄卡片佈局

#### 手機（Mobile）

- **寬度：** < 768px
- **航班搜尋表單：** 垂直排列
- **側邊欄：** 底部彈出式篩選器
- **航班列表：** 單欄卡片佈局

### 5.2 手機端特殊設計

#### 觸控優化

- **按鈕最小尺寸：** 44px x 44px
- **表單欄位間距：** 增加至 20px
- **滑動手勢：** 支援左右滑動篩選

#### 導覽優化

- **漢堡選單：** 主導覽摺疊
- **底部導覽：** 快速操作按鈕
- **返回按鈕：** 明顯的返回指示

---

## 6. 互動設計

### 6.1 載入狀態

#### 頁面載入

- **骨架屏：** 顯示內容結構輪廓
- **顏色：** `#F8F9FA` 背景，動態漸層效果
- **載入時間：** 超過 3 秒顯示進度百分比

#### 按鈕載入

- **旋轉圖示：** 白色 spinner
- **按鈕文字：** 變更為 "處理中..."
- **禁用狀態：** 防止重複點擊

### 6.2 錯誤狀態

#### 表單錯誤

- **即時驗證：** 失去焦點時驗證
- **錯誤訊息：** 欄位下方顯示，紅色文字
- **錯誤圖示：** 驚嘆號圖示

#### 系統錯誤

- **錯誤頁面：** 友善的錯誤插圖
- **錯誤代碼：** 技術人員參考
- **重試按鈕：** 主要按鈕樣式

### 6.3 成功狀態

#### 操作成功

- **成功訊息：** 綠色背景 toast 通知
- **成功圖示：** 勾選圖示
- **自動消失：** 3 秒後自動隱藏

#### 訂票成功

- **成功頁面：** 慶祝插圖
- **訂單資訊：** 清楚的訂單摘要
- **下一步引導：** 查看訂單、列印機票

---

## 7. 無障礙設計

### 7.1 色彩對比

#### 對比度標準

- **一般文字：** 至少 4.5:1 對比度
- **大型文字：** 至少 3:1 對比度
- **非文字元素：** 至少 3:1 對比度

#### 色彩無障礙

- **顏色盲友善：** 不只依賴顏色傳達資訊
- **狀態指示：** 結合圖示和文字
- **錯誤提示：** 明確的文字說明

### 7.2 鍵盤導覽

#### Tab 順序

- **邏輯順序：** 由左至右、由上至下
- **跳過連結：** 快速跳至主要內容
- **焦點指示：** 清楚的焦點邊框

#### 鍵盤快捷鍵

- **搜尋：** Ctrl + F 或 Cmd + F
- **提交表單：** Enter 鍵
- **關閉模態視窗：** Esc 鍵

### 7.3 螢幕閱讀器

#### 語義化標記

- **標題階層：** 正確的 H1-H6 使用
- **地標：** header, nav, main, footer
- **表單標籤：** 每個輸入框都有對應標籤

#### 替代文字

- **圖片 alt：** 描述性替代文字
- **裝飾性圖片：** 空的 alt 屬性
- **圖示按鈕：** aria-label 屬性

---

## 8. 性能優化

### 8.1 圖片優化

#### 圖片格式

- **照片：** WebP 格式，JPEG 備用
- **圖示：** SVG 格式
- **動畫：** CSS 動畫優於 GIF

#### 圖片載入

- **懶載入：** 延遲載入非關鍵圖片
- **響應式圖片：** 不同尺寸的圖片版本
- **壓縮：** 適當的壓縮比例

### 8.2 字體優化

#### 字體載入

- **字體顯示：** font-display: swap
- **預載入：** 關鍵字體預載入
- **備用字體：** 系統字體備用

#### 字體檔案

- **WOFF2 格式：** 現代瀏覽器支援
- **字體子集：** 只包含需要的字符
- **字體大小：** 控制在 100KB 以下

---

## 9. 瀏覽器支援

### 9.1 支援範圍

#### 現代瀏覽器

- **Chrome：** 最新版本 - 2 個版本
- **Firefox：** 最新版本 - 2 個版本
- **Safari：** 最新版本 - 2 個版本
- **Edge：** 最新版本 - 2 個版本

#### 行動瀏覽器

- **iOS Safari：** iOS 14+
- **Android Chrome：** Android 8+
- **Samsung Internet：** 最新版本

### 9.2 漸進式增強

#### 基礎功能

- **核心功能：** 所有瀏覽器都支援
- **視覺增強：** 現代瀏覽器的額外效果
- **JS 失效：** 基本功能仍可使用

#### 功能檢測

- **CSS 特性：** @supports 查詢
- **JavaScript API：** 功能檢測
- **備用方案：** 優雅降級

---

## 10. 設計交付

### 10.1 設計檔案

#### Figma 設計稿

- **頁面設計：** 所有主要頁面
- **組件庫：** 可重複使用的組件
- **設計系統：** 顏色、字體、間距規範

#### 切圖資源

- **圖示：** SVG 格式
- **插圖：** PNG 或 SVG 格式
- **背景圖：** WebP 和 JPEG 格式

### 10.2 開發規範

#### CSS 變數

```css
:root {
  --primary-color: #0077cc;
  --secondary-color: #ff6b35;
  --text-color: #343a40;
  --bg-color: #ffffff;
  --border-radius: 8px;
  --shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

#### 組件命名

- **BEM 命名法：** block\_\_element--modifier
- **組件前綴：** kiwi-button, kiwi-card
- **狀態類別：** is-active, is-disabled

### 10.3 品質檢查

#### 設計一致性

- **色彩使用：** 符合設計系統
- **字體使用：** 正確的字體階層
- **間距使用：** 統一的間距規範

#### 無障礙檢查

- **色彩對比：** 通過 WCAG 2.1 AA 標準
- **鍵盤導覽：** 完整的 Tab 順序
- **螢幕閱讀器：** 語義化標記

---

✏️ _最後更新時間：2025-07-18_
