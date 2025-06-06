# highway-websystem

## 新北市立樟樹國際實創高級中等學校 資訊科 星耀光輝隊

## 介紹

**highway-websystem** 是一個基於 Nodejs Express 的網頁應用程式，使用Websocket跟esp32進行溝通，可以將此伺服器架設在任何地方例如：EC2、GCP、Linux...等，並記錄下所有資料，並且結合高速公路1968 API，與路況進行判斷

## 功能

* **使用者驗證：** 提供使用者登入和註冊功能，保障系統安全性。
* **MQTT 控制：** 允許使用者發佈訊息到指定的 MQTT 主題，並記錄所有發佈的訊息。
* **日誌管理：** 提供查看日誌的功能，以及清除所有日誌的功能。
* **MQTT 連線狀態顯示：** 顯示目前與 MQTT Broker 的連線狀態。
* **友善介面：** 提供直觀且易於使用的介面，讓使用者輕鬆操作。

## 技術

* **後端:** Express
* **資料庫:** sqlite3
* **Websocket:** Express-ws


## 安裝和使用

**1. 安裝**

* 讀取網頁目錄：`cd web`
* 安裝依賴：`npm install`
* 啟動Dev server：`node index.js`

**2. 設定**

* 建立一個 `.env` 檔案，並設定以下環境變數：
    * `SECRET_KEY`: 一個強大的秘密金鑰。
    * `SQLALCHEMY_DATABASE_URI`: 資料庫 URI (例如 `sqlite:///your_database.db`)。
    * `broker`: MQTT Broker 位址。
    * `port`: MQTT Broker 埠號。
    * `topic`: MQTT 主題。
    * `username`: MQTT 用戶名稱。
    * `password`: MQTT 密碼。

**3. 執行**

* 輸入`npm start`即可啟動 Webserver

**4. 存取**

* 在您的網頁瀏覽器中開啟提供的 URL (例如 `http://localhost:3000/`)。

**5. 登入**

* 導向`/reg`路由註冊新身份
* 使用您的帳戶登入。

**6. 控制**

* 點選`方向控制`頁面與esp32進行溝通。

**7. 查看日誌**

* 查看已發佈的訊息日誌。

## 測試

* 控制功能可以正常運作，可以搭配 [websocket test] 進行測試。

## 開發

* 此專案是由 **[hongfu553](https://github.com/hongfu553)** 開發。
* 專案已完成大部分功能，未來將根據需求持續添加新功能。

## 部署

* 您可以使用 Docker 部署此應用程式。
* 可以透過 Nginx 部署網站

## 貢獻

歡迎您的貢獻！請隨時提交問題或拉取請求。

## 聯繫
* 開發日誌：[HackMD](https://hackmd.io/@hongfu553/highway-websystem)
* 開發者：[@hongfu553](https://github.com/hongfu553)

## 其他

* 程式碼註解提供了更多詳細資訊。
* 歡迎提交問題或拉取請求。
