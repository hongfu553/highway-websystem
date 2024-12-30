const mqtt = require('mqtt');

// 配置參數
const options = {
  host: 'pc756323.ala.asia-southeast1.emqxsl.com',
  port: 8883, // TLS 使用的默認端口
  protocol: 'mqtts', // 使用加密的 MQTT 協議
  username: 'hongfu553',
  password: 'F132369445',
};

// 連接到 MQTT Broker
const client = mqtt.connect(options);

// 當連接成功時觸發
client.on('connect', () => {
  console.log('Connected to MQTT broker!');

  // 訂閱主題
  const topic = 'tofu/roud';
  client.subscribe(topic, (err) => {
    if (err) {
      console.error('Failed to subscribe:', err);
    } else {
      console.log(`Subscribed to topic: ${topic}`);
    }
  });
});

// 當接收到訊息時觸發
client.on('message', (topic, message) => {
  console.log(`Received message from ${topic}: ${message.toString()}`);
});

// 錯誤處理
client.on('error', (err) => {
  console.error('Connection error:', err);
});
