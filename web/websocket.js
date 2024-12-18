const WebSocket = require('ws');

class WebSocketServer {
    constructor(port = 8080) {
        this.port = port;
        this.wss = null;
    }

    // 啟動 WebSocket 伺服器
    start() {
        return new Promise((resolve, reject) => {
            try {
                this.wss = new WebSocket.Server({ port: this.port });
                console.log(`WebSocket server is running on ws://localhost:${this.port}`);

                this.wss.on('connection', (ws) => {
                    console.log('A new client connected!');

                    // 發送初始訊息給新連線的客戶端
                    ws.send(JSON.stringify({ type: 'welcome', message: 'Connected to WebSocket server' }));

                    // 接收到訊息時
                    ws.on('message', (message) => {
                        console.log(`Received message: ${message}`);

                        // 嘗試解析訊息
                        try {
                            const parsedMessage = JSON.parse(message);

                            // 根據訊息類型處理
                            if (parsedMessage.type === 'ping') {
                                ws.send(JSON.stringify({ type: 'pong', message: 'Pong from server' }));
                            } else {
                                ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
                            }
                        } catch (err) {
                            ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON format' }));
                        }
                    });

                    // 客戶端斷線時
                    ws.on('close', () => {
                        console.log('Client disconnected.');
                    });
                });

                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    // 廣播訊息給所有連線的客戶端
    broadcast(message) {
        if (!this.wss) {
            console.error('WebSocket server is not running.');
            return;
        }
        this.wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
        console.log('Broadcast message:', message);
    }
}

module.exports = WebSocketServer;