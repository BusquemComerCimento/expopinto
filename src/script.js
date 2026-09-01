const products = [
  { id: 1, name: 'Camiseta Lata 01', category: 'Camisetas', price: 89.90, number: '01', accent: 'vermelha', featured: true },
  { id: 2, name: 'Cargo Ferrugem', category: 'Calças', price: 179.90, number: '02', accent: 'escura', featured: true },
  { id: 3, name: 'Moletom Turno 06', category: 'Moletons', price: 219.90, number: '06', accent: 'creme', featured: true },
  { id: 4, name: 'Boné Lacre', category: 'Acessórios', price: 69.90, number: '04', accent: 'preto', featured: true },
  { id: 5, name: 'Camiseta Expiração', category: 'Camisetas', price: 94.90, number: '05', accent: 'vinho' },
  { id: 6, name: 'Calça Serviço', category: 'Calças', price: 189.90, number: '07', accent: 'oliva' },
  { id: 7, name: 'Moletom Válvula', category: 'Moletons', price: 229.90, number: '08', accent: 'caramelo' },
  { id: 8, name: 'Meia 24H', category: 'Acessórios', price: 39.90, number: '09', accent: 'branca' },
  { id: 9, name: 'Camiseta Contrabando', category: 'Camisetas', price: 99.90, number: '10', accent: 'preta' },
  { id: 10, name: 'Calça Lote 2', category: 'Calças', price: 169.90, number: '11', accent: 'grafite' },
  { id: 11, name: 'Moletom Lacre Vermelho', category: 'Moletons', price: 239.90, number: '12', accent: 'vermelha' },
  { id: 12, name: 'Shoulder Bag 1999', category: 'Acessórios', price: 109.90, number: '13', accent: 'preta' }
];

const state = {
  category: 'Todos',
  query: '',
  cart: JSON.parse(localStorage.getItem('cls_cart') || '[]'),
  users: JSON.parse(localStorage.getItem('cls_users') || '[]'),
  currentUser: JSON.parse(localStorage.getItem('cls_current_user') || 'null')
};

const money = value => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const byId = id => document.getElementById(id);

function saveCart() { localStorage.setItem('cls_cart', JSON.stringify(state.cart)); }
function saveUsers() { localStorage.setItem('cls_users', JSON.stringify(state.users)); }

function productColor(product) {
  const map = {
    vermelha: 'linear-gradient(145deg,#2b1917,#8d2420 52%,#c03932)',
    escura: 'linear-gradient(145deg,#151313,#3a312c)',
    creme: 'linear-gradient(145deg,#d8cab2,#ece3d4)',
    preto: 'linear-gradient(145deg,#0f0e0e,#25211f)',
    vinho: 'linear-gradient(145deg,#271517,#67201f)',
    oliva: 'linear-gradient(145deg,#292a1c,#596044)',
    caramelo: 'linear-gradient(145deg,#624b36,#bc9165)',
    branca: 'linear-gradient(145deg,#c8c1b6,#f2ece2)',
    preta: 'linear-gradient(145deg,#121111,#302a26)',
    grafite: 'linear-gradient(145deg,#202020,#4c4a47)'
  };
  return map[product.accent] || map.preto;
}

function productCard(product) {
  return `
    <article class="product-card">
      <button class="favorite" aria-label="Favoritar ${product.name}" data-fav="${product.id}">♡</button>
      <div class="product-image" style="background:${productColor(product)}">
        <div class="product-mark">
          <span class="number">${product.number}</span>
          <span class="mini-logo">CLS<br>ENLATADOS</span>
        </div>
      </div>
      <div class="product-info">
        <div>
          <h3 class="product-name">${product.name}</h3>
          <p class="product-category">${product.category}</p>
        </div>
        <div class="product-price">${money(product.price)}</div>
        <button class="btn btn-red product-buy" data-add="${product.id}">ADICIONAR À SACOLA</button>
      </div>
    </article>`;
}

function renderProducts() {
  const featured = products.filter(p => p.featured).map(productCard).join('');
  byId('featuredGrid').innerHTML = featured;

  const filtered = products.filter(p => {
    const categoryMatch = state.category === 'Todos' || p.category === state.category;
    const queryMatch = !state.query || `${p.name} ${p.category}`.toLowerCase().includes(state.query.toLowerCase());
    return categoryMatch && queryMatch;
  });

  byId('catalogGrid').innerHTML = filtered.length
    ? filtered.map(productCard).join('')
    : '<p style="grid-column:1/-1;color:#9d9386">Nenhuma peça encontrada. Tenta outra busca.</p>';
}

