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
let currentlyPlayingBtn = null;

// ===== Custom Winamp-style audio player =====
function formatTime(seconds) {
  if (isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
}

document.querySelectorAll('.mix-player').forEach(audio => {
  // Hide native player
  audio.style.display = 'none';
  audio.removeAttribute('controls');

  // Build custom player
  const player = document.createElement('div');
  player.classList.add('custom-player');

  player.innerHTML = `
    <div class="cp-controls">
      <button class="cp-play" aria-label="Play">&#9654;</button>
      <button class="cp-stop" aria-label="Stop">&#9632;</button>
    </div>
    <div class="cp-display">
      <div class="cp-time"><span class="cp-current">00:00</span> / <span class="cp-duration">00:00</span></div>
      <div class="cp-progress-bar">
        <div class="cp-progress"></div>
      </div>
    </div>
  `;

  audio.parentNode.insertBefore(player, audio.nextSibling);

  const playBtn = player.querySelector('.cp-play');
  const stopBtn = player.querySelector('.cp-stop');
  const progressBar = player.querySelector('.cp-progress-bar');
  const progress = player.querySelector('.cp-progress');
  const currentTime = player.querySelector('.cp-current');
  const duration = player.querySelector('.cp-duration');

  // Update duration when metadata loads
  audio.addEventListener('loadedmetadata', () => {
    duration.textContent = formatTime(audio.duration);
  });

  // Play/Pause
  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      // Pause other audio
      if (currentlyPlaying && currentlyPlaying !== audio) {
        currentlyPlaying.pause();
        if (currentlyPlayingBtn) currentlyPlayingBtn.innerHTML = '&#9654;';
        // Reset artwork play button
        const prevCard = currentlyPlaying.closest('.mix-card');
        const prevArtBtn = prevCard ? prevCard.querySelector('.mix-play-btn') : null;
        if (prevArtBtn) prevArtBtn.innerHTML = '&#9654;';
      }

      audio.play().then(() => {
        currentlyPlaying = audio;
        currentlyPlayingBtn = playBtn;
        playBtn.innerHTML = '&#10074;&#10074;';
        // Sync artwork play button
        const card = audio.closest('.mix-card');
        const artBtn = card ? card.querySelector('.mix-play-btn') : null;
        if (artBtn) artBtn.innerHTML = '&#10074;&#10074;';
      }).catch(() => {
        playBtn.innerHTML = '&#9654;';
      });
    } else {
      audio.pause();
      currentlyPlaying = null;
      currentlyPlayingBtn = null;
      playBtn.innerHTML = '&#9654;';
      const card = audio.closest('.mix-card');
      const artBtn = card ? card.querySelector('.mix-play-btn') : null;
      if (artBtn) artBtn.innerHTML = '&#9654;';
    }
  });

  // Stop
  stopBtn.addEventListener('click', () => {
    audio.pause();
    audio.currentTime = 0;
    currentlyPlaying = null;
    currentlyPlayingBtn = null;
    playBtn.innerHTML = '&#9654;';
    progress.style.width = '0%';
    currentTime.textContent = '00:00';
    const card = audio.closest('.mix-card');
    const artBtn = card ? card.querySelector('.mix-play-btn') : null;
    if (artBtn) artBtn.innerHTML = '&#9654;';
  });

  // Progress bar update
  audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
      const pct = (audio.currentTime / audio.duration) * 100;
      progress.style.width = pct + '%';
      currentTime.textContent = formatTime(audio.currentTime);
    }
  });

  // Click to seek
  progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audio.duration;
  });

  // Reset on end
  audio.addEventListener('ended', () => {
    currentlyPlaying = null;
    currentlyPlayingBtn = null;
    playBtn.innerHTML = '&#9654;';
    progress.style.width = '0%';
    currentTime.textContent = '00:00';
    const card = audio.closest('.mix-card');
    const artBtn = card ? card.querySelector('.mix-play-btn') : null;
    if (artBtn) artBtn.innerHTML = '&#9654;';
  });
});

// Artwork play button — sync with custom player
document.querySelectorAll('.mix-play-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.mix-card');
    const player = card.querySelector('.custom-player');
    if (player) {
      const playBtn = player.querySelector('.cp-play');
      playBtn.click();
    }
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

// If page loaded with a hash, skip animation for that element
const hashTarget = window.location.hash ? document.querySelector(window.location.hash) : null;

document.querySelectorAll('.mix-card, .stat, .contact-link, .gallery-item').forEach(el => {
  if (el === hashTarget) {
    // Don't hide the targeted element — let the browser scroll to it
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  } else {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    revealObserver.observe(el);
  }
});

// Scroll to hash after a short delay to ensure layout is ready
if (hashTarget) {
  setTimeout(() => {
    const navHeight = document.getElementById('navbar').offsetHeight;
    const targetTop = hashTarget.getBoundingClientRect().top + window.scrollY - navHeight - 20;
    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  }, 300);
}

// ===== Share button — copy direct link to clipboard =====
document.querySelectorAll('.share-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const mixId = btn.getAttribute('data-mix-id');
    const url = window.location.origin + window.location.pathname + '#' + mixId;

    navigator.clipboard.writeText(url).then(() => {
      btn.textContent = '✓ Link copied!';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.innerHTML = '&#128279; Share';
        btn.classList.remove('copied');
      }, 2000);
    }).catch(() => {
      // Fallback for older browsers
      btn.textContent = url;
      btn.classList.add('copied');
    });
  });
});
