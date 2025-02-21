#include "WiFiS3.h"          // ESP32-S3 WiFi 庫
#include "WiFiSSLClient.h"   // SSL 客戶端庫
#include <PubSubClient.h>    // MQTT 客戶端庫
#include <Servo.h> //伺服馬達
Servo myservo_A[4];
Servo myservo_B[4];
Servo myservo_C[2];
int a;
int A_off[4]={95, 95, 95, 95};
int A_on[4]={78, 75, 80, 73}, B_on[4]={68, 45, 78, 64}, C_on[4]={135, 118, 117, 110};
int BC_O[4]={85,90,100,90};
int BC_off[2]={80,100},BC_on[2]={97,83};
float location_A[4]={90,90,90,90}, location_B[4]={90,90,90,90},location_C[2]={90,90}; // 使用浮點數來記錄位置
float speed = 1; // 控制速度，數值越小越慢，建議1~10之間

// WiFi 設定
const char* ssid = "CS_Class";   // 輸入你的 WiFi 名稱
const char* password = "26430686"; // WiFi 密碼

// MQTT 設定
const char* mqtt_server = "pc756323.ala.asia-southeast1.emqxsl.com"; // MQTT 伺服器
const int mqtt_port = 8883;                  // 使用 SSL 的 MQTT 埠
const char* mqtt_user = "hongfu553";         // MQTT 使用者名稱
const char* mqtt_password = "F132369445";    // MQTT 密碼
const char* mqtt_topic = "tofu/roud";       // 自訂的 MQTT 主題

// WiFi 和 MQTT 客戶端
WiFiSSLClient sslClient;                     // SSL 客戶端
PubSubClient mqttClient(sslClient);

// WiFi 連線函數
void setupWiFi() {
  Serial.print("連接WiFi...");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n無線網路已連接.");
  Serial.print("IP位址: ");
  Serial.println(WiFi.localIP());
}

// MQTT 連線函數
void reconnectMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("連接到MQTT...");
    if (mqttClient.connect("ESP32S3_Client", mqtt_user, mqtt_password)) {
      Serial.println("已連接.");
      mqttClient.subscribe(mqtt_topic); // 訂閱主題
      Serial.print("已訂閱主題: ");
      Serial.println(mqtt_topic);
    } else {
      Serial.print("失敗, rc=");
      Serial.println(mqttClient.state());
      Serial.println("2秒後重試...");
      delay(2000);
    }
  }
}

// MQTT 訊息回呼函數
void messageReceived(char* topic, byte* payload, unsigned int length) {
  Serial.print("訊息已送達[");
  Serial.print(topic);
  Serial.print("]: ");

  // 將 payload 轉換為字串並顯示
  String message;
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.println(message);
  if (String(topic) == "tofu/roud") {
    if (message == "north") { //如果北上塞車
      Serial.println("北上塞車");
      for(a=0;a<=3;a++){
      myservo_B[a].write(BC_O[a]);
      delay(1000);
      }
      for(a=0;a<=1;a++){
      myservo_C[a].write(BC_off[a]);
      delay(1000);
      }
      for(a=3;a>=0;a--){
      myservo_A[a].write(A_on[a]);
      delay(1000);
      }
      // 開啟內建 LED
    } else if (message == "middle") {  //回中
      Serial.println("回中");
      for(a=3;a>=0;a--){
      myservo_A[a].write(A_off[a]);
      delay(1000);
      }
      for(a=0;a<=1;a++){
      myservo_C[a].write(BC_on[a]);
      delay(1000);
      }
      for(a=0;a<=3;a++){
      myservo_B[a].write(BC_O[a]);
      delay(1000);
      }
      for(a=0;a<=3;a++){
      myservo_B[a].write(B_on[a]);
      delay(1000);
      }
    } else if (message == "south") {  //如果南下塞車
      Serial.println("南下塞車");
      for(a=3;a>=0;a--){
      myservo_A[a].write(A_off[a]);
      delay(1000);
      }
      for(a=0;a<=1;a++){
      myservo_C[a].write(BC_on[a]);
      delay(1000);
      }
      for(a=0;a<=3;a++){
      myservo_B[a].write(BC_O[a]);
      delay(1000);
      }
      for(a=0;a<=3;a++){
      myservo_B[a].write(C_on[a]);
      delay(1000);
      }
    } else if (message == "warning-north"){  //北上需要緊急車道
      Serial.println("Run warning-north command");
    } else if (message == "warning-south"){   //南下需要緊急車道
      Serial.println("Run warning-south command");
    }
  } else {
    Serial.println("Unknown command");
  }
}

// 設定
void setup() {
  Serial.begin(9600); // 設定序列埠波特率為 9600
  myservo_A[0].attach(2);
  myservo_A[1].attach(4);
  myservo_A[2].attach(5);
  myservo_A[3].attach(6);
  myservo_B[0].attach(7);
  myservo_B[1].attach(8);
  myservo_B[2].attach(9);
  myservo_B[3].attach(10);
  myservo_C[0].attach(11);
  myservo_C[1].attach(13);
  for(a=0;a<=3;a++){
    myservo_A[a].write(A_on[a]);
  }
  myservo_B[0].write(BC_O[0]);
  myservo_B[1].write(BC_O[1]);
  myservo_B[2].write(BC_O[2]);
  myservo_B[3].write(BC_O[3]);
  myservo_C[0].write(BC_on[0]);
  myservo_C[1].write(BC_on[1]);
  Serial.println("開始...");

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
