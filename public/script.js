// ========== Particles (giữ nguyên hiệu ứng đẹp) ==========
(function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const count = 28;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = 8 + Math.random() * 14 + 's';
    p.style.animationDelay = Math.random() * 10 + 's';
    p.style.width = p.style.height = 2 + Math.random() * 3 + 'px';
    const colors = ['#a78bfa', '#22d3ee', '#f472b6', '#c4b5fd'];
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.boxShadow = `0 0 8px ${p.style.background}`;
    container.appendChild(p);
  }
})();

// ========== Load tin nhắn mới nhất cho banner ==========
async function loadLatestMessage() {
  const el = document.getElementById('marquee');
  if (!el) return;

  try {
    const res = await fetch('/api/latest');
    const data = await res.json();
    // Lặp lại nội dung để chạy mượt
    const msg = data.message || 'Chào mừng đến với website của mình!';
    el.textContent = `${msg}   ✦   ${msg}   ✦   ${msg}   ✦   ${msg}`;
  } catch (err) {
    el.textContent = 'Chào mừng đến với website giới thiệu của mình!';
  }
}

// ========== Form gửi tin nhắn thật ==========
(function initForm() {
  const form = document.getElementById('messageForm');
  const status = document.getElementById('formStatus');
  if (!form || !status) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !message) {
      status.textContent = 'Vui lòng điền đầy đủ thông tin!';
      status.className = 'error';
      return;
    }

    status.textContent = 'Đang gửi...';
    status.className = '';

    try {
      const res = await fetch('/api/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message })
      });
      const data = await res.json();

      if (data.success) {
        status.textContent = `Cảm ơn ${name}! Tin nhắn của bạn đã được gửi ✨`;
        status.className = 'success';
        form.reset();
      } else {
        status.textContent = data.error || 'Gửi thất bại';
        status.className = 'error';
      }
    } catch (err) {
      status.textContent = 'Lỗi kết nối server';
      status.className = 'error';
    }

    setTimeout(() => {
      status.textContent = '';
      status.className = '';
    }, 4500);
  });
})();

// ========== Ảnh đại diện động ==========
const avatars = [
  'https://i.pravatar.cc/300?img=12',
  'https://i.pravatar.cc/300?img=33',
  'https://i.pravatar.cc/300?img=47',
  'https://i.pravatar.cc/300?img=68',
  'https://i.pravatar.cc/300?img=15'
];
let avatarIndex = 0;
setInterval(() => {
  avatarIndex = (avatarIndex + 1) % avatars.length;
  const img = document.getElementById('avatar');
  if (img) img.src = avatars[avatarIndex];
}, 4000);

// ========== Khởi chạy ==========
loadLatestMessage();
setInterval(loadLatestMessage, 20000); // tự cập nhật banner mỗi 20 giây