// ═══════════════════════════════════════════════════════════════
//  CK Fashion Store — CRO-Optimised JS
//  Features: Cart · Countdown · Live Activity · FAQ · Urgency
// ═══════════════════════════════════════════════════════════════
'use strict';

/* ── PRODUCT CATALOGUE ──────────────────────────────────────── */
const PRODUCTS = [
  { id:1, name:'CK Linen Check Shirt', variant:'Red Check',   cat:'checks', price:999,  orig:1799, img:'images/shirt_red.webp',   badge:'new',  isNew:true,  isBest:true,  stock:5  },
  { id:2, name:'CK Linen Check Shirt', variant:'Navy Check',  cat:'checks', price:999,  orig:1799, img:'images/shirt_navy.webp',  badge:'hot',  isNew:true,  isBest:true,  stock:8  },
  { id:3, name:'CK Linen Check Shirt', variant:'Brown Check', cat:'checks', price:999,  orig:1799, img:'images/shirt_brown.webp', badge:'new',  isNew:true,  isBest:false, stock:12 },
  { id:4, name:'3-Colour Pack',        variant:'All Colours', cat:'linen',  price:2499, orig:5399, img:'images/shirt_all.webp',   badge:'sale', isNew:false, isBest:true,  stock:3  },
];

/* ── STATE ───────────────────────────────────────────────────── */
let cart          = [];
let activeFilter  = 'all';
let viewerCount   = Math.floor(Math.random() * 12) + 18; // 18–30

/* ── HELPERS ─────────────────────────────────────────────────── */
const $   = id  => document.getElementById(id);
const fmt = n   => '₹' + n.toLocaleString('en-IN');
const pct = p   => Math.round((1 - p.price / p.orig) * 100);

function setText(id, v) {
  const el = $(id);
  if (el) el.textContent = v;
}

/* ── CARD HTML ───────────────────────────────────────────────── */
function cardHTML(p) {
  const badge  = p.badge
    ? `<span class="product-badge badge-${p.badge}">${p.badge}</span>` : '';
  const isFast = p.stock <= 5
    ? `<div class="product-selling-fast">🔥 Only ${p.stock} left!</div>` : '';

  return `
<div class="product-card" onclick="showPage('product')">
  <div class="product-card-img-wrap">
    <img class="product-card-img" src="${p.img}" alt="${p.name} — ${p.variant}" loading="lazy" width="400" height="533">
    ${badge}
    ${isFast}
    <button class="product-wish" aria-label="Wishlist">♡</button>
    <div class="product-card-overlay">
      <button class="product-card-quick" onclick="event.stopPropagation();quickAdd(${p.id})">
        Quick Add to Cart
      </button>
    </div>
  </div>
  <div class="product-card-cat">${p.cat}</div>
  <div class="product-card-name">${p.name} — ${p.variant}</div>
  <div class="product-card-price">
    <span class="price-now">${fmt(p.price)}</span>
    <span class="price-was">${fmt(p.orig)}</span>
    <span class="price-save">Save ${pct(p)}%</span>
  </div>
</div>`;
}

/* ── RENDER GRIDS ────────────────────────────────────────────── */
function renderGrids() {
  const el = id => $(id);
  const newArr  = PRODUCTS.filter(p => p.isNew);
  const best    = PRODUCTS.filter(p => p.isBest);
  const filtered = activeFilter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.cat === activeFilter);

  if (el('newArrivalsGrid'))  el('newArrivalsGrid').innerHTML  = newArr.map(cardHTML).join('');
  if (el('bestSellersGrid'))  el('bestSellersGrid').innerHTML  = best.map(cardHTML).join('');
  if (el('shopGrid'))         el('shopGrid').innerHTML         = filtered.length
    ? filtered.map(cardHTML).join('')
    : '<div style="grid-column:1/-1;text-align:center;padding:60px;color:#888">No products in this category yet.</div>';
}

