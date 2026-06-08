const mqtt = require('mqtt');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const options = {
  host: process.env.MQTT_HOST,
  port: 8883,
  protocol: 'mqtts',
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
};

const client = mqtt.connect(options);

client.on('connect', () => {
  console.log('Connected to MQTT broker!');

  const topic = 'test/topic';
  const message = '打開電子學課本第幾頁';
  client.publish(topic, message, (err) => {
    if (err) {
      console.error('Failed to publish message:', err);
    } else {
      console.log(`Message sent to ${topic}: ${message}`);
      client.end();
    }
  });
});

client.on('error', (err) => {
  console.error('Connection error:', err);
});