function renderCart() {
  const count = state.cart.reduce((sum, item) => sum + item.qty, 0);
  const total = state.cart.reduce((sum, item) => sum + item.qty * item.price, 0);
  byId('cartCount').textContent = count;
  byId('cartTotal').textContent = money(total);

  if (!state.cart.length) {
    byId('cartItems').innerHTML = '<div class="cart-empty">Sua sacola está vazia.<br>Coloca alguma coisa aí.</div>';
    return;
  }

  byId('cartItems').innerHTML = state.cart.map(item => `
    <div class="cart-line">
      <div class="cart-thumb" style="background:${productColor(item)}">${item.number}</div>
      <div>
        <h4>${item.name}</h4>
        <p>${item.category} · ${money(item.price)}</p>
        <div class="qty-row">
          <button class="qty-btn" data-qty="${item.id}" data-delta="-1">−</button>
          <strong>${item.qty}</strong>
          <button class="qty-btn" data-qty="${item.id}" data-delta="1">+</button>
          <button class="remove-btn" data-remove="${item.id}">REMOVER</button>
        </div>
      </div>
      <strong>${money(item.price * item.qty)}</strong>
    </div>`).join('');
}

function addToCart(id) {
  const product = products.find(p => p.id === id);
  const found = state.cart.find(i => i.id === id);
  if (found) found.qty += 1;
  else state.cart.push({ ...product, qty: 1 });
  saveCart();
  renderCart();
  showToast(`${product.name} entrou na sacola.`);
}

function changeQty(id, delta) {
  const item = state.cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) state.cart = state.cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  state.cart = state.cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
}

function openOverlay(id) { byId(id).hidden = false; document.body.style.overflow = 'hidden'; }
function closeOverlay(id) { byId(id).hidden = true; document.body.style.overflow = ''; }
function openCart() { byId('cartDrawer').classList.add('open'); byId('cartDrawer').setAttribute('aria-hidden','false'); document.body.style.overflow = 'hidden'; }
function closeCart() { byId('cartDrawer').classList.remove('open'); byId('cartDrawer').setAttribute('aria-hidden','true'); document.body.style.overflow = ''; }