/* ── FILTER ──────────────────────────────────────────────────── */
function filterProducts(cat, btn) {
  activeFilter = cat;
  document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderGrids();
}

/* ── CART — ADD ──────────────────────────────────────────────── */
function quickAdd(id) {
  const p  = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const ex = cart.find(x => x.id === id);
  ex ? ex.qty++ : cart.push({ ...p, size: 'M', qty: 1 });
  toast('✓ Added to cart');
  renderCart();
}

function addToCart() {
  const size   = document.querySelector('.size-btn.active')?.textContent || 'M';
  const color  = $('selectedColor')?.textContent || 'Red Check';
  const map    = { 'Red Check':1, 'Navy Check':2, 'Brown Check':3 };
  const p      = PRODUCTS.find(x => x.id === (map[color] || 1));
  if (!p) return;
  const ex = cart.find(x => x.id === p.id && x.size === size);
  ex ? ex.qty++ : cart.push({ ...p, size, qty: 1 });
  toast('✓ Added to cart');
  renderCart();
  openCart();
}

/* ── CART — QTY / REMOVE ─────────────────────────────────────── */
function updateQty(id, size, delta) {
  const i = cart.findIndex(x => x.id === id && x.size === size);
  if (i < 0) return;
  cart[i].qty = Math.max(0, cart[i].qty + delta);
  if (!cart[i].qty) cart.splice(i, 1);
  renderCart();
}

function removeItem(id, size) {
  cart = cart.filter(x => !(x.id === id && x.size === size));
  renderCart();
}

/* ── CART — RENDER ───────────────────────────────────────────── */
function renderCart() {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  /* badge */
  $('cartCount').textContent = count;

  /* drawer items */
  const list = $('cartItemsList');
  if (list) {
    list.innerHTML = cart.length
      ? cart.map(item => `
        <div class="cart-item">
          <img src="${item.img}" class="cart-item-img" alt="${item.name}" loading="lazy" width="80" height="100">
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name} — ${item.variant}</div>
            <div class="cart-item-meta">Size: ${item.size}</div>
            <div class="cart-item-controls">
              <button class="qty-btn" onclick="updateQty(${item.id},'${item.size}',-1)">−</button>
              <span class="qty-num">${item.qty}</span>
              <button class="qty-btn" onclick="updateQty(${item.id},'${item.size}',1)">+</button>
              <span class="cart-item-price">${fmt(item.price * item.qty)}</span>
            </div>
            <button class="cart-item-remove" onclick="removeItem(${item.id},'${item.size}')">Remove</button>
          </div>
        </div>`).join('')
      : `<div class="cart-empty">
           <div class="cart-empty-icon">🛒</div>
           <div class="cart-empty-text">Your bag is empty</div>
           <button class="btn btn-outline" style="margin-top:16px" onclick="closeCart();showPage('shop')">Explore Products</button>
         </div>`;
  }

  /* totals everywhere */
  const fmtTotal = fmt(total);
  ['cartSubtotal','cartGrandTotal','checkoutSub','checkoutTotal'].forEach(id => setText(id, fmtTotal));

  /* checkout items */
  const ci = $('checkoutItems');
  if (ci) {
    ci.innerHTML = cart.length
      ? cart.map(i => `
        <div class="order-item">
          <img src="${i.img}" class="order-item-img" loading="lazy" width="64" height="80" alt="${i.name}">
          <div style="flex:1">
            <div class="order-item-name">${i.name} — ${i.variant}</div>
            <div class="order-item-meta">Size: ${i.size} · Qty: ${i.qty}</div>
          </div>
          <div class="order-item-price">${fmt(i.price * i.qty)}</div>
        </div>`).join('')
      : '<div style="color:#888;font-size:13px">No items in cart.</div>';
  }
}

/* ── CART DRAWER ─────────────────────────────────────────────── */
function openCart() {
  $('cartOverlay').classList.add('open');
  $('cartDrawer').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  $('cartOverlay').classList.remove('open');
  $('cartDrawer').classList.remove('open');
  document.body.style.overflow = '';
}

