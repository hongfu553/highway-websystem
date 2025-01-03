#include "WiFiS3.h"          // ESP32-S3 WiFi 庫
#include "WiFiSSLClient.h"   // SSL 客戶端庫
#include <PubSubClient.h>    // MQTT 客戶端庫
#include <Servo.h> 

// WiFi 設定
const char* ssid = "JICTS-FGAP";             // 輸入你的 WiFi 名稱
const char* password = "26430686"; // 輸入你的 WiFi 密碼

// MQTT 設定
const char* mqtt_server = "pc756323.ala.asia-southeast1.emqxsl.com"; // MQTT 伺服器
const int mqtt_port = 8883;  // 使用 SSL 的 MQTT 埠
const char* mqtt_user = "hongfu553";  // 如果不需要證證，留空
const char* mqtt_password = "F132369445"; 
const char* mqtt_topic = "test/topic"; // 自訂的 MQTT 主題


Servo myservo11,myservo12,myservo13,myservo14;  // 建立SERVO物件
// WiFi 和 MQTT 客戶端
WiFiSSLClient sslClient; // SSL 客戶端
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

// 訊息接收回呼函數
void messageReceived(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("]: ");
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
  myservo11.attach(2);
  myservo12.attach(3);
  myservo13.attach(4);
  myservo14.attach(5);
  // 設置 MQTT 伺服器和回呼函數
  mqttClient.setServer(mqtt_server, mqtt_port);
  mqttClient.setCallback(messageReceived);
}

void messageReceived(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("]: ");
  
  // 將 payload 轉換為字串
  String message;
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.println(message);

  // 根據 topic 和 message 執行特定動作
  if (String(topic) == "tofu/road") {
    if (message == "north") {
      Serial.println("Run command")
      myservo11.write(90);
      myservo12.write(90);
      myservo13.write(90); // 開啟內建 LED
    } else if (message == "middle") {
      Serial.println("Run middle command")
      myservo12.write(90);
      myservo12.write(90);
      myservo12.write(90); // 關閉內建 LED
    } else if (message == "south") {
      Serial.println("Run south command")
      myservo13.write(90);
      myservo12.write(90);
      myservo12.write(90);
    } else if (message == "warning-north"){
      Serial.println("Run warning-north command")
      myservo14.write(90);
      myservo12.write(90);
      myservo12.write(90);
    } else if (message == "warning-south"){
      Serial.println("Run warning-south command")
      myservo12.write(90);
      myservo12.write(90);
      myservo12.write(90);
    }
  } else {
    Serial.println("Unknown command");
  }
}

// 主輪圈
void loop() {
  // 確認 MQTT 已連線
  if (!mqttClient.connected()) {
    reconnectMQTT();
  }
  mqttClient.loop();
}


