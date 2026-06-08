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

  const topic = 'tofu/roud';
  client.subscribe(topic, (err) => {
    if (err) {
      console.error('Failed to subscribe:', err);
    } else {
      console.log(`Subscribed to topic: ${topic}`);
    }
  });
});

client.on('message', (topic, message) => {
  console.log(`Received message from ${topic}: ${message.toString()}`);
});

client.on('error', (err) => {
  console.error('Connection error:', err);
});