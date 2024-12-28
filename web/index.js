const express = require('express');
const path = require('path');
const session = require('express-session');
const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');
const expressWs = require('express-ws');

const port = 3000;
const app = express();
expressWs(app);


// Session 中間件設定
app.use(
    session({
        secret: 'fuckyournigger', // 替換為更安全的密鑰
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 60 * 60 * 1000 }, // 設定 session 的有效期為 1 小時
    })
);
// 設定解析 POST 請求的 body
app.use(express.urlencoded({ extended: true }));

const db = new sqlite3.Database('highway.db', (err) => {
    if (err) {
        console.error('Database error:', err);
    } else {
        console.log('Database is connected');
    }
});

// 驗證登入狀態中間件
function authMiddleware(req, res, next) {
    if (req.session.user) {
        next();
    } else {
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
            <body>
            </body>
            </html>
        `);
    }
}

// 驗證登入
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
                    res.redirect('/main');
                } else {
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
                }
            });
        }
    });
});

// 註冊路由
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); // 在註冊時進行哈希處理
    const query = `INSERT INTO users (username, password) VALUES (?, ?)`;
    db.run(query, [username, hashedPassword], (err) => {
        if (err) {
            console.error('Database insert error:', err);
            return res.status(500).send('伺服器內部錯誤');
        }
        res.send(`
            <html lang="zh-TW">
            <head>
                <meta charset="UTF-8">
                <title>註冊成功</title>
                <script>
                    alert('帳號註冊成功，立即登入');
                    window.location.href = '/';
                </script>
            </head>
            </html>
        `);
    });
});

// logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.send('登出時發生錯誤');
        }
        res.redirect('/');
    });
});
//websocket server
app.ws('/roud-control', (ws, req) => {
    ws.on('message', (msg) => {
        console.log(msg);
        ws.send(msg);
    });
});
//websocket server end


//view engine
app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

// routes
app.get('/', (req, res) => {
    res.render('login');
});

app.get('/reg', (req, res) => {
    res.render('register');
});

app.get('/main', authMiddleware, (req, res) => {
    res.render('index', { user: req.session.user });
});

app.get('/about', authMiddleware, (req, res) => {
    res.render('about', { user: req.session.user });
});

app.get('/control', authMiddleware, (req, res) => {
    res.render('control', { user: req.session.user },);
});

app.get('/project', authMiddleware, (req, res) => {
    res.render('project', { user: req.session.user });
});

app.get('/admin', authMiddleware, (req, res) => {
    res.send('頁面製作中...');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});