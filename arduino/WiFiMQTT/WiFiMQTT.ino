#include <WiFiS3.h>           // 用來連接 Wi-Fi 的函式庫
#include <PubSubClient.h>      // 用來進行 MQTT 通訊的函式庫
#include <WiFiClientSecure.h>  // 用來進行 MQTTs 連線的函式庫

// Wi-Fi 網路設定
const char* ssid = "JICTS-FGAP";
const char* password = "26430686"; // 替換成你的 Wi-Fi 密碼

// MQTT 伺服器設定
const char* mqtt_server = "051577656e824d67b836ad22b1c8fe9e.s1.eu.hivemq.cloud";
const int mqtt_port = 8883; 
const char* mqtt_topic = "test/topic";
const char* mqtt_username = "hongfu553";
const char* mqtt_password = "Freddy510";

// Wi-Fi 和 MQTT 客戶端物件
WiFiClientSecure espClient; // 使用 Wi-Fi 客戶端並支援 SSL/TLS
PubSubClient client(espClient); // MQTT 客戶端

void setup() {
  // 啟動序列埠並設置波特率
  Serial.begin(115200);
  
  // 連接 Wi-Fi
  Serial.println("連接到 Wi-Fi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("正在連接 Wi-Fi...");
  }

  // Wi-Fi 連接成功，顯示 IP 地址
  Serial.println("Wi-Fi 連接成功!");
  Serial.print("IP 地址: ");
  Serial.println(WiFi.localIP());

  // 設置 MQTT 伺服器參數
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(mqttCallback);

  // 設置 SSL/TLS 憑證（如果需要）
  espClient.setInsecure();  // 跳過憑證檢查，若需要具體憑證，使用 setTrustAnchors()
}

void loop() {
  // 只有在 Wi-Fi 連接成功後才開始 MQTT 連接
  if (!client.connected()) {
    reconnectMQTT();
  }
  client.loop(); // 持續監控 MQTT 訊息
}

void reconnectMQTT() {
  // 嘗試連接到 MQTT 伺服器
  while (!client.connected()) {
    Serial.println("嘗試連接 MQTT...");
    if (client.connect("ArduinoClient", mqtt_username, mqtt_password)) {
      Serial.println("MQTT 連接成功!");
      // 連接後訂閱主題（可選）
      client.subscribe(mqtt_topic);
    } else {
      Serial.print("MQTT 連接失敗，狀態碼: ");
      Serial.println(client.state());
      delay(5000);  // 每 5 秒重試一次
    }
  }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.print("收到消息 [");
  Serial.print(topic);
  Serial.print("] ");
  for (unsigned int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
}

// 發佈一條 MQTT 消息
void publishMessage(const char* message) {
  if (client.publish(mqtt_topic, message)) {
    Serial.println("消息已發佈");
  } else {
    Serial.println("消息發佈失敗");
  }
}
