document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================================================
  // 1. Countdown Timer
  // ==========================================================================
  const weddingDate = new Date('October 17, 2026 16:00:00').getTime();
  
  function updateCountdown() {
    const now = new Date().getTime();
    const distance = weddingDate - now;
    
    if (distance < 0) {
      document.getElementById('countdown').innerHTML = `<div class="wedding-started">The Celebration Has Begun!</div>`;
      return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    document.getElementById('days').innerText = String(days).padStart(2, '0');
    document.getElementById('hours').innerText = String(hours).padStart(2, '0');
    document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
    document.getElementById('seconds').innerText = String(seconds).padStart(2, '0');
  }
  
  // Initial run and repeat every second
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ==========================================================================
  // 2. Scroll Reveal Animations (Intersection Observer)
  // ==========================================================================
  const revealElements = document.querySelectorAll('.scroll-reveal');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target); // Trigger once
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });
  
  revealElements.forEach(element => {
    revealObserver.observe(element);
  });

  // ==========================================================================
  // 3. Navigation Bar Scroll Effects & Mobile Menu
  // ==========================================================================
  const navbar = document.getElementById('navbar');
  const navMobileToggle = document.getElementById('navMobileToggle');
  const navLinksContainer = document.querySelector('.nav-links');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section, header');

  // Sticky navbar style on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    
    // Highlight Active Navbar Links
    let currentSectionId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop - 150) {
        currentSectionId = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  });

  // Toggle Mobile Navigation Menu
  navMobileToggle.addEventListener('click', () => {
    navLinksContainer.classList.toggle('active');
    const icon = navMobileToggle.querySelector('i');
    if (navLinksContainer.classList.contains('active')) {
      icon.className = 'fas fa-times';
    } else {
      icon.className = 'fas fa-bars';
    }
  });

  // Close Mobile Menu on link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinksContainer.classList.remove('active');
      navMobileToggle.querySelector('i').className = 'fas fa-bars';
    });
  });

  // ==========================================================================
  // 4. Background Music Widget
  // ==========================================================================
  const musicWidget = document.getElementById('musicWidget');
  const musicToggle = document.getElementById('musicToggle');
  const bgMusic = document.getElementById('bgMusic');
  
  // Set low volume for background ambient effect
  bgMusic.volume = 0.25;

  function playMusic() {
    bgMusic.play().then(() => {
      musicWidget.classList.add('playing');
      localStorage.setItem('weddingMusicState', 'playing');
    }).catch(err => {
      console.log('Audio autoplay prevented. Awaiting user interaction.');
      musicWidget.classList.remove('playing');
    });
  }

  function pauseMusic() {
    bgMusic.pause();
    musicWidget.classList.remove('playing');
    localStorage.setItem('weddingMusicState', 'paused');
  }

  musicToggle.addEventListener('click', () => {
    if (bgMusic.paused) {
      playMusic();
    } else {
      pauseMusic();
    }
  });

  // Try to play automatically if user had it running last session
  const storedState = localStorage.getItem('weddingMusicState');
  if (storedState === 'playing') {
    // We attempt to play, but browser policy may block it until user clicks anywhere
    playMusic();
  }

  // Play on first interaction with the body (if not explicitly paused before)
  const startAudioOnInteraction = () => {
    if (storedState !== 'paused' && bgMusic.paused) {
      playMusic();
    }
    document.removeEventListener('click', startAudioOnInteraction);
    document.removeEventListener('scroll', startAudioOnInteraction);
  };
  document.addEventListener('click', startAudioOnInteraction);
  document.addEventListener('scroll', startAudioOnInteraction);

  // ==========================================================================
  // 5. RSVP Form Interaction & LocalStorage
  // ==========================================================================
  const rsvpForm = document.getElementById('rsvpForm');
  const attendanceRadios = document.querySelectorAll('input[name="attendance"]');
  const attendanceDetails = document.getElementById('attendanceDetails');
  const rsvpSuccess = document.getElementById('rsvpSuccess');
  const resetRsvpBtn = document.getElementById('resetRsvp');
  const successMessage = document.getElementById('successMessage');

  // Toggle guest details based on attendance
  attendanceRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'declined') {
        attendanceDetails.classList.add('hidden');
        document.getElementById('guestsCount').removeAttribute('required');
      } else {
        attendanceDetails.classList.remove('hidden');
      }
    });
  });

  // Check if RSVP exists in LocalStorage on page load
  const existingRsvp = localStorage.getItem('weddingRsvp');
  if (existingRsvp) {
    const data = JSON.parse(existingRsvp);
    showSuccessState(data.name, data.attendance);
  }

  // Form submission handler
  rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(rsvpForm);
    const rsvpData = {
      name: formData.get('name'),
      email: formData.get('email'),
      attendance: formData.get('attendance'),
      guests: formData.get('attendance') === 'attending' ? formData.get('guests') : 0,
      dietary: formData.get('attendance') === 'attending' ? formData.get('dietary') : '',
      wishes: formData.get('wishes'),
      dateSubmitted: new Date().toISOString()
    };

    // Save locally
    localStorage.setItem('weddingRsvp', JSON.stringify(rsvpData));
    
    // Animate transition to success
    showSuccessState(rsvpData.name, rsvpData.attendance);
  });

  function showSuccessState(name, attendance) {
    if (attendance === 'attending') {
      successMessage.innerHTML = `<strong>Dear ${name}</strong>,<br>We are absolutely thrilled that you will join us to celebrate our Nikkah & Valima! See you in Tuscany!`;
    } else {
      successMessage.innerHTML = `<strong>Dear ${name}</strong>,<br>We are sorry you can't make it, but we appreciate you letting us know. You will be missed!`;
    }
    rsvpSuccess.classList.add('active');
  }

  // Reset RSVP form to edit
  resetRsvpBtn.addEventListener('click', () => {
    localStorage.removeItem('weddingRsvp');
    rsvpForm.reset();
    attendanceDetails.classList.remove('hidden');
    rsvpSuccess.classList.remove('active');
  });

  // ==========================================================================
  // 6. Photo Gallery Lightbox
  // ==========================================================================
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  
  let currentImageIndex = 0;
  
  // Get all gallery image sources and captions
  const imagesData = Array.from(galleryItems).map(item => {
    const img = item.querySelector('img');
    return {
      src: img.src,
      alt: img.alt
    };
  });

  function openLightbox(index) {
    currentImageIndex = index;
    updateLightboxImage();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Stop background scrolling
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; // Restore background scrolling
  }

  function updateLightboxImage() {
    const { src, alt } = imagesData[currentImageIndex];
    lightboxImg.src = src;
    lightboxCaption.textContent = alt;
  }

  function showNextImage() {
    currentImageIndex = (currentImageIndex + 1) % imagesData.length;
    updateLightboxImage();
  }

  function showPrevImage() {
    currentImageIndex = (currentImageIndex - 1 + imagesData.length) % imagesData.length;
    updateLightboxImage();
  }

  // Attach gallery item event listeners
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const index = parseInt(item.getAttribute('data-index'), 10);
      openLightbox(index);
    });
  });

  // Lightbox navigation triggers
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxNext.addEventListener('click', showNextImage);
  lightboxPrev.addEventListener('click', showPrevImage);

  // Click outside image to close
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowRight') {
      showNextImage();
    } else if (e.key === 'ArrowLeft') {
      showPrevImage();
    }
  });
});
