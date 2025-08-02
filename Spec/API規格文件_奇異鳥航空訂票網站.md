# 奇異鳥航空訂票網站 - API 規格文件

## 文件資訊

- **文件名稱：** 奇異鳥航空訂票網站 API 規格書
- **版本：** v1.0
- **撰寫人：** SA
- **日期：** 2025-07-17
- **文件狀態：** Draft

---

## 通用錯誤處理

所有 API 都使用統一的錯誤響應格式：

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "錯誤訊息描述",
    "details": {}
  }
}
```

### 常見錯誤狀態碼

| 狀態碼 | 說明               |
| ------ | ------------------ |
| 400    | 請求參數錯誤       |
| 401    | 未授權（需要登入） |
| 403    | 權限不足           |
| 404    | 資源不存在         |
| 409    | 資源衝突           |
| 500    | 伺服器內部錯誤     |

---

## 1. 用戶認證相關 API

### 1.1 用戶註冊

#### API 描述與用途

提供新用戶註冊功能，建立新的用戶帳戶。

#### HTTP 方法與路徑

```
POST /api/auth/register
```

#### 權限要求

- 無需認證
- 需驗證 email 唯一性

#### 請求參數

| 參數名稱        | 類型   | 必填 | 長度限制 | 說明                     |
| --------------- | ------ | ---- | -------- | ------------------------ |
| firstName       | string | Y    | 1-50     | 姓氏                     |
| lastName        | string | Y    | 1-50     | 名字                     |
| email           | string | Y    | 5-100    | 電子郵件（需符合格式）   |
| password        | string | Y    | 8-128    | 密碼（需包含英數字）     |
| confirmPassword | string | Y    | 8-128    | 確認密碼（需與密碼相同） |
| phoneNumber     | string | Y    | 10-15    | 手機號碼                 |

#### 響應格式與狀態碼

**成功響應 (201 Created)**

```json
{
  "data": {
    "userId": "uuid-string",
    "email": "user@example.com",
    "firstName": "王",
    "lastName": "小明",
    "createdAt": "2025-07-17T10:00:00Z"
  },
  "message": "註冊成功，您現在可以使用新帳戶登入"
}
```

#### 錯誤處理

| 錯誤碼 | HTTP 狀態 | 說明             |
| ------ | --------- | ---------------- |
| 40001  | 400       | 電子郵件格式錯誤 |
| 40002  | 400       | 密碼強度不足     |
| 40003  | 409       | 電子郵件已被註冊 |
| 40004  | 400       | 確認密碼不一致   |

#### 業務邏輯說明

1. 驗證所有輸入參數格式
2. 檢查電子郵件是否已存在
3. 密碼加密儲存（使用 bcrypt）
4. 建立用戶帳戶並設為啟用狀態
5. 記錄註冊日誌

#### 實際範例

**HTTP 請求**

```http
POST /api/auth/register HTTP/1.1
Content-Type: application/json

{
  "firstName": "王",
  "lastName": "小明",
  "email": "wang.xiaoming@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "phoneNumber": "0912345678"
}
```

**cURL 命令**

```bash
curl -X POST https://api.kiwibird.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "王",
    "lastName": "小明",
    "email": "wang.xiaoming@example.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123",
    "phoneNumber": "0912345678"
  }'
