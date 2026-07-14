'use strict';

// 1. NAVBAR — scroll detection & active link
const navbar    = document.getElementById('navbar');
const navLinks  = document.querySelectorAll('.nav-link:not(.mobile-link)');
const sections  = document.querySelectorAll('section[id]');

function onScroll() {
  // Scrolled style
  navbar.classList.toggle('scrolled', window.scrollY > 20);

  // Back-to-top visibility
  const btn = document.getElementById('backToTop');
  if (btn) btn.classList.toggle('visible', window.scrollY > 400);

  // Active nav link
  const scrollPos = window.scrollY + window.innerHeight / 3;
  sections.forEach(sec => {
    const top = sec.offsetTop;
    const bottom = top + sec.offsetHeight;
    const id = sec.getAttribute('id');
    const link = document.querySelector(`.nav-link[href="#${id}"]`);
    if (link) link.classList.toggle('active', scrollPos >= top && scrollPos < bottom);
  });
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll(); // run once on load

// 2. HAMBURGER / MOBILE MENU
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger?.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
});

// Close on mobile link click
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

// 3. SCROLL REVEAL
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = parseInt(el.dataset.delay || '0', 10);
      setTimeout(() => el.classList.add('visible'), delay);
      revealObserver.unobserve(el);
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// 4. COUNTER ANIMATION (stats)
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCounters(entry.target);
      counterObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.5 }
);

const statsRow = document.querySelector('.stats-row');
if (statsRow) counterObserver.observe(statsRow);

function animateCounters(container) {
  container.querySelectorAll('.stat-num[data-target]').forEach(el => {
    const target  = parseInt(el.dataset.target, 10);
    const duration = 1400; // ms
    const start   = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent  = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }

    requestAnimationFrame(step);
  });
}

// 5. PROJECT FILTER
const filterBtns  = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Active state
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    projectCards.forEach(card => {
      const category = card.dataset.category;
      const match = filter === 'all' || category === filter;

      if (match) {
        card.classList.remove('hidden');
        // Re-trigger reveal animation
        card.classList.remove('visible');
        setTimeout(() => card.classList.add('visible'), 50);
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

// 6. CONTACT FORM VALIDATION & SUBMIT
const form       = document.getElementById('contactForm');
const submitBtn  = document.getElementById('submitBtn');
const btnText    = document.getElementById('btnText');
const formSuccess = document.getElementById('formSuccess');

function validateField(id, errorId, validFn, message) {
  const input = document.getElementById(id);
  const error = document.getElementById(errorId);
  if (!input || !error) return true;

  if (!validFn(input.value.trim())) {
    input.classList.add('error');
    error.textContent = message;
    return false;
  }
  input.classList.remove('error');
  error.textContent = '';
  return true;
}

function isNotEmpty(val) { return val.length > 0; }
function isEmail(val)    { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val); }
function isLongEnough(val) { return val.length >= 10; }

// Live validation on blur
document.getElementById('name')?.addEventListener('blur', () =>
  validateField('name', 'nameError', isNotEmpty, 'Nama tidak boleh kosong.')
);
document.getElementById('email')?.addEventListener('blur', () =>
  validateField('email', 'emailError', isEmail, 'Masukkan email yang valid.')
);
document.getElementById('message')?.addEventListener('blur', () =>
  validateField('message', 'messageError', isLongEnough, 'Pesan minimal 10 karakter.')
);

form?.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Validate all
  const valid =
    validateField('name',    'nameError',    isNotEmpty,   'Nama tidak boleh kosong.')   &
    validateField('email',   'emailError',   isEmail,      'Masukkan email yang valid.')  &
    validateField('message', 'messageError', isLongEnough, 'Pesan minimal 10 karakter.');

  if (!valid) return;

  // Loading state
  submitBtn.disabled = true;
  btnText.textContent = 'Mengirim...';

  try {
    // Simulate async send (replace with real API / EmailJS / Formspree)
    await fakeSubmit();

    formSuccess.classList.add('show');
    form.reset();
    setTimeout(() => formSuccess.classList.remove('show'), 6000);
  } catch {
    alert('Terjadi kesalahan. Silakan coba lagi.');
  } finally {
    submitBtn.disabled = false;
    btnText.textContent = 'Kirim Pesan →';
  }
});

