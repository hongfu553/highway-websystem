#include <Servo.h>   //載入函式庫，這是內建的，不用安裝

Servo myservo11,myservo12,myservo13,myservo14;  // 建立SERVO物件


void setup() {
  myservo11.attach(2);  // 設定要將伺服馬達接到哪一個PIN腳
  myservo12.attach(3);
  myservo13.attach(4);
  myservo14.attach(5);

  myservo11.write(90);
  myservo12.write(90);
  myservo13.write(90);
  myservo14.write(90);
}

void loop() {   
  myservo11.write(90);
  myservo12.write(90);
  myservo13.write(90);
  myservo14.write(90);
}