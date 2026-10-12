// ========== Particles ==========
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
    // random neon colors
    const colors = ['#a78bfa', '#22d3ee', '#f472b6', '#c4b5fd'];
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.boxShadow = `0 0 8px ${p.style.background}`;
    container.appendChild(p);
  }
})();

// ========== Marquee messages ==========
(function initMarquee() {
  const el = document.getElementById('marquee');
  if (!el) return;

  const messages = [
    '✨ Chào mừng bạn đến trang giới thiệu của Nguyễn Văn A',
    '💻 Đam mê Web • Docker • DevOps',
    '🚀 Luôn học hỏi công nghệ mới mỗi ngày',
    '📚 Sở thích: đọc sách • chơi game • code',
    '💌 Gửi lời nhắn cho mình ở form bên dưới nhé!'
  ];

  // Duplicate for seamless loop
  const text = messages.join('   ✦   ') + '   ✦   ' + messages.join('   ✦   ');
  el.textContent = text;
})();

// ========== Form handling (giữ nguyên chức năng) ==========
(function initForm() {
  const form = document.getElementById('messageForm');
  const status = document.getElementById('formStatus');
  if (!form || !status) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !message) {
      status.textContent = 'Vui lòng điền đầy đủ thông tin!';
      status.className = 'error';
      return;
    }

    // Simulate sending
    status.textContent = 'Đang gửi...';
    status.className = '';

    setTimeout(() => {
      status.textContent = `Cảm ơn ${name}! Tin nhắn của bạn đã được gửi ✨`;
      status.className = 'success';
      form.reset();

      // Clear status after a while
      setTimeout(() => {
        status.textContent = '';
        status.className = '';
      }, 4500);
    }, 700);
  });
})();