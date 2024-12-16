const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
const users = {}; // 模擬用戶數據庫

const SECRET_KEY = 'your_secret_key';

// 中間件
app.use(bodyParser.json());
app.use(cookieParser());

// 註冊路由
app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Email and password are required.');
    }
    if (users[email]) {
        return res.status(400).send('User already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users[email] = { email, password: hashedPassword };

    res.status(201).send('User registered successfully.');
});

// 登入路由
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = users[email];
    if (!user) {
        return res.status(400).send('Invalid email or password.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).send('Invalid email or password.');
    }

    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true });
    res.send('Login successful.');
});

// 驗證登入狀態路由
app.get('/profile', (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).send('Not authenticated.');
    }

    try {
        const user = jwt.verify(token, SECRET_KEY);
        res.json({ email: user.email });
    } catch (err) {
        res.status(401).send('Invalid token.');
    }
});

// 登出路由
app.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.send('Logout successful.');
});

// 啟動伺服器
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
