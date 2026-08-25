// ── CURSOR ──
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;

// Touch devices hide the custom cursor in CSS, so skip the rAF loop and the
// listeners entirely there — it is pure battery drain on a phone.
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (finePointer) {
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  const animCursor = () => {
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(animCursor);
  };
  animCursor();

  document.querySelectorAll('a, button, .member-card, .overview-card, .sponsor-card, .honorable-card, .job-meta-item, .highlight-media').forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.transform = 'translate(-50%,-50%) scale(1.8)';
      ring.style.opacity = '0.3';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.transform = 'translate(-50%,-50%) scale(1)';
      ring.style.opacity = '0.6';
    });
  });
}

// ── MOBILE NAV ──
const navToggle = document.getElementById('navToggle');
const navScrim = document.getElementById('navScrim');

function setNav(open) {
  document.body.classList.toggle('nav-open', open);
  if (navToggle) {
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
}

if (navToggle) {
  navToggle.addEventListener('click', () => {
    setNav(!document.body.classList.contains('nav-open'));
  });
}
if (navScrim) navScrim.addEventListener('click', () => setNav(false));

// tapping a link closes the panel so the anchor scroll is visible
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => setNav(false));
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') setNav(false);
});

// leaving the mobile breakpoint should never strand the panel open
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) setNav(false);
});

// ── HIRING BAR ──
const hiringClose = document.getElementById('hiringClose');
try {
  if (localStorage.getItem('brrltje-hiring-dismissed') === '1') {
    document.body.classList.add('hiring-dismissed');
  }
} catch (err) { /* storage blocked — bar just stays up */ }

if (hiringClose) {
  hiringClose.addEventListener('click', () => {
    document.body.classList.add('hiring-dismissed');
    try { localStorage.setItem('brrltje-hiring-dismissed', '1'); } catch (err) {}
  });
}

// ── HIGHLIGHT VIDEO SOUND ──
const highlightVideo = document.getElementById('highlightVideo');
const videoSound = document.getElementById('videoSound');

if (highlightVideo && videoSound) {
  videoSound.addEventListener('click', () => {
    highlightVideo.muted = !highlightVideo.muted;
    videoSound.querySelector('span').textContent = highlightVideo.muted ? 'Sound off' : 'Sound on';
    videoSound.classList.toggle('on', !highlightVideo.muted);
    if (!highlightVideo.muted) highlightVideo.play().catch(() => {});
  });
}

// ── SECRET TAB UNLOCK ──
const secretInput = document.getElementById('secretCode');
if (secretInput) {
  secretInput.addEventListener('input', () => {
    if (secretInput.value === "0504") {
      const memory = document.getElementById('memory');
      memory.style.display = 'block';
      memory.scrollIntoView({ behavior: 'smooth' });
      secretInput.value = '';
    }
  });
}

// ── NAV SCROLL ──
const nav = document.getElementById('nav');
const navSections = document.querySelectorAll('section');
const navAnchors = document.querySelectorAll('.nav-links a');
let navTicking = false;

// Coalesced into one rAF: the raw scroll handler re-measured every section on
// every event, which is the main source of jank on a phone.
function updateNav() {
  navTicking = false;
  nav.classList.toggle('scrolled', window.scrollY > 60);
  navSections.forEach(s => {
    const top = s.getBoundingClientRect().top;
    if (top <= 120 && top > -s.offsetHeight + 120) {
      navAnchors.forEach(a => a.classList.remove('active'));
      const link = document.querySelector(`.nav-links a[href="#${s.id}"]`);
      if (link) link.classList.add('active');
    }
  });
}

window.addEventListener('scroll', () => {
  if (navTicking) return;
  navTicking = true;
  requestAnimationFrame(updateNav);
}, { passive: true });

// ── REVEAL ON SCROLL ──
const reveals = document.querySelectorAll('.reveal');
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
reveals.forEach(r => obs.observe(r));

// ── FORM ──
// Posts to Formspree over fetch so the sender never leaves the page.
// If JS is unavailable the plain form POST still works as a fallback.
async function handleSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const label = form.querySelector('.btn-submit span');
  const button = form.querySelector('.btn-submit');
  const status = document.getElementById('formStatus');
  const original = 'Send It →';

  status.className = 'form-status';
  status.textContent = '';

  const name = document.getElementById('fname').value.trim();
  const email = document.getElementById('femail').value.trim();
  const message = document.getElementById('fmsg').value.trim();

  if (!name || !email || !message) {
    status.classList.add('error');
    status.textContent = 'Vul alle velden in.';
    return;
  }

  button.disabled = true;
  label.textContent = 'Sending...';

  try {
    const res = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) throw new Error('Request failed: ' + res.status);

    form.reset();
    label.textContent = 'Sent ✓';
    status.classList.add('success');
    status.textContent = 'Binnen. We komen erop terug.';
    setTimeout(() => {
      label.textContent = original;
      button.disabled = false;
    }, 3200);
  } catch (err) {
    label.textContent = original;
    button.disabled = false;
    status.classList.add('error');
    status.textContent = 'Verzenden mislukt. Probeer opnieuw of mail ons rechtstreeks.';
  }
}
