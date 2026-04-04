# 📋 Cloudflare Worker Notifier 需求規格書 (v1.0)

## 1. 專案概述
本專案旨在建立一個通用的通知中繼站 (**Notification Gateway**)。透過 Cloudflare Workers 接收來自不同來源的 HTTP 請求，並根據來源將訊息路由至指定的 Discord 頻道或第三方通訊軟體。

## 2. 技術棧 (Tech Stack)
- **Runtime**: Cloudflare Workers
- **Framework**: Hono (輕量級 Web 框架)
- **Language**: TypeScript
- **Secret Management**: Infisical Cloud
- **Design Pattern**: Command Pattern (命令模式) & Factory Pattern (工廠模式)

## 3. 介面定義 (API Specification)

### 3.1 基礎資訊
- **Endpoint**: `POST /v1/notify`
- **Authentication**: 需於 Header 帶入 `X-Api-Key`

### 3.2 請求酬載 (Request Payload)
```json
{
  "source": "coach-aigent-crm | devsecops",
  "type": "success | info | warning | error | critical",
  "event": "string",
  "message": "string",
  "metadata": {
    "key": "value" 
  }
}
```

## 4. 系統架構與設計模式

### 4.1 命令模式 (Command Pattern) 結構
系統需實作以下類別結構以利擴充：
- **NotificationCommand (Interface)**: 定義 `execute(): Promise<void>`。
- **DiscordCommand (Concrete Class)**: 封裝 Discord Webhook 的發送邏輯與美化 (Embeds)。
- **NotificationFactory**: 根據 `source` 判斷應建立哪一個 Command 實例並決定 Webhook 目標。

### 4.2 路由規則 (Routing Table)

| 來源 (Source) | 目標頻道 (Target) | 環境變數 Key |
| :--- | :--- | :--- |
| `coach-aigent-crm` | CoachAIgent CRM | `CHANNEL_DISCORD_COACHAIGENT_CRM_WEBHOOK` |
| `devsecops` | DevSecOps / Alerts | `CHANNEL_DISCORD_DEVSECOPS_WEBHOOK` |

## 5. 功能需求 (Functional Requirements)

### 5.1 安全驗證
- 必須比對 `X-Api-Key` 是否與 Worker 環境變數中的 `API_KEY` 一致。
- 若驗證失敗，回傳 `401 Unauthorized` 並附帶錯誤碼 `ERR_AUTH_FAILED`。

### 5.2 訊息美化 (Discord Embeds)
- **顏色代碼**:
  - `success`: `#2ecc71` (綠)
  - `error / critical`: `#e74c3c` (紅)
  - `warning`: `#f1c40f` (黃)
  - `info`: `#3498db` (藍)
- **Metadata 處理**: 將 `metadata` 物件轉換為 Discord Embed 的 `fields` 列表。

### 5.3 錯誤處理 (RepoErr 整合)
當外部 API (如 Discord) 回傳錯誤時，Worker 需捕捉異常並回傳結構化 JSON：
```json
{ 
  "success": false, 
  "code": "ERR_NOTIFY_EXEC_FAIL", 
  "message": "..." 
}
```

## 6. 非功能需求 (Non-Functional Requirements)
- **低延遲**: 邊緣運算處理時間應小於 50ms (不含外部 API 往返)。
- **可擴充性**: 新增通知管道 (如 LINE Notify) 僅需新增一個 Command 類別，不影響現有代碼。
- **環境變數同步**: 透過 Infisical 實作 dev 與 prod 環境的自動同步。

## 7. 環境變數清單 (Environment Variables)

| Key | 說明 | 來源 |
| :--- | :--- | :--- |
| `API_KEY` | 存取本 API 的憑證 | Infisical |
| `CHANNEL_DISCORD_COACHAIGENT_CRM_WEBHOOK` | Discord CoachAIgent CRM Webhook URL | Infisical |
| `CHANNEL_DISCORD_DEVSECOPS_WEBHOOK` | Discord DevSecOps Webhook URL | Infisical |