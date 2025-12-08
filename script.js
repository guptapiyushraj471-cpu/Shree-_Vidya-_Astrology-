// =======================
// Google Translate init
// =======================
function googleTranslateElementInit() {
  new google.translate.TranslateElement(
    {
      pageLanguage: 'en',
      includedLanguages: 'en,hi',
      layout: google.translate.TranslateElement.InlineLayout.SIMPLE
    },
    'google_translate_element'
  );
}

// =======================
// Theme Toggle
// =======================
function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const btn = document.querySelector('.theme-toggle');
  if (btn) {
    btn.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
  }
}

// =======================
// Mobile Menu Toggle
// =======================
function toggleMenu() {
  document.getElementById('navMenu')?.classList.toggle('active');
}

// =======================
// AstroBot Toggle + Chat
// =======================
function toggleAstroBot() {
  document.getElementById('astrobotChat')?.classList.toggle('active');
}

function sendBotMessage() {
  const input = document.getElementById('botInput');
  const messages = document.getElementById('botMessages');
  if (!input || !messages) return;

  if (input.value.trim()) {
    const userMsg = document.createElement('div');
    userMsg.className = 'astrobot-message user';
    userMsg.textContent = input.value;
    messages.appendChild(userMsg);

    setTimeout(() => {
      const botMsg = document.createElement('div');
      botMsg.className = 'astrobot-message bot';
      botMsg.textContent =
        'Thank you for your question! Please call +91-XXXXX-XXXXX or book an appointment for detailed consultation.';
      messages.appendChild(botMsg);
      messages.scrollTop = messages.scrollHeight;
    }, 1000);

    input.value = '';
    messages.scrollTop = messages.scrollHeight;
  }
}

document.getElementById('botInput')?.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') sendBotMessage();
});

// =======================
// Testimonials Slider
// =======================
const testimonials = [
  {
    rating: '★★★★★',
    text: "Acharya Shubham ji's predictions were incredibly accurate. His Vastu suggestions transformed my office energy and business growth followed within months!",
    author: '- Rajesh Kumar, Delhi'
  },
  {
    rating: '★★★★★',
    text: 'The Kundali matching service was thorough and helped us make the right decision. Very grateful for the detailed analysis and guidance!',
    author: '- Priya Sharma, Mumbai'
  },
  {
    rating: '★★★★★',
    text: "Numerology reading changed my perspective on life. Highly recommend Acharya ji's services for anyone seeking clarity and direction.",
    author: '- Amit Verma, Bangalore'
  }
];

let currentTestimonial = 0;

function changeTestimonial(index) {
  currentTestimonial = index;
  const testimonial = document.getElementById('testimonial');
  if (!testimonial) return;

  const t = testimonials[index];
  testimonial.innerHTML = `
    <div class="testimonial-rating">${t.rating}</div>
    <p class="testimonial-text">${t.text}</p>
    <div class="testimonial-author">${t.author}</div>
  `;
  document.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

// Auto-rotate testimonials
setInterval(() => {
  currentTestimonial = (currentTestimonial + 1) % testimonials.length;
  changeTestimonial(currentTestimonial);
}, 5000);

// =======================
// Horoscope Click
// =======================
function showHoroscope(sign) {
  alert(
    `${sign} Daily Horoscope:\n\nToday is a favorable day for new beginnings. Focus on career opportunities and maintain positive relationships. Lucky color: Gold. Lucky number: 7.\n\nFor detailed personal predictions, book a consultation!`
  );
}

// =======================
// Contact Form
// =======================
document.getElementById('contactForm')?.addEventListener('submit', function (e) {
  e.preventDefault();
  alert(
    'Thank you for your booking request! We will contact you within 24 hours to confirm your appointment.'
  );
  this.reset();
});

// =======================
// Footer year
// =======================
const yearSpan = document.getElementById('year');
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// =======================
// Smooth scroll
// =======================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      if (window.innerWidth <= 768) {
        document.getElementById('navMenu')?.classList.remove('active');
      }
    }
  });
});

// =======================
// Fade-in animation on scroll
// =======================
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function (entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

document.querySelectorAll('.card, .zodiac-card, .testimonial').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'all 0.6s ease-out';
  observer.observe(el);
});

// =======================
// INTRO VIDEO PLAYLIST
// (5 videos – auto play + auto change)
// =======================
const introVideo = document.getElementById('introVideo');

if (introVideo) {
  const videoPlaylist = [
    'videos/video1.mp4',
    'videos/video2.mp4',
    'videos/video3.mp4',
    'videos/video4.mp4',
    'videos/video5.mp4'
  ];

  let introIndex = 0;

  function loadIntroVideo(index) {
    introIndex = index % videoPlaylist.length;
    introVideo.src = videoPlaylist[introIndex];
    introVideo.load();
    introVideo.play().catch(() => {
      // Autoplay blocked – user click se play ho jayega
    });
  }

  // Jab ek video khatam ho, next start
  introVideo.addEventListener('ended', () => {
    loadIntroVideo(introIndex + 1);
  });

  // First video start
  loadIntroVideo(0);
}

// =======================
// ABOUT SECTION SLIDER
// (5 images auto 2 sec)
// =======================
const aboutSlides = document.querySelectorAll('.about-slide');

if (aboutSlides.length > 0) {
  let aboutIndex = 0;

  function showAboutSlide(index) {
    aboutSlides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
  }

  function nextAboutSlide() {
    aboutIndex = (aboutIndex + 1) % aboutSlides.length;
    showAboutSlide(aboutIndex);
  }

  // start with first slide
  showAboutSlide(aboutIndex);

  // change every 2 seconds
  setInterval(nextAboutSlide, 2000);
}