// Swap this with your real form handler (Formspree / EmailJS / fetch POST)
function fakeSubmit() {
  return new Promise(resolve => setTimeout(resolve, 1200));
}

// 7. BACK TO TOP
document.getElementById('backToTop')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// 8. PARTICLE CANVAS (hero background)
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();

  const PARTICLE_COUNT = 60;
  const COLOR = '56, 189, 248';

  function createParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.35,
      dy: (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.5 + 0.1,
    };
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(createParticle());

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p = particles[i], q = particles[j];
        const dist = Math.hypot(p.x - q.x, p.y - q.y);
        if (dist < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${COLOR}, ${(1 - dist / 120) * 0.12})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    }

    // Dots
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${COLOR}, ${p.alpha})`;
      ctx.fill();

      p.x += p.dx;
      p.y += p.dy;

      // Wrap around
      if (p.x < 0)  p.x = W;
      if (p.x > W)  p.x = 0;
      if (p.y < 0)  p.y = H;
      if (p.y > H)  p.y = 0;
    });

    requestAnimationFrame(draw);
  }

  draw();
})();

// 9. SMOOTH ANCHOR SCROLL (offset for fixed nav)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 64;
    window.scrollTo({
      top: target.offsetTop - navH,
      behavior: 'smooth',
    });
  });
});


// 11. LANYARD ID CARD — drag + pendulum physics
(function initLanyard() {
  const swing   = document.getElementById('lanyardSwing');
  const card    = document.getElementById('idCard');
  const wrapper = document.getElementById('lanyardWrapper');
  const hint    = document.getElementById('dragHint');
  if (!swing || !card || !wrapper) return;

  // Physics state
  let angle    = -4;   // degrees (negative = slight left tilt)
  let velocity = 0;
  const gravity   = 0.35;   // pull back to center
  const damping   = 0.88;   // air resistance
  const maxAngle  = 38;     // max swing

  // Drag state
  let isDragging   = false;
  let startX       = 0;
  let lastX        = 0;
  let dragVelocity = 0;
  let raf          = null;

  // Rotate the whole strap + clip + card as one rigid lanyard body
  function applyAngle(a) {
    swing.style.transform = `rotate(${a}deg)`;
  }

  // Physics tick
  function tick() {
    if (isDragging) return;
    // Spring back to 0
    const force = -gravity * angle;
    velocity = (velocity + force) * damping;
    angle   += velocity;
    applyAngle(angle);
    if (Math.abs(angle) > 0.05 || Math.abs(velocity) > 0.05) {
      raf = requestAnimationFrame(tick);
    } else {
      angle    = 0;
      velocity = 0;
      applyAngle(0);
    }
  }

  function startDrag(clientX) {
    isDragging   = true;
    startX       = clientX;
    lastX        = clientX;
    dragVelocity = 0;
    cancelAnimationFrame(raf);
    wrapper.style.cursor = 'grabbing';
    if (hint) hint.style.display = 'none';
  }

  function onDrag(clientX) {
    if (!isDragging) return;
    const dx = clientX - lastX;
    dragVelocity = dx;
    angle = Math.max(-maxAngle, Math.min(maxAngle, angle + dx * 0.4));
    applyAngle(angle);
    lastX = clientX;
  }

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    velocity   = dragVelocity * 0.5; // carry momentum
    wrapper.style.cursor = 'grab';
    raf = requestAnimationFrame(tick);
  }

  // Mouse events
  wrapper.addEventListener('mousedown', e => { e.preventDefault(); startDrag(e.clientX); });
  window.addEventListener('mousemove',  e => onDrag(e.clientX));
  window.addEventListener('mouseup',    endDrag);

  // Touch events
  wrapper.addEventListener('touchstart', e => {
    startDrag(e.touches[0].clientX);
  }, { passive: true });
  window.addEventListener('touchmove', e => {
    if (isDragging) e.preventDefault();
    onDrag(e.touches[0].clientX);
  }, { passive: false });
  window.addEventListener('touchend', endDrag);

  // Initial idle sway on load
  setTimeout(() => {
    velocity = 1.5;
    raf = requestAnimationFrame(tick);
  }, 800);

  // Subtle idle sway loop (when user hasn't interacted for a while)
  let idleTimer;
  function resetIdleSway() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (!isDragging && Math.abs(angle) < 1) {
        velocity = (Math.random() - 0.5) * 1.5;
        raf = requestAnimationFrame(tick);
        resetIdleSway();
      }
    }, 5000);
  }
  wrapper.addEventListener('mousedown', resetIdleSway);
  wrapper.addEventListener('touchstart', resetIdleSway);
  resetIdleSway();

  // Photo tilt follows mouse (3D feel)
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const rx   = ((e.clientY - cy) / rect.height) * -10;
    const ry   = ((e.clientX - cx) / rect.width)  *  10;
    card.style.setProperty('--rx', rx + 'deg');
    card.style.setProperty('--ry', ry + 'deg');
  });
  card.addEventListener('mouseleave', () => {
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  });
})();

(function typeEffect() {
  const tag = document.querySelector('.hero-tag');
  if (!tag) return;
  const originalText = tag.textContent.trim();
  const dot = tag.querySelector('.tag-dot');
  tag.innerHTML = '';
  if (dot) tag.appendChild(dot);
  const span = document.createElement('span');
  tag.appendChild(span);

  let i = 0;
  const speed = 50; // ms per character

  function type() {
    if (i < originalText.length) {
      span.textContent += originalText[i++];
      setTimeout(type, speed);
    }
  }


  setTimeout(type, 600); // start after brief delay
})();

// ─── EMAILJS CONTACT FORM ───────────────────────────────────────────────────
const EMAILJS_PUBLIC_KEY  = 'IZGidtWN1f9pj6vxA';   // Account → Public Key
const EMAILJS_SERVICE_ID  = 'service_bxbbhq7';        // Email Services → Service ID
const EMAILJS_TEMPLATE_ID = 'template_fkkbydo';       // Email Templates → Template ID

(function initContactForm() {
  // Inisialisasi EmailJS
  if (typeof emailjs === 'undefined') return;
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

  const form       = document.getElementById('contactForm');
  const btnText    = document.getElementById('btnText');
  const submitBtn  = document.getElementById('submitBtn');
  const successBox = document.getElementById('formSuccess');
  const nameErr    = document.getElementById('nameError');
  const emailErr   = document.getElementById('emailError');
  const msgErr     = document.getElementById('messageError');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Reset errors
    [nameErr, emailErr, msgErr].forEach(el => { if (el) el.textContent = ''; });

    const name    = form.name.value.trim();
    const email   = form.email.value.trim();
    const subject = form.subject.value;
    const message = form.message.value.trim();

    // Validasi
    let valid = true;
    if (!name)    { if (nameErr)  nameErr.textContent  = 'Nama wajib diisi.';  valid = false; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (emailErr) emailErr.textContent = 'Email tidak valid.'; valid = false;
    }
    if (!message) { if (msgErr)   msgErr.textContent   = 'Pesan wajib diisi.'; valid = false; }
    if (!valid) return;

    // Loading state
    submitBtn.disabled = true;
    if (btnText) btnText.textContent = 'Mengirim…';

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        name:    name,
        email:   email,
        subject: subject || 'Pesan dari Portfolio',
        message: message,
      });

      // Sukses
      form.reset();
      if (successBox) {
        successBox.textContent = '✅ Pesan terkirim! Saya akan membalas dalam 24 jam.';
        successBox.style.display = 'block';
        setTimeout(() => { successBox.style.display = 'none'; }, 6000);
      }
    } catch (err) {
      console.error('EmailJS error:', err);
      if (successBox) {
        successBox.textContent = '❌ Gagal mengirim pesan. Coba lagi atau hubungi via Instagram/LinkedIn.';
        successBox.style.display = 'block';
        successBox.style.color = '#f43f5e';
        setTimeout(() => {
          successBox.style.display = 'none';
          successBox.style.color = '';
        }, 6000);
      }
    } finally {
      submitBtn.disabled = false;
      if (btnText) btnText.textContent = 'Kirim Pesan →';
    }
  });
})();
