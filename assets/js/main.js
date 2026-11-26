/* ===================================================
   KOKWANI CHAUKE WATER DRILLING – Main JavaScript
   =================================================== */

// ===== NAVBAR SCROLL EFFECT =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const spans = hamburger.querySelectorAll('span');
  if (navLinks.classList.contains('open')) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  }
});

// Close menu on nav link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    const spans = hamburger.querySelectorAll('span');
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  });
});

// ===== SMOOTH SCROLL FOR ALL ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ===== ACTIVE NAV LINK ON SCROLL =====
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  const scrollPos = window.scrollY + 100;
  sections.forEach(section => {
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;
    const id = section.getAttribute('id');
    const link = document.querySelector(`.nav-links a[href="#${id}"]`);
    if (link) {
      if (scrollPos >= top && scrollPos < bottom) {
        document.querySelectorAll('.nav-links a').forEach(l => l.style.color = '');
        link.style.color = '#f7a800';
      }
    }
  });
});

// ===== SCROLL REVEAL ANIMATION =====
const revealElements = document.querySelectorAll(
  '.service-card, .contact-card, .why-item, .carousel-slide, .pricing-row, .about-highlights, .about-img-main'
);

revealElements.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, i * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealElements.forEach(el => revealObserver.observe(el));

// ===== CONTACT FORM SUBMIT (Formspree) =====
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn = this.querySelector('button[type="submit"]');
    const original = btn.innerHTML;

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';
    btn.disabled = true;

    try {
      const response = await fetch(this.action, {
        method: 'POST',
        body: new FormData(this),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
        btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
        this.reset();
        setTimeout(() => {
          btn.innerHTML = original;
          btn.style.background = '';
          btn.disabled = false;
        }, 4000);
      } else {
        throw new Error('Server error');
      }
    } catch {
      btn.innerHTML = '<i class="fas fa-times"></i> Failed – Try calling us';
      btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
      setTimeout(() => {
        btn.innerHTML = original;
        btn.style.background = '';
        btn.disabled = false;
      }, 4000);
    }
  });
}

// ===== PRICING ROW HOVER DEPTH HIGHLIGHT =====
document.querySelectorAll('.pricing-row').forEach(row => {
  row.addEventListener('mouseenter', () => {
    row.style.borderLeft = '3px solid #f7a800';
  });
  row.addEventListener('mouseleave', () => {
    row.style.borderLeft = '';
  });
});

// ===== COUNTER ANIMATION FOR HERO STATS =====
function animateCounter(el, target, suffix = '') {
  let start = 0;
  const duration = 2000;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) {
      el.textContent = target.toLocaleString() + suffix;
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(start).toLocaleString() + suffix;
    }
  }, 16);
}

const heroObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const stats = entry.target.querySelectorAll('.stat-num');
      stats.forEach(stat => {
        const text = stat.textContent;
        if (text.includes('363K')) {
          animateCounter(stat, 363, 'K+');
        } else if (text.includes('100')) {
          animateCounter(stat, 100, 'm');
        }
      });
      heroObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) heroObserver.observe(heroStats);

// ===== GALLERY CAROUSEL (focused-center style) =====
(function () {
  const track    = document.getElementById('carouselTrack');
  const dotsWrap = document.getElementById('carouselDots');
  if (!track) return;

  const slides    = Array.from(track.querySelectorAll('.carousel-slide'));
  const total     = slides.length;
  let   current   = 0;
  let   autoTimer = null;
  let   touchStartX = 0;

  // ── Build dot indicators ─────────────────────────────────���────────
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => { goTo(i); resetAuto(); });
    dotsWrap.appendChild(dot);
  });

  // ── Position the track so the active card is centred ─────────────
  function positionTrack() {
    const wrapper   = track.parentElement;          // .carousel-wrapper
    const wrapW     = wrapper.offsetWidth;
    const slide     = slides[current];
    const slideW    = slide.offsetWidth;
    const gap       = 24;                           // matches CSS gap: 1.5rem

    // Distance from track left-edge to the left-edge of the active card
    let offsetToCard = 0;
    for (let i = 0; i < current; i++) {
      offsetToCard += slides[i].offsetWidth + gap;
    }

    // Shift so the active card sits in the centre of the wrapper
    const shift = offsetToCard - (wrapW / 2 - slideW / 2);
    track.style.transform = `translateX(${-shift}px)`;
  }

  // ── Mark active slide and update dots ────────────────────────────
  function updateActive() {
    slides.forEach((s, i) => s.classList.toggle('active', i === current));
    dotsWrap.querySelectorAll('.carousel-dot')
      .forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function goTo(index) {
    current = (index + total) % total;
    updateActive();
    positionTrack();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  // Initialise
  updateActive();
  // Wait one frame so slide widths are painted
  requestAnimationFrame(() => positionTrack());
  window.addEventListener('resize', positionTrack);

  // ── Arrow buttons ─────────────────────────────────────────────────
  document.querySelector('.carousel-prev').addEventListener('click', () => { prev(); resetAuto(); });
  document.querySelector('.carousel-next').addEventListener('click', () => { next(); resetAuto(); });

  // ── Auto-play ─────────────────────────────────────────────────────
  function startAuto() { autoTimer = setInterval(next, 4000); }
  function resetAuto()  { clearInterval(autoTimer); startAuto(); }
  startAuto();

  const wrapper = track.closest('.carousel-wrapper');
  wrapper.addEventListener('mouseenter', () => clearInterval(autoTimer));
  wrapper.addEventListener('mouseleave', startAuto);

  // ── Touch / swipe ─────────────────────────────────────────────────
  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); resetAuto(); }
  });

  // ── Keyboard navigation ───────────────────────────────────────────
  document.addEventListener('keydown', e => {
    const section = document.getElementById('gallery');
    if (!section) return;
    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      if (e.key === 'ArrowRight') { next(); resetAuto(); }
      if (e.key === 'ArrowLeft')  { prev(); resetAuto(); }
    }
  });

  // ── Clicking a side card jumps to it ─────────────────────────────
  slides.forEach((slide, i) => {
    slide.addEventListener('click', () => {
      if (i !== current) { goTo(i); resetAuto(); return; }

      // Lightbox for the active card
      const img = slide.querySelector('img');
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position:fixed;inset:0;background:rgba(0,0,0,0.92);
        display:flex;align-items:center;justify-content:center;
        z-index:9999;cursor:pointer;padding:1rem;
      `;
      const image = document.createElement('img');
      image.src = img.src;
      image.alt = img.alt;
      image.style.cssText = `max-width:90vw;max-height:90vh;border-radius:12px;object-fit:contain;`;
      const close = document.createElement('button');
      close.innerHTML = '&times;';
      close.style.cssText = `
        position:fixed;top:1.5rem;right:1.5rem;background:none;border:none;
        color:white;font-size:2.5rem;cursor:pointer;line-height:1;opacity:0.8;
      `;
      overlay.appendChild(image);
      overlay.appendChild(close);
      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';
      const closeIt = () => { document.body.removeChild(overlay); document.body.style.overflow = ''; };
      overlay.addEventListener('click', closeIt);
      close.addEventListener('click', e => { e.stopPropagation(); closeIt(); });
      document.addEventListener('keydown', e => { if (e.key === 'Escape') closeIt(); }, { once: true });
    });
  });
})();

console.log('Kokwani Chauke Water Drilling website loaded ✓');