/* ── PAGE NAVIGATION ─────────────────────────────────────────── */
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = $('page-' + name);
  if (el) el.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  renderCart();
}

function setNavActive(el) {
  document.querySelectorAll('.navbar-links a').forEach(a => a.classList.remove('active'));
  el.classList.add('active');
}

function scrollToId(id) {
  showPage('home');
  setTimeout(() => $(id)?.scrollIntoView({ behavior: 'smooth' }), 120);
}

/* ── GALLERY ─────────────────────────────────────────────────── */
function switchGallery(thumb, src) {
  $('mainGalleryImg').src = src;
  document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
  thumb.classList.add('active');
}

function selectColour(swatch, name, imgSrc) {
  document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
  swatch.classList.add('active');
  setText('selectedColour', name);
  $('mainGalleryImg').src = imgSrc;
}

function selectSize(btn) {
  if (btn.classList.contains('out')) return;
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

/* ── FAQ ACCORDION ───────────────────────────────────────────── */
function toggleFAQ(btn) {
  const item = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

/* ── MOBILE MENU ─────────────────────────────────────────────── */
function toggleMenu() {
  $('mobileNav').classList.toggle('open');
}

/* ── CHECKOUT ────────────────────────────────────────────────── */
function selectPayment(label) {
  document.querySelectorAll('.payment-opt').forEach(m => m.classList.remove('active'));
  label.classList.add('active');
}

function placeOrder() {
  cart = [];
  renderCart();
  showPage('success');
}

/* ── TOAST ───────────────────────────────────────────────────── */
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('visible');
  setTimeout(() => t.classList.remove('visible'), 2600);
}

/* ── COUNTDOWN TIMER ─────────────────────────────────────────── */
function initCountdown() {
  // Set end time to midnight of the next day (creates genuine daily urgency)
  const endTime = new Date();
  endTime.setHours(23, 59, 59, 0);

  function update() {
    const now  = new Date();
    let diff   = Math.max(0, endTime - now);

    const h = Math.floor(diff / 3600000);  diff %= 3600000;
    const m = Math.floor(diff / 60000);    diff %= 60000;
    const s = Math.floor(diff / 1000);

    const pad = n => String(n).padStart(2, '0');
    setText('cdHours', pad(h));
    setText('cdMins',  pad(m));
    setText('cdSecs',  pad(s));
  }

  update();
  setInterval(update, 1000);
}

/* ── LIVE VIEWER COUNT ───────────────────────────────────────── */
function initViewers() {
  function bump() {
    const delta = Math.floor(Math.random() * 5) - 2; // −2 to +2
    viewerCount = Math.min(45, Math.max(14, viewerCount + delta));
    const el = $('viewerCount');
    if (el) el.textContent = viewerCount;
    setTimeout(bump, Math.random() * 8000 + 4000);
  }
  bump();
}

/* ── NAVBAR SCROLL SHADOW ────────────────────────────────────── */
function initNavbarScroll() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });
}

/* ── INTERSECTION OBSERVER (fade-up) ────────────────────────── */
function initFadeIn() {
  const style = document.createElement('style');
  style.textContent = `
    .fade-up { opacity:0; transform:translateY(24px); transition:opacity .6s ease, transform .6s ease; }
    .fade-up.in { opacity:1; transform:translateY(0); }
  `;
  document.head.appendChild(style);

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
  }, { threshold: 0.12 });

  // Apply to cards + section headers after a tiny delay
  setTimeout(() => {
    document.querySelectorAll('.product-card, .why-card, .testimonial-card, .cat-card').forEach((el, i) => {
      el.classList.add('fade-up');
      el.style.transitionDelay = `${(i % 4) * 80}ms`;
      obs.observe(el);
    });
  }, 100);
}

/* ── INIT ────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  renderGrids();
  renderCart();
  initCountdown();
  initViewers();
  initNavbarScroll();
  initFadeIn();
});
