const ws = require('ws');

const wss = new ws.Server({ noServer: true });
export default wss;