function showToast(message) {
  const toast = byId('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2600);
}

function toggleAuth(mode) {
  document.querySelectorAll('.auth-tab').forEach(btn => btn.classList.toggle('active', btn.dataset.auth === mode));
  byId('loginPane').hidden = mode !== 'login';
  byId('registerPane').hidden = mode !== 'register';
  byId('authStatus').textContent = '';
}

function renderSearchResults(query = '') {
  const normalized = query.trim().toLowerCase();
  const results = products.filter(p => !normalized || `${p.name} ${p.category}`.toLowerCase().includes(normalized)).slice(0, 7);
  byId('searchResults').innerHTML = results.length
    ? results.map(p => `<div class="search-result"><span>${p.name}<small style="display:block;color:#756c5f">${p.category} · ${money(p.price)}</small></span><button data-search-add="${p.id}">ADICIONAR</button></div>`).join('')
    : '<p style="color:#6b6255">Nada encontrado.</p>';
}

function checkoutSummary() {
  const total = state.cart.reduce((sum, item) => sum + item.qty * item.price, 0);
  byId('checkoutSummary').innerHTML = `
    <strong>${state.cart.reduce((s,i)=>s+i.qty,0)} item(ns)</strong> na sacola · subtotal <strong>${money(total)}</strong>
  `;
}

// Navegação e filtros
byId('filterTabs').addEventListener('click', e => {
  const btn = e.target.closest('[data-category]');
  if (!btn) return;
  state.category = btn.dataset.category;
  document.querySelectorAll('.filter-tab').forEach(b => b.classList.toggle('active', b === btn));
  renderProducts();
});

byId('catalogSearch').addEventListener('input', e => {
  state.query = e.target.value;
  renderProducts();
});

// Botões dos produtos
function productEvents(e) {
  const add = e.target.closest('[data-add]');
  if (add) addToCart(Number(add.dataset.add));
}
byId('featuredGrid').addEventListener('click', productEvents);
byId('catalogGrid').addEventListener('click', productEvents);

byId('cartItems').addEventListener('click', e => {
  const qtyBtn = e.target.closest('[data-qty]');
  if (qtyBtn) changeQty(Number(qtyBtn.dataset.qty), Number(qtyBtn.dataset.delta));
  const removeBtn = e.target.closest('[data-remove]');
  if (removeBtn) removeFromCart(Number(removeBtn.dataset.remove));
});

// Busca global
byId('openSearch').addEventListener('click', () => {
  openOverlay('searchOverlay');
  byId('globalSearch').value = '';
  renderSearchResults();
  setTimeout(() => byId('globalSearch').focus(), 30);
});
byId('globalSearch').addEventListener('input', e => renderSearchResults(e.target.value));
byId('searchResults').addEventListener('click', e => {
  const btn = e.target.closest('[data-search-add]');
  if (!btn) return;
  addToCart(Number(btn.dataset.searchAdd));
  closeOverlay('searchOverlay');
  openCart();
});

// Auth
byId('openAuth').addEventListener('click', () => {
  openOverlay('authOverlay');
  if (state.currentUser) {
    byId('authStatus').textContent = `Você está conectado como ${state.currentUser.name}.`;
  }
});
document.querySelectorAll('.auth-tab').forEach(btn => btn.addEventListener('click', () => toggleAuth(btn.dataset.auth)));

byId('loginForm').addEventListener('submit', e => {
  e.preventDefault();
  const form = new FormData(e.currentTarget);
  const email = form.get('email').trim().toLowerCase();
  const user = state.users.find(u => u.email === email && u.password === form.get('password'));
  if (!user) {
    byId('authStatus').textContent = 'E-mail ou senha incorretos.';
    return;
  }
  state.currentUser = { id: user.id, name: user.name, email: user.email };
  localStorage.setItem('cls_current_user', JSON.stringify(state.currentUser));
  byId('authStatus').textContent = `Bem-vindo, ${user.name.split(' ')[0]}.`;
  setTimeout(() => closeOverlay('authOverlay'), 700);
});

byId('registerForm').addEventListener('submit', e => {
  e.preventDefault();
  const form = new FormData(e.currentTarget);
  const email = form.get('email').trim().toLowerCase();
  if (state.users.some(u => u.email === email)) {
    byId('authStatus').textContent = 'Esse e-mail já está cadastrado.';
    return;
  }
  const user = { id: Date.now(), name: form.get('name').trim(), email, password: form.get('password') };
  state.users.push(user);
  saveUsers();
  state.currentUser = { id: user.id, name: user.name, email: user.email };
  localStorage.setItem('cls_current_user', JSON.stringify(state.currentUser));
  byId('authStatus').textContent = 'Conta criada. Você já está conectado.';
  e.currentTarget.reset();
  setTimeout(() => closeOverlay('authOverlay'), 700);
});

// Carrinho e checkout
byId('openCart').addEventListener('click', openCart);
byId('closeCart').addEventListener('click', closeCart);
byId('clearCartBtn').addEventListener('click', () => {
  state.cart = [];
  saveCart();
  renderCart();
  showToast('Sacola esvaziada.');
});
byId('checkoutBtn').addEventListener('click', () => {
  if (!state.cart.length) { showToast('Sua sacola está vazia.'); return; }
  checkoutSummary();
  closeCart();
  openOverlay('checkoutOverlay');
});

byId('checkoutForm').addEventListener('submit', e => {
  e.preventDefault();
  const order = {
    id: `CLS-${Date.now().toString().slice(-7)}`,
    userId: state.currentUser?.id || null,
    items: state.cart,
    createdAt: new Date().toISOString()
  };
  const orders = JSON.parse(localStorage.getItem('cls_orders') || '[]');
  orders.push(order);
  localStorage.setItem('cls_orders', JSON.stringify(orders));
  state.cart = [];
  saveCart();
  renderCart();
  byId('checkoutStatus').textContent = `Pedido ${order.id} confirmado. Pagamento demonstrativo aprovado.`;
  e.currentTarget.reset();
  setTimeout(() => closeOverlay('checkoutOverlay'), 1400);
});

// Contato
byId('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const messages = JSON.parse(localStorage.getItem('cls_messages') || '[]');
  const form = new FormData(e.currentTarget);
  messages.push({ name: form.get('name'), email: form.get('email'), message: form.get('message'), createdAt: new Date().toISOString() });
  localStorage.setItem('cls_messages', JSON.stringify(messages));
  e.currentTarget.reset();
  byId('contactStatus').textContent = 'Mensagem registrada. A CLS recebeu seu chamado.';
});

// Fechamento dos modais
for (const btn of document.querySelectorAll('[data-close]')) {
  btn.addEventListener('click', () => closeOverlay(btn.dataset.close));
}
for (const overlay of document.querySelectorAll('.overlay')) {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeOverlay(overlay.id);
  });
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.overlay:not([hidden])').forEach(o => closeOverlay(o.id));
    closeCart();
  }
});

// Persistência inicial
renderProducts();
renderCart();
