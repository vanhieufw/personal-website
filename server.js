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

// Khởi tạo thư mục và các file dữ liệu nếu chưa tồn tại
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

// Hàm hỗ trợ đọc/ghi tin nhắn banner
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

// ===== Hàm gửi tin nhắn Telegram trực tiếp qua Fetch API =====
async function sendTelegramMessage(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.log('Chưa cấu hình TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID trong .env');
    return;
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text
      })
    });

    const data = await response.json();
    if (!data.ok) {
      console.error('Lỗi API Telegram:', data.description);
    } else {
      console.log('Đã gửi tin nhắn Telegram thành công!');
    }
  } catch (err) {
    console.error('Lỗi kết nối Telegram:', err.message);
  }
}

// Trang chủ
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Lấy tin nhắn banner
app.get('/api/latest', (req, res) => {
  res.json({ message: getLatestMessage() });
});

// Khách gửi tin nhắn -> lưu vào file + gửi thông báo về Telegram
app.post('/api/message', async (req, res) => {
  const { name, message } = req.body;
  if (!name || !message) {
    return res.status(400).json({ success: false, error: 'Thiếu tên hoặc nội dung' });
  }

  try {
    // 1. Lưu tin nhắn vào file JSON
    const messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
    messages.push({ name, message, time: new Date().toLocaleString('vi-VN') });
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));

    // 2. Đẩy thông báo về Telegram qua Fetch API
    const text = `📩 Tin nhắn mới từ website!\n\n👤 Người gửi: ${name}\n💬 Nội dung: ${message}\n⏰ ${new Date().toLocaleString('vi-VN')}`;
    await sendTelegramMessage(text);

    console.log(`[Tin nhắn] ${name}: ${message}`);
    res.json({ success: true, message: 'Gửi thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

// Admin cập nhật nội dung Banner chữ chạy từ điện thoại
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
