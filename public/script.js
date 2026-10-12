// Load tin nhắn mới nhất cho banner
async function loadLatestMessage() {
  try {
    const res = await fetch('/api/latest');
    const data = await res.json();
    document.getElementById('marquee').textContent = data.message;
  } catch (err) {
    document.getElementById('marquee').textContent = 'Không tải được tin nhắn';
  }
}

// Xử lý gửi form
document.getElementById('messageForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('name').value;
  const message = document.getElementById('message').value;
  const status = document.getElementById('formStatus');

  status.textContent = 'Đang gửi...';
  status.style.color = '#666';

  try {
    const res = await fetch('/api/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, message })
    });
    const data = await res.json();

    if (data.success) {
      status.textContent = 'Gửi tin nhắn thành công!';
      status.style.color = 'green';
      document.getElementById('messageForm').reset();
    } else {
      status.textContent = data.error || 'Gửi thất bại';
      status.style.color = 'red';
    }
  } catch (err) {
    status.textContent = 'Lỗi kết nối server';
    status.style.color = 'red';
  }
});

// Đổi ảnh đại diện mỗi 5 giây (hình ảnh động)
const avatars = [
  'https://i.pravatar.cc/300?img=12',
  'https://i.pravatar.cc/300?img=33',
  'https://i.pravatar.cc/300?img=47',
  'https://i.pravatar.cc/300?img=68'
];
let idx = 0;
setInterval(() => {
  idx = (idx + 1) % avatars.length;
  document.getElementById('avatar').src = avatars[idx];
}, 5000);

// Load banner khi mở trang + tự cập nhật mỗi 30 giây
loadLatestMessage();
setInterval(loadLatestMessage, 30000);