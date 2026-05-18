// ===== Mobile Nav Toggle =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

// Close mobile nav when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
  });
});

// ===== Navbar scroll effect (throttled) =====
const navbar = document.getElementById('navbar');
let scrollTicking = false;

window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    window.requestAnimationFrame(() => {
      if (window.scrollY > 50) {
        navbar.style.background = 'rgba(10, 10, 10, 0.97)';
      } else {
        navbar.style.background = 'rgba(10, 10, 10, 0.92)';
      }
      scrollTicking = false;
    });
    scrollTicking = true;
  }
});

// ===== Play button triggers audio (with error handling) =====
let currentlyPlaying = null;

document.querySelectorAll('.mix-play-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.mix-card');
    const audio = card.querySelector('audio');
    if (!audio) return;

    if (audio.paused) {
      // Pause whatever is currently playing
      if (currentlyPlaying && currentlyPlaying !== audio) {
        currentlyPlaying.pause();
        const prevCard = currentlyPlaying.closest('.mix-card');
        const prevBtn = prevCard ? prevCard.querySelector('.mix-play-btn') : null;
        if (prevBtn) prevBtn.innerHTML = '&#9654;';
      }

      // Play with error handling — avoids unhandled Promise rejection
      // if the file is missing or the browser blocks autoplay
      audio.play()
        .then(() => {
          currentlyPlaying = audio;
          btn.innerHTML = '&#10074;&#10074;';
        })
        .catch(() => {
          // File not found or playback blocked — don't crash, just reset
          btn.innerHTML = '&#9654;';
        });
    } else {
      audio.pause();
      currentlyPlaying = null;
      btn.innerHTML = '&#9654;';
    }
  });
});

// Reset play button when audio ends
document.querySelectorAll('.mix-player').forEach(audio => {
  audio.addEventListener('ended', () => {
    currentlyPlaying = null;
    const card = audio.closest('.mix-card');
    const btn = card ? card.querySelector('.mix-play-btn') : null;
    if (btn) btn.innerHTML = '&#9654;';
  });
});

// ===== Smooth reveal on scroll =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      // Stop observing after reveal — no need to keep watching
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
});

document.querySelectorAll('.mix-card, .stat, .contact-link').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  revealObserver.observe(el);
});
