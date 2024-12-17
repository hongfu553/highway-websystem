const ws = require('ws');
const wss = new ws.Server({ noServer: true });
const clients = [];

export class sendmsg {
    constructor() {
        this.clients = clients;
    }

    broadcast(data) {
        this.clients.forEach((client) => {
            if (client.readyState === ws.OPEN) {
                client.send(data);
            }
        });
    }
}