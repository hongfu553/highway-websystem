#include "WiFiS3.h"          // ESP32-S3 WiFi 庫
#include "WiFiSSLClient.h"   // SSL 客戶端庫
#include <PubSubClient.h>    // MQTT 客戶端庫

// WiFi 設定
const char* ssid = "JICTS-FGAP";             // WiFi 名稱
const char* password = "26430686";           // WiFi 密碼

// MQTT 設定
const char* mqtt_server = "pc756323.ala.asia-southeast1.emqxsl.com"; // MQTT 伺服器
const int mqtt_port = 8883;                  // 使用 SSL 的 MQTT 埠
const char* mqtt_user = "hongfu553";         // MQTT 使用者名稱
const char* mqtt_password = "F132369445";    // MQTT 密碼
const char* mqtt_topic = "test/topic";       // 自訂的 MQTT 主題

// WiFi 和 MQTT 客戶端
WiFiSSLClient sslClient;                     // SSL 客戶端
PubSubClient mqttClient(sslClient);

// WiFi 連線函數
void setupWiFi() {
  Serial.print("Connecting to WiFi...");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected.");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

// MQTT 連線函數
void reconnectMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("Connecting to MQTT...");
    if (mqttClient.connect("ESP32S3_Client", mqtt_user, mqtt_password)) {
      Serial.println("connected.");
      mqttClient.subscribe(mqtt_topic); // 訂閱主題
      Serial.print("Subscribed to topic: ");
      Serial.println(mqtt_topic);
    } else {
      Serial.print("failed, rc=");
      Serial.println(mqttClient.state());
      Serial.println("Retrying in 2 seconds...");
      delay(2000);
    }
  }
}

// MQTT 訊息回呼函數
void messageReceived(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("]: ");

  // 將 payload 轉換為字串並顯示
  for (unsigned int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
}

// 設定
void setup() {
  Serial.begin(9600); // 設定序列埠波特率為 9600
  Serial.println("Starting...");

  // 連接 WiFi
  setupWiFi();

  // 設置 MQTT 伺服器和回呼函數
  mqttClient.setServer(mqtt_server, mqtt_port);
  mqttClient.setCallback(messageReceived);
}

// 主循環
void loop() {
  // 確認 MQTT 已連線
  if (!mqttClient.connected()) {
    reconnectMQTT();
  }
  // 處理 MQTT 訊息
  mqttClient.loop();
}
