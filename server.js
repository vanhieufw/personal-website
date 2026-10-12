require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== Cấu hình Telegram (bật khi có token) =====
let bot = null;
if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
  const TelegramBot = require('node-telegram-bot-api');
  bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
  console.log('Telegram Bot đã sẵn sàng');
}

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
  fs.writeFileSync(LATEST_FILE, JSON.stringify({ 
    message: 'Chào mừng đến với website giới thiệu của Nguyễn Thanh Hiếu!' 
  }));
}
if (!fs.existsSync(MESSAGES_FILE)) {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify([]));
}

function getLatestMessage() {
  try {
    return JSON.parse(fs.readFileSync(LATEST_FILE, 'utf8')).message;
  } catch {
    return 'Chào mừng đến với website của mình!';
  }
}

function updateLatestMessage(msg) {
  fs.writeFileSync(LATEST_FILE, JSON.stringify({ 
    message: msg, 
    updatedAt: new Date().toISOString() 
  }));
}

// Trang chủ
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Lấy tin nhắn banner
app.get('/api/latest', (req, res) => {
  res.json({ message: getLatestMessage() });
});

// Khách gửi tin nhắn → lưu + đẩy về Telegram
app.post('/api/message', async (req, res) => {
  const { name, message } = req.body;
  if (!name || !message) {
    return res.status(400).json({ success: false, error: 'Thiếu tên hoặc nội dung' });
  }

  try {
    // Lưu vào file
    const messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
    messages.push({ name, message, time: new Date().toLocaleString('vi-VN') });
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));

    // Đẩy về Telegram nếu đã cấu hình
    if (bot) {
      const text = `📩 Tin nhắn mới từ website!\n\n👤 Người gửi: ${name}\n💬 Nội dung: ${message}\n⏰ ${new Date().toLocaleString('vi-VN')}`;
      await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, text);
    }

    console.log(`[Tin nhắn] ${name}: ${message}`);
    res.json({ success: true, message: 'Gửi thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

// Admin cập nhật banner từ điện thoại
app.post('/api/admin/message', (req, res) => {
  const { secret, message } = req.body;
  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ success: false, error: 'Sai mật khẩu' });
  }
  if (!message) {
    return res.status(400).json({ success: false, error: 'Thiếu nội dung' });
  }

  updateLatestMessage(message);
  res.json({ success: true, message: 'Đã cập nhật banner!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server chạy tại http://0.0.0.0:${PORT}`);
});