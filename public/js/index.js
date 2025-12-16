/* public/js/index.js
   Utility script for navigation, theme, modals, small widgets and AJAX booking from the existing HTML.
   Drop this file into public/js/index.js
*/

(function () {
  'use strict';

  // ----- NAV / MOBILE -----
  window.toggleMenu = function toggleMenu() {
    const menu = document.getElementById('navMenu');
    const toggler = document.querySelector('.mobile-toggle');
    if (!menu) return;
    menu.classList.toggle('open');
    if (toggler) toggler.classList.toggle('open');
  };

  // ----- THEME -----
  window.toggleTheme = function toggleTheme() {
    const root = document.documentElement;
    const current = root.getAttribute('data-theme') || localStorage.getItem('site-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('site-theme', next);
  };

  // Apply stored theme on load
  (function applySavedTheme(){
    const saved = localStorage.getItem('site-theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
  })();

  // ----- Google Translate init (global callback used by your script include) -----
  window.googleTranslateElementInit = function googleTranslateElementInit() {
    try {
      /* eslint-disable no-undef */
      new google.translate.TranslateElement({ pageLanguage: 'en' }, 'google_translate_element');
      /* eslint-enable no-undef */
    } catch (e) {
      // ignore - library may not have loaded
      // console.warn('Google translate init failed', e);
    }
  };

  // ----- Open view page for zodiac/service -----
  window.openViewPage = function openViewPage(sign) {
    if (!sign) return;
    const url = 'view.html?sign=' + encodeURIComponent(sign);
    window.location.href = url;
  };

  // ----- Testimonial slider helper -----
  const testimonials = [
    { text: `"Acharya Shubham ji's predictions were incredibly accurate. His Vastu suggestions transformed my office energy and business growth followed within months!"`, author: '- Rajesh Kumar, Delhi', rating: '★★★★★' },
    { text: `"Amazing experience — very clear remedies and instant results. Highly recommended."`, author: '- Meera S., Indore', rating: '★★★★★' },
    { text: `"Very compassionate and precise reading. Helped me choose the right career direction."`, author: '- Anil K., Bhopal', rating: '★★★★★' }
  ];
  window.changeTestimonial = function changeTestimonial(i) {
    const idx = Math.max(0, Math.min(testimonials.length - 1, Number(i) || 0));
    const t = testimonials[idx];
    const el = document.getElementById('testimonial');
    if (!el) return;
    el.innerHTML = `<div class="testimonial-rating">${t.rating}</div>
                    <p class="testimonial-text">${t.text}</p>
                    <div class="testimonial-author">${t.author}</div>`;
    // update dots active states
    const dots = document.querySelectorAll('.slider-dots .dot');
    dots.forEach((d, j) => d.classList.toggle('active', j === idx));
  };

  // Initialize first testimonial if present
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('testimonial')) changeTestimonial(0);
    // set year in footer
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  });

  // ----- AstroBot (very small local bot) -----
  function createBotMessage(text) {
    const wrap = document.createElement('div');
    wrap.className = 'astrobot-message bot';
    wrap.textContent = text;
    return wrap;
  }
  function createUserMessage(text) {
    const wrap = document.createElement('div');
    wrap.className = 'astrobot-message user';
    wrap.textContent = text;
    return wrap;
  }

  window.toggleAstroBot = function toggleAstroBot() {
    const chat = document.getElementById('astrobotChat');
    if (!chat) return;
    chat.style.display = (chat.style.display === 'block') ? 'none' : 'block';
  };

  window.sendBotMessage = async function sendBotMessage() {
    const input = document.getElementById('botInput');
    const box = document.getElementById('botMessages');
    if (!input || !box) return;
    const text = input.value && input.value.trim();
    if (!text) return;
    box.appendChild(createUserMessage(text));
    input.value = '';
    // naive bot: simple canned replies
    const reply = await new Promise(resolve => {
      setTimeout(() => {
        if (/book|appointment|book(ing)?/i.test(text)) resolve('To book a consultation please use the form on the Contact section or call +91 72238 79166.');
        else if (/price|cost|fee|charge/i.test(text)) resolve('Service prices are shown on each service card. For custom queries please contact +91 72238 79166.');
        else resolve("Namaste — I can help with booking, service info, or directions. For deeper queries please write to shrishrividhyaastrology@gmail.com.");
      }, 600);
    });
    box.appendChild(createBotMessage(reply));
    box.scrollTop = box.scrollHeight;
  };

  // ----- Modal: service details -----
  function showElement(el) { if (!el) return; el.style.display = 'block'; el.setAttribute('aria-hidden', 'false'); }
  function hideElement(el) { if (!el) return; el.style.display = 'none'; el.setAttribute('aria-hidden', 'true'); }

  window.openServiceDetails = function openServiceDetails(id) {
    const svcMap = {
      kundali: { title: 'Kundali Analysis', desc: 'Complete birth chart reading...', price: '₹2,100', duration: '45 mins' },
      vastu: { title: 'Vastu Consultation', desc: 'Home & office Vastu analysis...', price: '₹3,500', duration: '60 mins' },
      numerology: { title: 'Numerology Reading', desc: 'Name & number analysis...', price: '₹1,500', duration: '30 mins' },
      matchmaking: { title: 'Matchmaking', desc: 'Compatibility analysis for marriage...', price: '₹2,500', duration: '45 mins' },
      tarot: { title: 'Tarot Reading', desc: 'Intuitive card reading...', price: '₹1,200', duration: '30 mins' },
      muhurat: { title: 'Muhurat Selection', desc: 'Auspicious timing for events...', price: '₹1,800', duration: '30 mins' }
    };
    const info = svcMap[id] || { title: 'Service', desc: '', price: '—', duration: '—' };
    const modal = document.getElementById('svcModal');
    if (!modal) return;
    const t = document.getElementById('svcTitle');
    const d = document.getElementById('svcDesc');
    const p = document.getElementById('svcPrice');
    const dur = document.getElementById('svcDuration');
    if (t) t.textContent = info.title;
    if (d) d.textContent = info.desc;
    if (p) p.textContent = info.price;
    if (dur) dur.textContent = info.duration;
    // set booking anchor to fill service param
    const bookBtn = document.getElementById('modalBookBtn');
    if (bookBtn) bookBtn.setAttribute('href', '#contact');
    showElement(modal);
  };

  window.closeServiceModal = function closeServiceModal() {
    const modal = document.getElementById('svcModal');
    hideElement(modal);
  };

  // Close modal when clicking outside inner area
  document.addEventListener('click', (ev) => {
    const modal = document.getElementById('svcModal');
    if (!modal || modal.style.display !== 'block') return;
    const inner = modal.querySelector('.modal-inner');
    if (inner && !inner.contains(ev.target)) hideElement(modal);
  });

  // small helper to show rashifal in modal
  window.showModalRashifal = function showModalRashifal(sign) {
    const el = document.getElementById('modalRashifal');
    if (!el) return;
    if (!sign) el.textContent = 'Select a zodiac to view the rashifal here.';
    else el.textContent = `${sign} — Today: Follow basic precautions, stay calm, and focus on communication. (Sample content)`;
  };

  // ----- Contact form submit -> POST /api/book -----
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const name = (document.getElementById('name') || {}).value || '';
      const phone = (document.getElementById('phone') || {}).value || '';
      const service = (document.getElementById('service') || {}).value || '';
      const message = (document.getElementById('message') || {}).value || '';
      const payload = { name, phone, service, message };
      try {
        const resp = await fetch('/api/book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!resp.ok) {
          const txt = await resp.text().catch(()=>null);
          throw new Error('Booking failed: ' + (txt || resp.status));
        }
        const j = await resp.json().catch(()=>({}));
        alert('Booked successfully. Ref: ' + (j.id || 'n/a'));
        contactForm.reset();
      } catch (err) {
        console.error(err);
        alert('Could not submit booking: ' + (err.message || err));
      }
    });
  }

  // ----- Simple product/cart placeholders (shop) -----
  const products = [
    { id: 'p1', title: 'Puja Kit Basic', price: 199 },
    { id: 'p2', title: 'Yantra Set', price: 399 },
    { id: 'p3', title: 'Ritual Mala', price: 299 }
  ];

  function renderProducts() {
    const list = document.getElementById('productList');
    if (!list) return;
    list.innerHTML = '';
    products.forEach(p=>{
      const card = document.createElement('div');
      card.className = 'product-card card';
      card.innerHTML = `<h4>${p.title}</h4><div>₹${p.price}</div><div style="margin-top:8px"><button class="btn btn-primary add-to-cart" data-id="${p.id}">Add</button></div>`;
      list.appendChild(card);
    });
    // add handlers
    document.querySelectorAll('.add-to-cart').forEach(btn=>{
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        addToCart(id);
      });
    });
  }

  const CART_KEY = 'site_cart_v1';
  function getCart() { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
  function saveCart(c) { localStorage.setItem(CART_KEY, JSON.stringify(c)); updateCartUI(); }
  function addToCart(id){
    const pr = products.find(p => p.id === id);
    if (!pr) return;
    const cart = getCart();
    const existing = cart.find(i=>i.id===id);
    if (existing) existing.qty++;
    else cart.push({ id: pr.id, title: pr.title, price: pr.price, qty: 1 });
    saveCart(cart);
    alert('Added to cart: ' + pr.title);
  }
  function updateCartUI(){
    const cart = getCart();
    const count = cart.reduce((s,i)=>s+i.qty,0);
    const el = document.getElementById('cartCount');
    if (el) el.textContent = count;
  }

  // Cart modal handlers (open/close)
  const openCartBtn = document.getElementById('openCartBtn');
  const cartModal = document.getElementById('cartModal');
  if (openCartBtn && cartModal) {
    openCartBtn.addEventListener('click', () => {
      const items = document.getElementById('cartItems');
      const cart = getCart();
      if (items) {
        items.innerHTML = cart.length ? cart.map(it=>`<div style="margin-bottom:8px"><strong>${it.title}</strong> x ${it.qty} — ₹${it.price}</div>`).join('') : '<div>No items</div>';
      }
      cartModal.style.display = 'block';
    });
    document.getElementById('closeCart')?.addEventListener('click', ()=>cartModal.style.display='none');
    document.getElementById('clearCartBtn')?.addEventListener('click', ()=>{ localStorage.removeItem(CART_KEY); updateCartUI(); alert('Cart cleared'); });
  }

  // Checkout form basic handler (simulate payment)
  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      // For demo simulate success
      const orderModal = document.getElementById('orderModal');
      const msg = document.getElementById('orderMsg');
      msg.textContent = 'Thank you — your order has been placed. We will contact you shortly.';
      if (orderModal) showElement(orderModal);
      // clear cart
      localStorage.removeItem(CART_KEY);
      updateCartUI();
      // close checkout
      document.getElementById('closeCheckout')?.click();
    });
    document.getElementById('closeCheckout')?.addEventListener('click', ()=>{ document.getElementById('checkoutModal').style.display='none'; });
    document.getElementById('closeOrder')?.addEventListener('click', ()=>{ hideElement(document.getElementById('orderModal')); });
  }

  // initial render
  document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCartUI();
  });

})();
