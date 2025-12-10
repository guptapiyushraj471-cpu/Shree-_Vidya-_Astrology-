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
/* ----------------------------
   Shop, Cart, Events & Rashifal
   (Append to script.js)
   ---------------------------- */

/* --------- Sample products (edit or expand) ---------- */
const PRODUCTS = [
  { id: 'p1', name: 'Pooja Samagri Kit - Basic', price: 299, img: 'img/prod-puja-basic.jpg', desc: 'Basic pooja kit for daily worship.' },
  { id: 'p2', name: 'Hawan Samagri Pack', price: 799, img: 'img/prod-hawan.jpg', desc: 'Havan samagri with herbal samagri.' },
  { id: 'p3', name: 'Rudraksha Mala (8mm)', price: 1299, img: 'img/prod-rudraksha.jpg', desc: 'Authentic rudraksha mala.' },
  { id: 'p4', name: 'Yantra — Shree Yantra (Small)', price: 499, img: 'img/prod-yantra.jpg', desc: 'Blessed Shree Yantra for prosperity.' },
  { id: 'p5', name: 'Guide Book — Vedic Remedies', price: 399, img: 'img/prod-book.jpg', desc: 'Compact guide of remedies & rituals.' }
];

/* render products */
function renderProducts() {
  const el = document.getElementById('productList');
  if(!el) return;
  el.innerHTML = PRODUCTS.map(p => `
    <div class="product-card">
      <img src="${p.img}" alt="${p.name}">
      <div class="product-name">${p.name}</div>
      <div class="product-desc">${p.desc}</div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
        <div class="product-price">₹${p.price}</div>
        <div class="product-actions">
          <button class="btn btn-small" onclick="addToCart('${p.id}')">Add</button>
          <button class="btn btn-secondary btn-small" onclick="quickBuy('${p.id}')">Buy</button>
        </div>
      </div>
    </div>
  `).join('');
}

/* --------- Cart functionality --------- */
let CART = JSON.parse(localStorage.getItem('ssv_cart') || '[]');

function saveCart() { localStorage.setItem('ssv_cart', JSON.stringify(CART)); updateCartCount(); }
function updateCartCount(){ document.getElementById('cartCount').innerText = CART.reduce((s,i)=>s+i.qty,0); }

function addToCart(id){
  const prod = PRODUCTS.find(p=>p.id===id); if(!prod) return;
  const found = CART.find(c=>c.id===id);
  if(found) found.qty++;
  else CART.push({ id:prod.id, name:prod.name, price:prod.price, img:prod.img, qty:1 });
  saveCart();
  alert(`${prod.name} added to cart.`);
}

/* quick buy -> opens checkout with single product */
function quickBuy(id){
  CART = []; const p = PRODUCTS.find(x=>x.id===id);
  CART.push({ id:p.id, name:p.name, price:p.price, img:p.img, qty:1 });
  saveCart();
  openCheckout();
}

/* Open cart modal */
const cartModal = document.getElementById('cartModal');
const checkoutModal = document.getElementById('checkoutModal');
const orderModal = document.getElementById('orderModal');

document.getElementById('openCartBtn').addEventListener('click', openCart);
document.getElementById('closeCart').addEventListener('click', () => cartModal.style.display='none');
document.getElementById('closeCheckout').addEventListener('click', () => checkoutModal.style.display='none');
document.getElementById('closeOrder').addEventListener('click', () => orderModal.style.display='none');

function openCart(){
  renderCartItems();
  cartModal.style.display = 'flex';
}

function renderCartItems(){
  const el = document.getElementById('cartItems'); el.innerHTML = '';
  if(CART.length === 0) { el.innerHTML = '<p class="muted">Cart is empty.</p>'; document.getElementById('cartSubtotal').innerText='₹0'; document.getElementById('cartTotal').innerText='₹0'; return; }
  let subtotal = 0;
  CART.forEach(item => {
    subtotal += item.price * item.qty;
    el.insertAdjacentHTML('beforeend', `
      <div class="cart-item">
        <img class="ci-img" src="${item.img}" alt="${item.name}">
        <div class="ci-meta">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div><strong>${item.name}</strong><div style="font-size:13px;color:#666;">₹${item.price} x ${item.qty}</div></div>
            <div>
              <button class="btn btn-small" onclick="changeQty('${item.id}',1)">＋</button>
              <button class="btn btn-small" onclick="changeQty('${item.id}',-1)">−</button>
            </div>
          </div>
        </div>
      </div>
    `);
  });
  const shipping = subtotal > 1000 ? 0 : 50;
  document.getElementById('cartSubtotal').innerText = `₹${subtotal}`;
  document.getElementById('cartShipping').innerText = `₹${shipping}`;
  document.getElementById('cartTotal').innerText = `₹${subtotal + shipping}`;
}

function changeQty(id, delta){
  const item = CART.find(i=>i.id===id); if(!item) return;
  item.qty += delta;
  if(item.qty <= 0) CART = CART.filter(i=>i.id!==id);
  saveCart();
  renderCartItems();
}

/* clear cart */
document.getElementById('clearCartBtn').addEventListener('click', ()=>{ CART = []; saveCart(); renderCartItems(); });

/* proceed to checkout */
document.getElementById('checkoutBtn').addEventListener('click', openCheckout);
function openCheckout(){
  cartModal.style.display='none';
  checkoutModal.style.display='flex';
  // prefill subtotal in checkout if needed
}

