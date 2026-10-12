require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const LATEST_FILE = path.join(__dirname, 'data', 'latest.json');
const MESSAGES_FILE = path.join(__dirname, 'data', 'messages.json');

if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}
if (!fs.existsSync(LATEST_FILE)) {
  fs.writeFileSync(LATEST_FILE, JSON.stringify({ message: 'Chào mừng đến với website giới thiệu của tôi!' }));
}
if (!fs.existsSync(MESSAGES_FILE)) {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify([]));
}

function getLatestMessage() {
  try {
    return JSON.parse(fs.readFileSync(LATEST_FILE, 'utf8')).message;
  } catch (err) {
    return 'Chưa có tin nhắn nào';
  }
}

function updateLatestMessage(msg) {
  fs.writeFileSync(LATEST_FILE, JSON.stringify({ 
    message: msg, 
    updatedAt: new Date().toISOString() 
  }));
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/latest', (req, res) => {
  res.json({ message: getLatestMessage() });
});

app.post('/api/message', (req, res) => {
  const { name, message } = req.body;
  if (!name || !message) {
    return res.status(400).json({ success: false, error: 'Thiếu tên hoặc nội dung' });
  }

  try {
    const messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
    messages.push({ name, message, time: new Date().toLocaleString('vi-VN') });
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
    console.log(`[Tin nhắn mới] ${name}: ${message}`);
    res.json({ success: true, message: 'Gửi tin nhắn thành công!' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

app.post('/api/admin/message', (req, res) => {
  const { secret, message } = req.body;
  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ success: false, error: 'Sai mật khẩu' });
  }
  if (!message) {
    return res.status(400).json({ success: false, error: 'Thiếu nội dung' });
  }
  updateLatestMessage(message);
  res.json({ success: true, message: 'Đã cập nhật banner thành công!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server đang chạy tại http://0.0.0.0:${PORT}`);
});