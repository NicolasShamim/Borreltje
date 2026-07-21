// ── CURSOR ──
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

function animCursor() {
  cursor.style.left = mx + 'px';
  cursor.style.top = my + 'px';
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  ring.style.left = rx + 'px';
  ring.style.top = ry + 'px';
  requestAnimationFrame(animCursor);
}
animCursor();

document.querySelectorAll('a, button, .member-card, .overview-card, .sponsor-card, .honorable-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    ring.style.transform = 'translate(-50%,-50%) scale(1.8)';
    ring.style.opacity = '0.3';
  });
  el.addEventListener('mouseleave', () => {
    ring.style.transform = 'translate(-50%,-50%) scale(1)';
    ring.style.opacity = '0.6';
  });
});

// ── SECRET TAB UNLOCK ──
const secretInput = document.getElementById('secretCode');
secretInput.addEventListener('input', () => {
  if (secretInput.value === "0504") {
    const memory = document.getElementById('memory');
    memory.style.display = 'block';
    memory.scrollIntoView({ behavior: 'smooth' });
    secretInput.value = '';
  }
});

// ── NAV SCROLL ──
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
  document.querySelectorAll('section').forEach(s => {
    const top = s.getBoundingClientRect().top;
    if (top <= 120 && top > -s.offsetHeight + 120) {
      document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
      const link = document.querySelector(`.nav-links a[href="#${s.id}"]`);
      if (link) link.classList.add('active');
    }
  });
});

// ── REVEAL ON SCROLL ──
const reveals = document.querySelectorAll('.reveal');
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
reveals.forEach(r => obs.observe(r));

// ── FORM ──
function handleSubmit(e) {
  const btn = e.target.querySelector('.btn-submit span');
  btn.textContent = 'Sending...';
  setTimeout(() => { btn.textContent = 'Sent ✓'; }, 800);
}