const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');

const port = 3000;
const app = express();
const secretKey = 'your_jwt_secret_key'; // 替換為更安全的密鑰

// 模擬用戶資料
const users = [
    { id: 1, username: 'hongfu553', password: 'F132369445' },
    { id: 2, username: 'user2', password: 'password2' },
];

// 設定解析 POST 請求的 body
app.use(express.urlencoded({ extended: true }));

// 驗證登入狀態中間件
function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).send(`
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

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(403).send('無效的 Token');
        }
        req.user = decoded;
        next();
    });
}

// 登入頁面路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// 驗證登入
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const user = users.find(
        (u) => u.username === username && u.password === password
    );

    if (user) {
        const token = jwt.sign({ id: user.id, username: user.username }, secretKey, {
            expiresIn: '1h',
        });
        res.send(`
            <html lang="zh-TW">
            <head>
                <meta charset="UTF-8">
                <title>登入成功</title>
                <script>
                    alert('登入成功');
                    window.location.href = '/main';
                </script>
            </head>
            <body>
            </body>
            </html>
        `);
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

// 註冊路由 (模擬)
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (users.find((u) => u.username === username)) {
        res.status(400).send('用戶名已存在');
    } else {
        users.push({ id: users.length + 1, username, password });
        res.send('註冊成功！<a href="/">立即登入</a>');
    }
});

// 登出 (模擬)
app.get('/logout', (req, res) => {
    res.redirect('/');
});

// 受保護的路由
app.get('/main', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/about', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/control', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'control.html'));
});

app.get('/project', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'project.html'));
});

app.get('/admin', authMiddleware, (req, res) => {
    res.send('頁面製作中...');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
