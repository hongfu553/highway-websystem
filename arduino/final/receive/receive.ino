#include "WiFiS3.h"          // ESP32-S3 WiFi 庫
#include "WiFiSSLClient.h"   // SSL 客戶端庫
#include <PubSubClient.h>    // MQTT 客戶端庫
#include "secrets.h"          // WiFi 和 MQTT 設定

// WiFi 設定 (從 secrets.h 載入)
const char* ssid = SECRET_WIFI_SSID;
const char* password = SECRET_WIFI_PASSWORD;

// MQTT 設定 (從 secrets.h 載入)
const char* mqtt_server = SECRET_MQTT_SERVER;
const int mqtt_port = SECRET_MQTT_PORT;
const char* mqtt_user = SECRET_MQTT_USER;
const char* mqtt_password = SECRET_MQTT_PASSWORD;
const char* mqtt_topic = "test/topic";

// WiFi 和 MQTT 客戶端
WiFiSSLClient sslClient;
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
      mqttClient.subscribe(mqtt_topic);
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

  for (unsigned int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
}

void setup() {
  Serial.begin(9600);
  Serial.println("Starting...");

  setupWiFi();

  mqttClient.setServer(mqtt_server, mqtt_port);
  mqttClient.setCallback(messageReceived);
}

void loop() {
  if (!mqttClient.connected()) {
    reconnectMQTT();
  }
  mqttClient.loop();
}