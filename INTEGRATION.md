# 📢 CoachAIgent Notifier 串接說明文件

本服務提供統一的 API 入口，用於將系統事件轉發至 Discord 指定頻道。

## 🌐 基礎資訊
- **正式環境 URL**: `https://notifier.ch-focke.workers.dev`
- **內容類型**: `application/json`
- **認證方式**: Header `X-Api-Key`

---

## 🔒 認證檢查 (Health Check)
在進行正式發送前，可以先透過 GET 請求驗證金鑰是否正確。

- **Endpoint**: `GET /v1/health`
- **Headers**:
    - `X-Api-Key`: `YOUR_API_KEY`
- **Response**: `200 OK` (成功的認證回傳)

---

## 🚀 發送通知 (Notify)
- **Endpoint**: `POST /v1/notify`
- **Payload 結構**:

| 欄位 | 類型 | 必填 | 說明 |
| :--- | :--- | :--- | :--- |
| `source` | string | ✅ | 來源識別：`coach-aigent-crm` 或 `devsecops` |
| `type` | string | ✅ | 通知等級：`success`, `info`, `warning`, `error` |
| `event` | string | ✅ | 事件摘要 (Discord 標題) |
| `message` | string | ✅ | 事件詳解 (Discord 內文) |
| `metadata` | object | ❌ | 關鍵數據 (以表格型態顯示，Key-Value 對照) |

### 示例請求 (CRM 預約通知)
```bash
curl -X POST https://notifier.ch-focke.workers.dev/v1/notify \
  -H "X-Api-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "coach-aigent-crm",
    "type": "success",
    "event": "CRM_BOOKING",
    "message": "有一筆新的試教預約請求",
    "metadata": {
      "客戶姓名": "陳曉明",
      "預約門市": "台北延吉",
      "預約時段": "2026-04-15 14:00",
      "教練帳號": "Peter_Coach"
    }
  }'
```

---

## 🎨 樣式與路徑說明
- **CRM 路由**: 當 `source` 為 `coach-aigent-crm` 時，訊息將自動發送至 **CoachAIgent CRM Discord Webhook**。
- **DevSecOps 路由**: 當 `source` 為 `devsecops` 時，訊息將自動發送至 **DevSecOps Discord Webhook**。
- **顏色指示**:
    - `success`: 🟩 綠色
    - `info`: 🟦 藍色
    - `warning`: 🟨 黃色
    - `error`: 🟥 紅色

---

## ⚠️ 錯誤碼說明
- `401 Unauthorized`: `X-Api-Key` 缺失或不匹配。
- `500 Internal Server Error`: 系統配置錯誤或 Webhook 轉發失敗。
