const express = require('express');
const path = require('path');
const session = require('express-session');
const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');
const mqtt = require('mqtt');
const axios = require('axios');
const qs = require('qs'); // 用來處理 URL 編碼的請求體

// MQTT 設定
const options = {
    host: 'pc756323.ala.asia-southeast1.emqxsl.com',
    port: 8883, // TLS 使用的默認端口
    protocol: 'mqtts', // 使用加密的 MQTT 協議
    username: 'hongfu553', // 替換為你的 HiveMQ Cloud 帳戶使用者名稱
    password: 'F132369445', // 替換為你的 HiveMQ Cloud 帳戶密碼
};

const mqttClient = mqtt.connect(options);
mqttClient.on('connect', () => console.log('Connected to MQTT broker'));
mqttClient.on('error', (err) => console.error('MQTT connection error:', err));

// 伺服器設定
const app = express();
const port = 3000;

// Session 中間件設定
app.use(
    session({
        secret: 'fuckyourmother', // 替換為更安全的密鑰
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 60 * 60 * 1000 }, // 1 小時
    })
);

// 解析請求 body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 資料庫連線
const db = new sqlite3.Database('highway.db', (err) => {
    if (err) {
        console.error('Database error:', err);
    } else {
        console.log('Database connected');
    }
});

// 驗證登入狀態中間件
function authMiddleware(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.status(401).send(`
        <html lang="zh-TW">
        <head>
            <meta charset="UTF-8">
            <title>未登入</title>
            <script>
                alert('請先登入，將跳轉至登入頁面');
                window.location.href = '/';
            </script>
        </head>
        <body></body>
        </html>
    `);
}

// OIDC 身份驗證資訊
const clientId = 'jack306-03f62b49-6317-490c';
const clientSecret = '91529fc7-3196-4199-8ef5-d6419df76c47';
const tokenUrl = 'https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token';

// 獲取 access token 的函式
async function getAccessToken() {
    const data = qs.stringify({
        'grant_type': 'client_credentials',
        'client_id': clientId,
        'client_secret': clientSecret,
    });

    try {
        const response = await axios.post(tokenUrl, data, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Error fetching access token:', error);
        throw error;
    }
}

// 登入路由
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = `SELECT * FROM users WHERE username = ?`;
    db.get(query, [username], (err, row) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).send('伺服器內部錯誤');
        }

        if (row) {
            bcrypt.compare(password, row.password, (err, result) => {
                if (err) {
                    console.error('Password comparison error:', err);
                    return res.status(500).send('伺服器內部錯誤');
                }

                if (result) {
                    req.session.user = username;
                    return res.redirect('/main');
                }

                res.send(`
                    <html lang="zh-TW">
                    <head>
                        <meta charset="UTF-8">
                        <title>帳密錯誤</title>
                        <script>
                            alert('帳號密碼錯誤，請重新登入');
                            window.location.href = '/';
                        </script>
                    </head>
                    </html>
                `);
            });
        } else {
            res.send(`
                <html lang="zh-TW">
                <head>
                    <meta charset="UTF-8">
                    <title>帳號不存在</title>
                    <script>
                        alert('帳號不存在，請註冊');
                        window.location.href = '/reg';
                    </script>
                </head>
                </html>
            `);
        }
    });
});

// 即時交通資訊路由
app.get('/traffic', authMiddleware, async (req, res) => {
    const freewayName = req.query.freeway || '';
    const sectionID = req.query.sectionID || '';

    try {
        // 先獲取 access token
        const accessToken = await getAccessToken();

        // 使用獲得的 access token 調用 TDX API
        const response = await axios.get(
            `https://traffic.transportdata.tw/MOTC/v2/Road/Traffic/Live/Freeway/${sectionID}?$top=30&$format=JSON`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`, // 用 Bearer token 進行授權
                },
            }
        );

        const trafficData = response.data.LiveTraffics[0];
        const travelSpeed = trafficData?.TravelSpeed || '無法獲取';
        const travelTime = trafficData?.TravelTime || '無法獲取';

        res.json({ travelSpeed, travelTime });
    } catch (error) {
        console.error('交通資訊請求錯誤:', error);
        res.json({ travelSpeed: '查詢失敗', travelTime: '查詢失敗' });
    }
});


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 路由
app.get('/', (req, res) => res.render('login'));
app.get('/reg', (req, res) => res.render('register'));
app.get('/main', authMiddleware, (req, res) => res.render('index', { user: req.session.user }));
app.get('/about', authMiddleware, (req, res) => res.render('about', { user: req.session.user }));
app.get('/control', authMiddleware, (req, res) => res.render('control', { user: req.session.user }));
app.get('/project', authMiddleware, (req, res) => res.render('project', { user: req.session.user }));
app.get('/admin', authMiddleware, (req, res) => res.send('頁面製作中...'));

// 啟動伺服器
app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
