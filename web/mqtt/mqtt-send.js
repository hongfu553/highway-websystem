const mqtt = require('mqtt');

// 配置連接選項
const options = {
  host: '051577656e824d67b836ad22b1c8fe9e.s1.eu.hivemq.cloud',
  port: 1883, // TLS 使用的默認端口
  protocol: 'mqtts', // 使用加密的 MQTT 協議
  username: 'hongfu553', // 替換為你的 HiveMQ Cloud 帳戶使用者名稱
  password: 'Freddy510', // 替換為你的 HiveMQ Cloud 帳戶密碼
};

// 創建 MQTT 客戶端
const client = mqtt.connect(options);

// 當連接成功時觸發
client.on('connect', () => {
  console.log('Connected to MQTT broker!');

  // 發布訊息到主題
  const topic = 'test/topic';
  const message = 'Hello from sender!';
  client.publish(topic, message, (err) => {
    if (err) {
      console.error('Failed to publish message:', err);
    } else {
      console.log(`Message sent to ${topic}: ${message}`);
      client.end(); // 發送完成後斷開連接（可選）
    }
  });
});

// 錯誤處理
client.on('error', (err) => {
  console.error('Connection error:', err);
});
