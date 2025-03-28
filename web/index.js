const express = require('express');
const path = require('path');
const session = require('express-session');
const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');
const mqtt = require('mqtt');
require('dotenv').config();

// MQTT 設定
const options = {
    host: process.env.MQTT_HOST,
    port: 8883, // TLS 使用的默認端口
    protocol: 'mqtts', // 使用加密的 MQTT 協議
    username: process.env.MQTT_USERNAME, // 替換為你的 HiveMQ Cloud 帳戶使用者名稱
    password: process.env.MQTT_PASSWORD, // 替換為你的 HiveMQ Cloud 帳戶密碼
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

db.run(`
    CREATE TABLE IF NOT EXISTS mqtt_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`, (err) => {
    if (err) {
        console.error('Failed to create mqtt_logs table:', err);
    } else {
        console.log('mqtt_logs table ready');
    }
});


// 驗證登入狀態中間件+
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

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.send('登出時發生錯誤');
        }
        res.redirect('/');
    });
});

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

app.post('/send-mqtt', authMiddleware, (req, res) => {
    const { direction } = req.body;

    if (!direction) {
        return res.status(400).json({ success: false, error: '未提供方向' });
    }

    const topic = 'tofu/roud';
    mqttClient.publish(topic, direction, (err) => {
        if (err) {
            console.error('MQTT publish error:', err);
            return res.status(500).json({ success: false, error: '無法發佈訊息到 MQTT 主題' });
        }

        // 插入資料庫
        const query = `INSERT INTO mqtt_logs (user, message) VALUES (?, ?)`;
        db.run(query, [req.session.user, direction], (err) => {
            if (err) {
                console.error('Failed to log MQTT message:', err);
                return res.status(500).json({ success: false, error: '無法記錄訊息' });
            }

            console.log(`Logged message: ${direction} by user: ${req.session.user}`);
            res.json({ success: true });
        });
    });
});


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 路由
app.get('/', (req, res) => res.render('login'));
app.get('/reg', (req, res) => res.render('register'));
app.get('/main', authMiddleware, (req, res) => res.render('index', { user: req.session.user }));
app.get('/about', authMiddleware, (req, res) => res.render('about', { user: req.session.user }));
app.get('/control', authMiddleware, (req, res) => {
    const query = `SELECT * FROM mqtt_logs ORDER BY timestamp DESC`;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Failed to fetch MQTT logs:', err);
            return res.status(500).send('無法獲取記錄');
        }
        res.render('control', { user: req.session.user, logs: rows });
    });
});


app.get('/project', authMiddleware, (req, res) => res.render('project', { user: req.session.user }));
app.get('/admin', authMiddleware, (req, res) => res.send('頁面製作中...'));

// 啟動伺服器
app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