/* checkout submission */
document.getElementById('checkoutForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  // simulate payment and create order
  const name = document.getElementById('custName').value || 'Customer';
  const phone = document.getElementById('custPhone').value || '';
  const email = document.getElementById('custEmail').value || '';
  const paymentMethod = document.getElementById('paymentMethod').value || 'upi';
  const address = document.getElementById('custAddress').value || '';

  const subtotal = CART.reduce((s,i)=>s + i.price*i.qty,0);
  const shipping = subtotal>1000?0:50;
  const total = subtotal + shipping;

  const orderId = 'SSV' + Date.now();
  const orderData = {
    orderId, name, phone, email, paymentMethod, address, items: CART, total
  };

  // clear cart
  CART = []; saveCart();
  checkoutModal.style.display='none';

  // show order modal
  document.getElementById('orderMsg').innerHTML = `
    Thank you <strong>${name}</strong>!<br>
    Your Order <strong>${orderId}</strong> has been placed.<br>
    Amount: <strong>₹${total}</strong><br>
    Payment method: <strong>${paymentMethod}</strong>
  `;
  // prepare mailto link (auto-reply simulation)
  const mailto = `mailto:${encodeURIComponent('shrishrividhyaastrology@gmail.com')}?subject=${encodeURIComponent('Order Confirmation - '+orderId)}&body=${encodeURIComponent(`Order ID: ${orderId}\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\nTotal: ₹${total}\n\nThank you for your order.`)}`;
  document.getElementById('mailtoSupport').setAttribute('href', mailto);

  // save last order to session for certificate
  sessionStorage.setItem('ssv_last_order', JSON.stringify(orderData));
  orderModal.style.display='flex';
});

/* Download printable consumer certificate (opens new window) */
document.getElementById('downloadCertBtn').addEventListener('click', ()=>{
  const order = JSON.parse(sessionStorage.getItem('ssv_last_order') || '{}');
  const html = `
    <html><head><title>Consumer Certificate - ${order.orderId || ''}</title>
    <style>body{font-family:Inter, sans-serif;padding:30px;} .head{color:#b8860b;font-weight:700;} .box{border:1px solid #ddd;padding:18px;border-radius:8px;}</style>
    </head><body>
      <div class="head">Shree Shree Vidya Astrology</div>
      <h3>Consumer Certificate</h3>
      <div class="box">
        <p><strong>Order ID:</strong> ${order.orderId || 'N/A'}</p>
        <p><strong>Name:</strong> ${order.name || 'N/A'}</p>
        <p><strong>Phone:</strong> ${order.phone || 'N/A'}</p>
        <p><strong>Email:</strong> ${order.email || 'N/A'}</p>
        <p><strong>Amount Paid:</strong> ₹${order.total || '0'}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        <p>This is to certify that the above services/products were provided/ booked through Shree Shree Vidya Astrology. For query contact: shrishrividhyaastrology@gmail.com</p>
      </div>
      <p>Authorized Signatory: ____________________</p>
    </body></html>
  `;
  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
});

/* ------- Simple events list (editable) ------- */
const EVENTS = [
  { title: 'Navagraha Puja — Live Stream', date: '2026-01-12', time: '7:00 AM', mode:'Online', booking:'#contact' },
  { title: 'Satyanarayan Katha — Temple Event', date: '2026-01-25', time: '6:30 PM', mode:'Offline', booking:'#contact' },
  { title: 'Grah Shanti — Home Visit', date: '2026-02-05', time: '10:00 AM', mode:'Offline', booking:'#contact' }
];
function renderEvents(){
  const el = document.getElementById('eventsList'); if(!el) return;
  el.innerHTML = EVENTS.map(ev => `
    <div class="event-card">
      <div class="event-date">${ev.date} • ${ev.time}</div>
      <h4>${ev.title}</h4>
      <p style="margin:6px 0;">Mode: <strong>${ev.mode}</strong></p>
      <a href="${ev.booking}" class="btn btn-primary">Book / Enquire</a>
    </div>
  `).join('');
}

/* ------- Rashifal data (sample) ------- */
const RASHIFAL = {
  Aries: { summary: 'This month brings renewed energy for career. Focus on communication.', remedy: 'Light a ghee lamp on Tuesday; chant Hanuman Chalisa.' },
  Taurus: { summary: 'Stability in finance, but avoid impulsive spending.', remedy: 'Offer white flowers on Saturday; chant Shani mantra.' },
  // add other signs...
  Pisces: { summary: 'Creative surge and emotional healing. Trust intuition.', remedy: 'Wear a pearl advised by Acharya after consultation.' }
};
function showRashifal(sign){
  const out = document.getElementById('rashifalOutput');
  if(!sign || !RASHIFAL[sign]) { out.innerHTML = '<p class="muted">Forecast not available for this sign yet.</p>'; return; }
  out.innerHTML = `
    <h4>${sign} — Monthly Forecast</h4>
    <p>${RASHIFAL[sign].summary}</p>
    <p><strong>Remedy:</strong> ${RASHIFAL[sign].remedy}</p>
    <a href="#contact" class="btn btn-primary">Book Personal Consultation</a>
  `;
}

/* ---------- Init on load ---------- */
document.addEventListener('DOMContentLoaded', ()=>{
  renderProducts();
  updateCartCount();
  renderEvents();

  const rashSelect = document.getElementById('rashifalSelect');
  if(rashSelect) rashSelect.addEventListener('change', (e)=> showRashifal(e.target.value));

  // close modals on outside click
  document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', (ev)=> { if(ev.target === m) m.style.display='none'; }));
});
const ADMIN_KEY = prompt('Enter admin key:'); // recommended: prompt at runtime; don't hardcode
const res = await fetch('/api/admin/bookings', {
  headers: { 'Authorization': `Bearer ${ADMIN_KEY}` }
});
const json = await res.json();
console.log(json.rows);