```

---

### 1.2 用戶登入

#### API 描述與用途

提供用戶登入功能，驗證用戶身份並返回認證 Token。

#### HTTP 方法與路徑

```
POST /api/auth/login
```

#### 權限要求

- 無需認證
- 需要有效的用戶帳戶

#### 請求參數

| 參數名稱 | 類型   | 必填 | 說明     |
| -------- | ------ | ---- | -------- |
| email    | string | Y    | 電子郵件 |
| password | string | Y    | 密碼     |

#### 響應格式與狀態碼

**成功響應 (200 OK)**

```json
{
  "data": {
    "accessToken": "jwt-token-string",
    "refreshToken": "refresh-token-string",
    "user": {
      "userId": "uuid-string",
      "email": "user@example.com",
      "firstName": "王",
      "lastName": "小明"
    }
  },
  "message": "登入成功"
}
```

#### 錯誤處理

| 錯誤碼 | HTTP 狀態 | 說明               |
| ------ | --------- | ------------------ |
| 40101  | 401       | 電子郵件或密碼錯誤 |

#### 業務邏輯說明

1. 驗證電子郵件和密碼
2. 檢查帳戶是否存在且密碼正確
3. 生成 JWT Access Token (有效期 1 小時)
4. 生成 Refresh Token (有效期 30 天)
5. 記錄登入日誌和 IP 位址

#### 實際範例

**HTTP 請求**

```http
POST /api/auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "wang.xiaoming@example.com",
  "password": "SecurePass123"
}
```

---

## 2. 航班搜尋相關 API

### 2.1 搜尋航班

#### API 描述與用途

根據搜尋條件查詢可用航班，支援多種排序和篩選選項。

#### HTTP 方法與路徑

```
GET /api/flights/search
```

#### 權限要求

- 無需認證（公開 API）

#### 請求參數

| 參數名稱      | 類型   | 必填 | 格式範例   | 說明                             |
| ------------- | ------ | ---- | ---------- | -------------------------------- |
| departure     | string | Y    | TPE        | 出發地機場代碼                   |
| arrival       | string | Y    | NRT        | 目的地機場代碼                   |
| departureDate | string | Y    | 2025-12-01 | 出發日期 (YYYY-MM-DD)            |
| passengers    | number | Y    | 2          | 乘客人數 (1-9)                   |
| sortBy        | string | N    | price      | 排序方式 (price, time, duration) |
| sortOrder     | string | N    | asc        | 排序順序 (asc, desc)             |

#### 響應格式與狀態碼

**成功響應 (200 OK)**

```json
{
  "data": {
    "flights": [
      {
        "flightId": "KW001",
        "flightNumber": "KW001",
        "departure": {
          "airportCode": "TPE",
          "airportName": "桃園國際機場",
          "city": "台北",
          "dateTime": "2025-12-01T08:00:00Z"
        },
        "arrival": {
          "airportCode": "NRT",
          "airportName": "成田國際機場",
          "city": "東京",
          "dateTime": "2025-12-01T12:30:00Z"
        },
        "duration": "4h 30m",
        "aircraft": "Boeing 787-9",
        "price": {
          "amount": 15000,
          "currency": "TWD"
        },
        "availableSeats": 48,
        "class": "Economy"
      }
    ],
    "totalResults": 5,
    "searchCriteria": {
      "departure": "TPE",
      "arrival": "NRT",
      "departureDate": "2025-12-01",
      "passengers": 2
    }
  }
}
```

#### 錯誤處理

| 錯誤碼 | HTTP 狀態 | 說明             |
| ------ | --------- | ---------------- |
| 40201  | 400       | 無效的機場代碼   |
| 40202  | 400       | 日期格式錯誤     |
| 40203  | 400       | 乘客人數超出限制 |
| 40404  | 404       | 無可用航班       |

#### 業務邏輯說明

1. 驗證搜尋參數格式
2. 查詢符合條件的航班
3. 根據指定條件排序
4. 計算可用座位數
5. 快取搜尋結果 (15 分鐘)

#### 實際範例

**HTTP 請求**

```http
GET /api/flights/search?departure=TPE&arrival=NRT&departureDate=2025-12-01&passengers=2&sortBy=price&sortOrder=asc HTTP/1.1
```

---

### 2.2 查詢特定航班詳情

#### API 描述與用途

查詢特定航班的詳細資訊，包含座位配置和詳細政策。

#### HTTP 方法與路徑

```
GET /api/flights/{flightId}
```

#### 權限要求

- 無需認證

#### 請求參數

| 參數名稱 | 類型   | 位置 | 必填 | 說明     |
| -------- | ------ | ---- | ---- | -------- |
| flightId | string | path | Y    | 航班編號 |

#### 響應格式與狀態碼

**成功響應 (200 OK)**

```json
{
  "data": {
    "flightId": "KW001",
    "flightNumber": "KW001",
    "departure": {
      "airportCode": "TPE",
      "airportName": "桃園國際機場",
      "terminal": "Terminal 1",
      "gate": "A12",
      "city": "台北",
      "country": "台灣",
      "dateTime": "2025-12-01T08:00:00Z"
    },
    "arrival": {
      "airportCode": "NRT",
      "airportName": "成田國際機場",
      "terminal": "Terminal 1",
      "city": "東京",
      "country": "日本",
      "dateTime": "2025-12-01T12:30:00Z"
    },
    "duration": "4h 30m",
    "aircraft": {
      "model": "Boeing 787-9",
      "totalSeats": 250,
      "seatConfiguration": "3-3-3"
    },
    "price": {
      "amount": 15000,
      "currency": "TWD",
      "taxes": 2500,
      "fees": 500
    },
    "policies": {
      "cancellation": "可於起飛前24小時免費取消",
      "modification": "可於起飛前2小時修改，需支付手續費",
      "baggage": "免費託運行李20公斤"
    },
    "availableSeats": 48
  }
}
```

---

## 3. 訂票相關 API

### 3.1 建立訂單

#### API 描述與用途

建立新的機票訂單，包含乘客資訊和付款處理。

#### HTTP 方法與路徑

```
POST /api/bookings
```

#### 權限要求

- 需要用戶認證 (Bearer Token)
- 需要有效的航班資訊

#### 請求參數

```json
{
  "flightId": "KW001",
  "passengers": [
    {
      "firstName": "王",
      "lastName": "小明",
      "passportNumber": "123456789",
      "dateOfBirth": "1990-01-01",
      "nationality": "TW",
      "email": "wang.xiaoming@example.com",
      "phoneNumber": "0912345678"
    }
  ],
  "contactInfo": {
    "email": "wang.xiaoming@example.com",
    "phoneNumber": "0912345678"
  },
  "payment": {
    "method": "credit_card",
    "cardNumber": "4111111111111111",
    "expiryDate": "12/26",
    "cvv": "123",
    "cardholderName": "WANG XIAO MING"
  }
}
```

#### 響應格式與狀態碼

**成功響應 (201 Created)**

```json
{
  "data": {
    "bookingId": "BK2025071700001",
    "status": "confirmed",
    "flight": {
      "flightNumber": "KW001",
      "departure": {
        "airportCode": "TPE",
        "dateTime": "2025-12-01T08:00:00Z"
      },
      "arrival": {
        "airportCode": "NRT",
        "dateTime": "2025-12-01T12:30:00Z"
      }
    },
    "passengers": [
      {
        "passengerId": "PS001",
        "firstName": "王",
        "lastName": "小明",
        "seatNumber": "12A"
      }
    ],
    "payment": {
      "amount": 15000,
      "currency": "TWD",
      "status": "paid",
      "transactionId": "TXN123456789"
    },
    "createdAt": "2025-07-17T10:00:00Z"
  },
  "message": "訂單建立成功，電子機票已發送至您的信箱"
}
```

#### 錯誤處理

| 錯誤碼 | HTTP 狀態 | 說明             |
| ------ | --------- | ---------------- |
| 40301  | 400       | 乘客資訊不完整   |
| 40302  | 400       | 護照號碼格式錯誤 |
| 40303  | 409       | 航班已滿座       |
| 40304  | 402       | 付款處理失敗     |

---

### 3.2 填寫乘客資訊

#### API 描述與用途

接收用戶填寫的乘客資訊，驗證格式並暫存，為後續建立訂單做準備。

#### HTTP 方法與路徑

```
POST /api/bookings/passengers
```

#### 權限要求

- 需要用戶認證 (Bearer Token)
- 需要有效的航班選擇資訊

#### 請求參數

| 參數名稱   | 類型   | 必填 | 長度限制 | 說明          |
| ---------- | ------ | ---- | -------- | ------------- |
| flightId   | string | Y    | 36       | 選擇的航班 ID |
| passengers | array  | Y    | 1-9      | 乘客資訊陣列  |

**乘客資訊物件結構：**

| 參數名稱       | 類型   | 必填 | 長度限制 | 說明                  |
| -------------- | ------ | ---- | -------- | --------------------- |
| firstName      | string | Y    | 1-50     | 姓氏                  |
| lastName       | string | Y    | 1-50     | 名字                  |
| passportNumber | string | Y    | 6-20     | 護照號碼              |
| dateOfBirth    | string | Y    | -        | 出生日期 (YYYY-MM-DD) |
| nationality    | string | Y    | 2        | 國籍代碼 (ISO 3166-1) |
| gender         | string | N    | -        | 性別 (M/F/OTHER)      |
| email          | string | N    | 5-100    | 電子郵件              |
| phoneNumber    | string | N    | 10-15    | 電話號碼              |

#### 響應格式與狀態碼

**成功響應 (200 OK)**

```json
{
  "data": {
    "sessionId": "SESSION123456789",
    "flightInfo": {
      "flightId": "KW001",
      "flightNumber": "KW001",
      "departure": {
        "airportCode": "TPE",
        "city": "台北",
        "dateTime": "2025-12-01T08:00:00Z"
      },
      "arrival": {
        "airportCode": "NRT",
        "city": "東京",
        "dateTime": "2025-12-01T12:30:00Z"
      }
    },
    "passengers": [
      {
        "passengerId": "TEMP_PS001",
        "firstName": "王",
        "lastName": "小明",
        "passportNumber": "123456789",
        "dateOfBirth": "1990-01-01",
        "nationality": "TW"
      }
    ],
    "priceBreakdown": {
      "basePrice": 15000,
      "taxes": 2500,
      "fees": 500,
      "totalAmount": 18000,
      "currency": "TWD"
    },
    "validUntil": "2025-07-17T11:00:00Z"
  },
  "message": "乘客資訊驗證成功，請確認資訊後進行付款"
}
```

#### 錯誤處理

| 錯誤碼 | HTTP 狀態 | 說明                 |
| ------ | --------- | -------------------- |
| 40201  | 400       | 乘客資訊格式錯誤     |
| 40202  | 400       | 護照號碼格式不正確   |
| 40203  | 400       | 出生日期格式錯誤     |
| 40204  | 400       | 國籍代碼無效         |
| 40205  | 409       | 乘客人數超過航班限制 |
| 40206  | 404       | 指定航班不存在       |

#### 業務邏輯說明

1. 驗證所有乘客資訊格式
2. 檢查護照號碼格式有效性
3. 驗證出生日期合理性（年齡限制）
4. 確認航班仍有足夠座位
5. 計算包含稅費的總價格
6. 建立暫存 session，有效期 15 分鐘
7. 為每位乘客分配暫時 ID

#### 實際範例

**HTTP 請求**

```http
POST /api/bookings/passengers HTTP/1.1
Content-Type: application/json
Authorization: Bearer jwt-token-string

