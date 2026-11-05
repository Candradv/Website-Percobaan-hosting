const root = document.documentElement;
const glow = document.querySelector('.cursor-glow');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

window.addEventListener('pointermove', (event) => {
  glow.style.opacity = '1';
  glow.style.left = `${event.clientX}px`;
  glow.style.top = `${event.clientY}px`;
});

const splitTarget = document.querySelector('[data-split]');
if (splitTarget && !prefersReducedMotion) {
  splitTarget.innerHTML = [...splitTarget.textContent].map((char) =>
    char === ' ' ? ' ' : `<span class="char">${char}</span>`
  ).join('');
}

const onScroll = () => {
  const scrollY = window.scrollY;
  const viewport = window.innerHeight;

  if (!prefersReducedMotion) {
    document.querySelectorAll('.hero-media img').forEach((image) => {
      image.style.transform = `scale(1.08) translateY(${Math.min(scrollY * 0.035, 38)}px)`;
    });

    document.querySelectorAll('.proof-image img').forEach((image) => {
      const rect = image.parentElement.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (viewport - rect.top) / (viewport + rect.height)));
      image.style.transform = `scale(${1.12 - progress * 0.08}) translateY(${(progress - .5) * 30}px)`;
    });

    const splitRect = splitTarget?.getBoundingClientRect();
    if (splitRect && splitRect.top < viewport * .85 && splitRect.bottom > 0) {
      const progress = Math.max(0, Math.min(1, (viewport * .85 - splitRect.top) / (viewport * .65)));
      splitTarget.querySelectorAll('.char').forEach((char, index) => {
        char.style.color = index / splitTarget.textContent.length <= progress ? '#ed3b1e' : '#f7f4ed';
      });
    }

    const cards = document.querySelectorAll('.voice-card');
    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const progress = Math.max(-1, Math.min(1, (viewport / 2 - rect.top) / viewport));
      const baseRotation = [-2, 1, 0][index];
      card.style.transform = `translateY(${progress * 24}px) rotate(${baseRotation + progress * .7}deg)`;
    });

    document.querySelectorAll('.poster').forEach((poster, index) => {
      const rect = poster.getBoundingClientRect();
      const centerOffset = (rect.top + rect.height / 2 - viewport / 2) / viewport;
      const direction = index === 1 ? -1 : 1;
      poster.style.rotate = `${Math.max(-3, Math.min(3, centerOffset * 8 * direction))}deg`;
    });
  }
  document.querySelector('.back-to-top')?.classList.toggle('is-visible', scrollY > viewport);
};

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
});

const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Buka navigasi' : 'Tutup navigasi');
  mobileMenu.classList.toggle('is-open', !isOpen);
});

mobileMenu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Buka navigasi');
    mobileMenu.classList.remove('is-open');
  });
});

const form = document.querySelector('#voiceForm');
const status = document.querySelector('#formStatus');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const name = String(data.get('name')).trim();
  status.textContent = `Terima kasih, ${name}. Suaramu sudah tercatat untuk dibawa ke ruang aksi.`;
  form.reset();
});

const posterSlides = [...document.querySelectorAll('.poster-slide')];
const posterDots = [...document.querySelectorAll('.poster-dots button')];
let activePoster = 0;
let posterTimer;

const showPoster = (index) => {
  activePoster = (index + posterSlides.length) % posterSlides.length;
  posterSlides.forEach((slide, slideIndex) => slide.classList.toggle('is-active', slideIndex === activePoster));
  posterDots.forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === activePoster));
};

const restartPosterTimer = () => {
  window.clearInterval(posterTimer);
  posterTimer = window.setInterval(() => showPoster(activePoster + 1), 4000);
};

document.querySelector('.embed-prev')?.addEventListener('click', () => {
  showPoster(activePoster - 1);
  restartPosterTimer();
});

document.querySelector('.embed-next')?.addEventListener('click', () => {
  showPoster(activePoster + 1);
  restartPosterTimer();
});

posterDots.forEach((dot, index) => dot.addEventListener('click', () => {
  showPoster(index);
  restartPosterTimer();
}));

const posterSlider = document.querySelector('#posterSlider');
let posterTouchStart = 0;

posterSlider?.addEventListener('touchstart', (event) => {
  posterTouchStart = event.changedTouches[0].clientX;
}, { passive: true });

posterSlider?.addEventListener('touchend', (event) => {
  const distance = event.changedTouches[0].clientX - posterTouchStart;
  if (Math.abs(distance) < 45) return;
  showPoster(activePoster + (distance < 0 ? 1 : -1));
  restartPosterTimer();
}, { passive: true });

if (posterSlides.length && !prefersReducedMotion) restartPosterTimer();