{
  "flightId": "KW001",
  "passengers": [
    {
      "firstName": "王",
      "lastName": "小明",
      "passportNumber": "123456789",
      "dateOfBirth": "1990-01-01",
      "nationality": "TW",
      "gender": "M",
      "email": "wang.xiaoming@example.com",
      "phoneNumber": "0912345678"
    },
    {
      "firstName": "李",
      "lastName": "美麗",
      "passportNumber": "987654321",
      "dateOfBirth": "1992-05-15",
      "nationality": "TW",
      "gender": "F",
      "email": "li.meili@example.com",
      "phoneNumber": "0923456789"
    }
  ]
}
```

**cURL 命令**

```bash
curl -X POST https://api.kiwibird.com/api/bookings/passengers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer jwt-token-string" \
  -d '{
    "flightId": "KW001",
    "passengers": [
      {
        "firstName": "王",
        "lastName": "小明",
        "passportNumber": "123456789",
        "dateOfBirth": "1990-01-01",
        "nationality": "TW",
        "gender": "M",
        "email": "wang.xiaoming@example.com",
        "phoneNumber": "0912345678"
      }
    ]
  }'
```

---

### 3.3 查詢用戶訂單列表

#### API 描述與用途

查詢登入用戶的所有訂單記錄。

#### HTTP 方法與路徑

```
GET /api/bookings/user/{userId}
```

#### 權限要求

- 需要用戶認證
- 只能查詢自己的訂單

#### 請求參數

| 參數名稱 | 類型   | 位置  | 必填 | 說明                |
| -------- | ------ | ----- | ---- | ------------------- |
| userId   | string | path  | Y    | 用戶 ID             |
| page     | number | query | N    | 頁碼（預設 1）      |
| limit    | number | query | N    | 每頁筆數（預設 10） |
| status   | string | query | N    | 訂單狀態篩選        |

#### 響應格式與狀態碼

**成功響應 (200 OK)**

```json
{
  "data": {
    "bookings": [
      {
        "bookingId": "BK2025071700001",
        "status": "confirmed",
        "flight": {
          "flightNumber": "KW001",
          "departure": {
            "airportCode": "TPE",
            "city": "台北",
            "dateTime": "2025-12-01T08:00:00Z"
          },
          "arrival": {
            "airportCode": "NRT",
            "city": "東京",
            "dateTime": "2025-12-01T12:30:00Z"
          }
        },
        "totalAmount": 15000,
        "currency": "TWD",
        "passengerCount": 1,
        "createdAt": "2025-07-17T10:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalRecords": 25,
      "limit": 10
    }
  }
}
```

---

### 3.4 查詢特定訂單詳情

#### API 描述與用途

查詢特定訂單的完整詳細資訊。

#### HTTP 方法與路徑

```
GET /api/bookings/{bookingId}
```

#### 權限要求

- 需要用戶認證
- 只能查詢自己的訂單

#### 響應格式與狀態碼

**成功響應 (200 OK)**

```json
{
  "data": {
    "bookingId": "BK2025071700001",
    "status": "confirmed",
    "flight": {
      "flightNumber": "KW001",
      "departure": {
        "airportCode": "TPE",
        "airportName": "桃園國際機場",
        "city": "台北",
        "dateTime": "2025-12-01T08:00:00Z"
      },
      "arrival": {
        "airportCode": "NRT",
        "airportName": "成田國際機場",
        "city": "東京",
        "dateTime": "2025-12-01T12:30:00Z"
      }
    },
    "passengers": [
      {
        "passengerId": "PS001",
        "firstName": "王",
        "lastName": "小明",
        "passportNumber": "123456789",
        "seatNumber": "12A",
        "ticketNumber": "TKT789456123"
      }
    ],
    "payment": {
      "amount": 15000,
      "currency": "TWD",
      "status": "paid",
      "method": "credit_card",
      "transactionId": "TXN123456789",
      "paidAt": "2025-07-17T10:00:00Z"
    },
    "contactInfo": {
      "email": "wang.xiaoming@example.com",
      "phoneNumber": "0912345678"
    },
    "createdAt": "2025-07-17T10:00:00Z",
    "updatedAt": "2025-07-17T10:00:00Z"
  }
}
```

---

### 3.5 修改訂單

#### API 描述與用途

修改現有訂單的航班日期或乘客資訊。

#### HTTP 方法與路徑

```
PUT /api/bookings/{bookingId}
```

#### 權限要求

- 需要用戶認證
- 只能修改自己的訂單
- 訂單狀態必須允許修改

#### 請求參數

```json
{
  "modificationType": "date_change",
  "newFlightId": "KW002",
  "reason": "行程變更",
  "passengers": [
    {
      "passengerId": "PS001",
      "firstName": "王",
      "lastName": "小明"
    }
  ]
}
```

#### 響應格式與狀態碼

**成功響應 (200 OK)**

```json
{
  "data": {
    "bookingId": "BK2025071700001",
    "status": "modified",
    "originalFlight": {
      "flightNumber": "KW001",
      "departureDate": "2025-12-01"
    },
    "newFlight": {
      "flightNumber": "KW002",
      "departureDate": "2025-12-03"
    },
    "additionalFee": 500,
    "totalAmount": 15500,
    "modifiedAt": "2025-07-17T15:00:00Z"
  },
  "message": "訂單修改成功，更新後的電子機票已發送至您的信箱"
}
```

---

### 3.6 取消訂單

#### API 描述與用途

取消現有訂單並處理退款。

#### HTTP 方法與路徑

```
DELETE /api/bookings/{bookingId}
```

#### 權限要求

- 需要用戶認證
- 只能取消自己的訂單
- 訂單狀態必須允許取消

#### 請求參數

```json
{
  "reason": "行程取消",
  "refundMethod": "original_payment"
}
```

#### 響應格式與狀態碼

**成功響應 (200 OK)**

```json
{
  "data": {
    "bookingId": "BK2025071700001",
    "status": "cancelled",
    "refund": {
      "amount": 13500,
      "currency": "TWD",
      "cancellationFee": 1500,
      "refundMethod": "credit_card",
      "estimatedRefundDays": "3-5 個工作天"
    },
    "cancelledAt": "2025-07-17T16:00:00Z"
  },
  "message": "訂單取消成功，退款將在3-5個工作天內處理完成"
}
```

---

## 4. 客服相關 API

### 4.1 查詢常見問題

#### API 描述與用途

查詢系統常見問題列表，依分類顯示。

#### HTTP 方法與路徑

```
GET /api/support/faq
```

#### 權限要求

- 無需認證

#### 請求參數

| 參數名稱 | 類型   | 必填 | 說明                                         |
| -------- | ------ | ---- | -------------------------------------------- |
| category | string | N    | 問題分類 (booking, payment, flight, general) |

#### 響應格式與狀態碼

**成功響應 (200 OK)**

```json
{
  "data": {
    "categories": [
      {
        "categoryId": "booking",
        "categoryName": "訂票相關",
        "faqs": [
          {
            "faqId": "FAQ001",
            "question": "如何修改訂單？",
            "answer": "您可以在會員中心的「我的訂單」中找到要修改的訂單，點擊「修改訂單」即可進行修改。請注意修改可能產生額外費用。",
            "tags": ["修改", "訂單", "費用"]
          }
        ]
      }
    ]
  }
}
```

---

### 4.2 提交客服問題

#### API 描述與用途

用戶提交客服問題或意見反映。

#### HTTP 方法與路徑

```
POST /api/support/tickets
```

#### 權限要求

- 建議用戶認證（可匿名提交）

#### 請求參數

```json
{
  "category": "booking",
  "subject": "訂單修改問題",
  "description": "我想要修改我的航班日期，但系統顯示無法修改",
  "priority": "medium",
  "contactInfo": {
    "name": "王小明",
    "email": "wang.xiaoming@example.com",
    "phoneNumber": "0912345678"
  },
  "relatedBookingId": "BK2025071700001"
}
```

#### 響應格式與狀態碼

**成功響應 (201 Created)**

```json
{
  "data": {
    "ticketId": "TICKET2025071700001",
    "status": "open",
    "category": "booking",
    "subject": "訂單修改問題",
    "estimatedResponseTime": "24 小時內",
    "createdAt": "2025-07-17T17:00:00Z"
  },
  "message": "問題提交成功，客服人員將在24小時內回覆您"
}
```

---

## 5. 支付相關 API

### 5.1 處理付款

#### API 描述與用途

處理訂單付款，支援多種付款方式。

#### HTTP 方法與路徑

```
POST /api/payments/process
```

#### 權限要求

- 需要用戶認證
- 需要有效的訂單

#### 請求參數

```json
{
  "bookingId": "BK2025071700001",
  "paymentMethod": "credit_card",
  "amount": 15000,
  "currency": "TWD",
  "paymentDetails": {
    "cardNumber": "4111111111111111",
    "expiryDate": "12/26",
    "cvv": "123",
    "cardholderName": "WANG XIAO MING"
  }
}
```

#### 響應格式與狀態碼

**成功響應 (200 OK)**

```json
{
  "data": {
    "transactionId": "TXN123456789",
    "status": "success",
    "amount": 15000,
    "currency": "TWD",
    "paymentMethod": "credit_card",
    "processedAt": "2025-07-17T10:00:00Z",
    "receipt": {
      "receiptId": "RCP123456789",
      "downloadUrl": "https://api.kiwibird.com/receipts/RCP123456789.pdf"
    }
  },
  "message": "付款成功"
}
```

---

## 4. 訂單管理相關 API

### 4.1 查詢用戶訂單列表

#### API 描述與用途

查詢登入用戶的所有訂單記錄，支援分頁和狀態篩選。

#### HTTP 方法與路徑

```
GET /api/bookings/user/{userId}
```

#### 權限要求

- 需要 JWT 認證
- 只能查詢自己的訂單

#### 請求參數

| 參數名稱 | 類型   | 位置  | 必填 | 說明                                        |
| -------- | ------ | ----- | ---- | ------------------------------------------- |
| userId   | string | path  | Y    | 用戶 ID                                     |
| page     | number | query | N    | 頁碼，預設為 1                              |
| limit    | number | query | N    | 每頁筆數，預設為 10，最大 50                |
| status   | string | query | N    | 訂單狀態篩選：pending, confirmed, cancelled |

#### 響應格式與狀態碼

**成功響應 (200 OK)**

```json
{
  "data": {
    "bookings": [
      {
        "bookingId": "BK202507170001",
        "flightNumber": "KW001",
        "route": "TPE → NRT",
        "departureDate": "2025-12-01",
        "status": "confirmed",
        "totalAmount": 18000,
        "currency": "TWD",
        "passengerCount": 2,
        "createdAt": "2025-07-17T10:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 10
    }
  },
  "message": "查詢成功"
}
```

#### 錯誤處理

| 錯誤碼 | HTTP 狀態 | 說明           |
| ------ | --------- | -------------- |
| 40401  | 404       | 用戶不存在     |
| 40101  | 401       | 未授權訪問     |
| 40301  | 403       | 無權限查看訂單 |

#### 業務邏輯說明

1. 驗證用戶身份和權限
2. 根據狀態篩選訂單
3. 按建立時間降序排序
4. 分頁返回結果
5. 記錄查詢日誌

---

### 4.2 查詢特定訂單詳情

#### API 描述與用途

查詢特定訂單的詳細資訊，包含乘客資訊和付款記錄。

#### HTTP 方法與路徑

```
GET /api/bookings/{bookingId}
```

#### 權限要求

- 需要 JWT 認證
- 只能查詢自己的訂單

#### 請求參數

| 參數名稱  | 類型   | 位置 | 必填 | 說明    |
| --------- | ------ | ---- | ---- | ------- |
| bookingId | string | path | Y    | 訂單 ID |

#### 響應格式與狀態碼

**成功響應 (200 OK)**

```json
{
  "data": {
    "bookingId": "BK202507170001",
    "status": "confirmed",
    "flight": {
      "flightNumber": "KW001",
      "departure": {
        "airportCode": "TPE",
        "airportName": "桃園國際機場",
        "dateTime": "2025-12-01T08:00:00Z"
      },
      "arrival": {
        "airportCode": "NRT",
        "airportName": "成田國際機場",
        "dateTime": "2025-12-01T12:30:00Z"
      }
    },
    "passengers": [
      {
        "passengerId": "P001",
        "firstName": "小明",
        "lastName": "王",
        "passportNumber": "123456789",
        "seatNumber": "12A"
      }
    ],
    "payment": {
      "totalAmount": 18000,
      "currency": "TWD",
      "paymentMethod": "credit_card",
      "paymentStatus": "completed"
    },
    "createdAt": "2025-07-17T10:00:00Z",
    "modificationPolicy": {
      "canModify": true,
      "canCancel": true,
      "modificationDeadline": "2025-11-29T08:00:00Z"
    }
  },
  "message": "查詢成功"
}
```

#### 業務邏輯說明

1. 驗證用戶權限
2. 查詢訂單完整資訊
3. 檢查修改和取消政策
4. 返回詳細資訊

---

### 4.3 修改訂單

#### API 描述與用途

修改現有訂單的日期或乘客資訊。

#### HTTP 方法與路徑

```
PUT /api/bookings/{bookingId}
```

#### 權限要求

- 需要 JWT 認證
- 只能修改自己的訂單

#### 請求參數

| 參數名稱         | 類型   | 位置 | 必填 | 說明                        |
| ---------------- | ------ | ---- | ---- | --------------------------- |
| bookingId        | string | path | Y    | 訂單 ID                     |
| modificationType | string | body | Y    | 修改類型：date, passenger   |
| newFlightId      | string | body | N    | 新航班 ID（修改日期時需要） |
| passengers       | array  | body | N    | 乘客資訊（修改乘客時需要）  |

#### 響應格式與狀態碼

**成功響應 (200 OK)**

```json
{
  "data": {
    "bookingId": "BK202507170001",
    "status": "confirmed",
    "modificationType": "date",
    "additionalAmount": 2000,
    "newTotalAmount": 20000,
    "currency": "TWD",
    "modifiedAt": "2025-07-17T11:00:00Z"
  },
  "message": "訂單修改成功"
}
```

#### 錯誤處理

| 錯誤碼 | HTTP 狀態 | 說明           |
| ------ | --------- | -------------- |
| 40401  | 404       | 訂單不存在     |
| 40901  | 409       | 訂單無法修改   |
| 40902  | 409       | 航班已起飛     |
| 40903  | 409       | 新航班座位不足 |

#### 業務邏輯說明

1. 檢查訂單狀態和修改政策
2. 驗證修改內容
3. 計算額外費用
4. 處理付款差額
5. 更新訂單資訊
6. 重新分配座位（如需要）

---

### 4.4 取消訂單

#### API 描述與用途

取消現有訂單並處理退款。

#### HTTP 方法與路徑

```
DELETE /api/bookings/{bookingId}
```

#### 權限要求

- 需要 JWT 認證
- 只能取消自己的訂單

#### 請求參數

| 參數名稱  | 類型   | 位置 | 必填 | 說明    |
| --------- | ------ | ---- | ---- | ------- |
| bookingId | string | path | Y    | 訂單 ID |

#### 響應格式與狀態碼

**成功響應 (200 OK)**

```json
{
  "data": {
    "bookingId": "BK202507170001",
    "status": "cancelled",
    "refund": {
      "refundAmount": 15500,
      "cancellationFee": 2500,
      "currency": "TWD",
      "refundMethod": "credit_card",
      "estimatedRefundDate": "2025-07-24T10:00:00Z"
    },
    "cancelledAt": "2025-07-17T11:00:00Z"
  },
  "message": "訂單取消成功，退款處理中"
}
```

#### 錯誤處理

| 錯誤碼 | HTTP 狀態 | 說明         |
| ------ | --------- | ------------ |
| 40401  | 404       | 訂單不存在   |
| 40901  | 409       | 訂單無法取消 |
| 40902  | 409       | 航班已起飛   |
| 40903  | 409       | 超過取消期限 |

#### 業務邏輯說明

1. 檢查訂單狀態和取消政策
2. 計算退款金額和手續費
3. 更新訂單狀態
4. 釋放航班座位
5. 處理退款作業

---

## 5. 客服支援相關 API

### 5.1 查詢常見問題

#### API 描述與用途

查詢常見問題列表，支援分類篩選。

#### HTTP 方法與路徑

```
GET /api/support/faq
```

#### 權限要求

- 無需認證

#### 請求參數

| 參數名稱 | 類型   | 位置  | 必填 | 說明                                     |
| -------- | ------ | ----- | ---- | ---------------------------------------- |
| category | string | query | N    | 分類篩選：booking, payment, cancellation |

#### 響應格式與狀態碼

**成功響應 (200 OK)**

```json
{
  "data": {
    "faqItems": [
      {
        "id": "FAQ001",
        "category": "booking",
        "question": "如何修改訂單？",
        "answer": "您可以在訂單詳情頁面點擊修改按鈕，選擇要修改的項目。",
        "order": 1
      },
      {
        "id": "FAQ002",
        "category": "payment",
        "question": "支援哪些付款方式？",
        "answer": "我們支援信用卡、ATM轉帳和銀行轉帳。",
        "order": 2
      }
    ],
    "categories": [
      {
        "code": "booking",
        "name": "訂票相關",
        "count": 15
      },
      {
        "code": "payment",
        "name": "付款相關",
        "count": 8
      }
    ]
  },
  "message": "查詢成功"
}
```

#### 業務邏輯說明

1. 根據分類篩選 FAQ
2. 按優先級順序排列
3. 統計各分類問題數量

---

### 5.2 建立客服工單

#### API 描述與用途

建立新的客服工單，記錄用戶問題。

#### HTTP 方法與路徑

```
POST /api/support/tickets
```

#### 權限要求

- 建議登入（可追蹤處理進度）
- 訪客也可建立

#### 請求參數

| 參數名稱    | 類型   | 必填 | 說明                                         |
| ----------- | ------ | ---- | -------------------------------------------- |
| category    | string | Y    | 問題分類：booking, payment, technical, other |
| subject     | string | Y    | 問題主旨                                     |
| description | string | Y    | 問題詳細描述                                 |
| contactInfo | object | Y    | 聯絡資訊                                     |
| bookingId   | string | N    | 相關訂單 ID                                  |
| priority    | string | N    | 優先級：low, medium, high, urgent            |

#### 響應格式與狀態碼

**成功響應 (201 Created)**

```json
{
  "data": {
    "ticketId": "TK202507170001",
    "status": "open",
    "category": "booking",
    "subject": "訂單修改問題",
    "priority": "medium",
    "assignedTo": "客服團隊",
    "createdAt": "2025-07-17T10:00:00Z",
    "estimatedResponseTime": "24小時內"
  },
  "message": "工單建立成功，客服人員將盡快處理"
}
```

#### 業務邏輯說明

1. 驗證聯絡資訊
2. 自動分配工單編號
3. 根據分類分配給客服人員
4. 設定優先級和預估處理時間
5. 發送工單建立確認郵件

---

## 6. 系統管理相關 API

### 6.1 系統健康檢查

#### API 描述與用途

檢查系統各個組件的運行狀態。

#### HTTP 方法與路徑

```
GET /api/system/health
```

#### 權限要求

- 需要管理員權限

#### 響應格式與狀態碼

**成功響應 (200 OK)**

```json
{
  "data": {
    "status": "healthy",
    "timestamp": "2025-07-17T10:00:00Z",
    "components": {
      "database": {
        "status": "up",
        "responseTime": "5ms"
      },
      "cache": {
        "status": "up",
        "responseTime": "2ms"
      },
      "external_apis": {
        "payment_gateway": {
          "status": "up",
          "responseTime": "120ms"
        },
        "flight_data": {
          "status": "up",
          "responseTime": "200ms"
        }
      }
    }
  }
}
```

---

### 6.2 記錄錯誤日誌

#### API 描述與用途

記錄系統錯誤日誌，支援錯誤追蹤和分析。

#### HTTP 方法與路徑

```
POST /api/logs/error
```

#### 權限要求

- 系統內部 API，需要內部服務認證

#### 請求參數

| 參數名稱   | 類型   | 必填 | 說明                           |
| ---------- | ------ | ---- | ------------------------------ |
| level      | string | Y    | 日誌級別：ERROR, WARNING, INFO |
| category   | string | Y    | 錯誤分類                       |
| message    | string | Y    | 錯誤訊息                       |
| userId     | string | N    | 相關用戶 ID                    |
| bookingId  | string | N    | 相關訂單 ID                    |
| stackTrace | string | N    | 錯誤堆疊追蹤                   |
| metadata   | object | N    | 額外元數據                     |

#### 響應格式與狀態碼

**成功響應 (201 Created)**

```json
{
  "data": {
    "logId": "LOG202507170001",
    "timestamp": "2025-07-17T10:00:00Z",
    "status": "logged"
  },
  "message": "錯誤日誌記錄成功"
}
```

---

### 6.3 航班資料同步

#### API 描述與用途

手動觸發航班資料同步，或查詢同步狀態。

#### HTTP 方法與路徑

```
POST /api/admin/flights/sync
GET /api/admin/sync/status
```

#### 權限要求

- 需要管理員權限

#### 請求參數（POST）

| 參數名稱   | 類型    | 必填 | 說明                     |
| ---------- | ------- | ---- | ------------------------ |
| forceSync  | boolean | N    | 是否強制同步，預設 false |
| dataSource | string  | N    | 指定資料來源             |

#### 響應格式與狀態碼

**同步觸發成功響應 (202 Accepted)**

```json
{
  "data": {
    "syncId": "SYNC202507170001",
    "status": "started",
    "estimatedDuration": "5-10分鐘"
  },
  "message": "航班資料同步已開始"
}
```

**同步狀態查詢響應 (200 OK)**

```json
{
  "data": {
    "syncId": "SYNC202507170001",
    "status": "completed",
    "progress": 100,
    "statistics": {
      "totalFlights": 150,
      "updatedFlights": 23,
      "affectedBookings": 5,
      "notificationsSent": 12
    },
    "startedAt": "2025-07-17T10:00:00Z",
    "completedAt": "2025-07-17T10:08:00Z"
  },
  "message": "同步完成"
}
```

#### 業務邏輯說明

1. 驗證管理員權限
2. 檢查是否有正在進行的同步
3. 從外部資料源獲取最新航班資料
4. 驗證資料格式和完整性
5. 比對現有資料找出差異
6. 更新航班資料
7. 檢查受影響的訂單
8. 發送變更通知給相關用戶
9. 記錄同步日誌

---

✏️ _最後更新時間：2025-07-17_
