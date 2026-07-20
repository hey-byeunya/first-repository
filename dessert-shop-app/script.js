// 수제 디저트 쇼핑몰 — Supabase 연동 프론트엔드
// config.js에서 SUPABASE_CONFIG(url, anonKey)를 읽어와 클라이언트를 만든다.
// 주의: 변수명을 `supabase`로 지으면 CDN 라이브러리가 이미 전역에 선언해둔
// `window.supabase`(라이브러리 객체)와 이름이 충돌해 SyntaxError가 나므로 `supabaseClient`로 구분한다.

const statusBanner = document.getElementById("status-banner");

function showStatus(message, isError = false) {
  statusBanner.textContent = message;
  statusBanner.style.display = "block";
  statusBanner.classList.toggle("error", isError);
}

if (!window.SUPABASE_CONFIG || window.SUPABASE_CONFIG.url.includes("YOUR_PROJECT_REF")) {
  showStatus(
    "config.js에 Supabase 프로젝트 URL/anon key를 채워야 실제 데이터가 연결됩니다. (config.example.js 참고)",
    true
  );
}

const supabaseClient = window.SUPABASE_CONFIG
  ? window.supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey)
  : null;

let products = [];
let cartItems = []; // [{ id, product_id, quantity, products: {...} }]
let currentFilter = "전체";
let currentDetailProduct = null;

const el = (id) => document.getElementById(id);

function switchView(viewId) {
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
  el(viewId).classList.add("active");
}

function formatWon(n) {
  return n.toLocaleString("ko-KR") + "원";
}

// ---------- 인증 (로그인 화면 없이, 익명 인증으로 장바구니를 사용자별로 구분) ----------
async function ensureSession() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) return session;

  const { data, error } = await supabaseClient.auth.signInAnonymously();
  if (error) {
    showStatus("익명 로그인에 실패했습니다: " + error.message, true);
    throw error;
  }
  return data.session;
}

// ---------- 상품 목록 ----------
async function loadProducts() {
  const { data, error } = await supabaseClient.from("products").select("*").order("id");
  if (error) {
    showStatus("상품을 불러오지 못했습니다: " + error.message, true);
    return;
  }
  products = data;
  renderProductGrid();
}

function renderProductGrid() {
  const grid = el("product-grid");
  const filtered =
    currentFilter === "전체" ? products : products.filter((p) => p.category === currentFilter);

  grid.innerHTML = "";
  filtered.forEach((p) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      ${p.sold_out ? '<span class="sold-out-badge">품절</span>' : ""}
      <div class="thumb">${p.image}</div>
      <div class="name">${p.name}</div>
      <div class="price">${formatWon(p.price)}</div>
    `;
    card.addEventListener("click", () => openDetail(p));
    grid.appendChild(card);
  });
}

el("filters").addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-pill");
  if (!btn) return;
  document.querySelectorAll(".filter-pill").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  currentFilter = btn.dataset.category;
  renderProductGrid();
});

// ---------- 상품 상세 ----------
function openDetail(product) {
  currentDetailProduct = product;
  el("detail-thumb").textContent = product.image;
  el("detail-name").textContent = product.name;
  el("detail-price").textContent = formatWon(product.price);
  el("detail-desc").textContent = product.image;

  const addBtn = el("add-to-cart-btn");
  addBtn.disabled = product.sold_out;
  addBtn.textContent = product.sold_out ? "품절된 상품입니다" : "장바구니 담기";

  switchView("view-detail");
}

el("back-to-list").addEventListener("click", () => switchView("view-list"));
el("back-to-list-from-cart").addEventListener("click", () => switchView("view-list"));

el("add-to-cart-btn").addEventListener("click", async () => {
  if (!currentDetailProduct) return;
  await addToCart(currentDetailProduct.id);
  switchView("view-list");
});

// ---------- 장바구니 (Supabase cart_items 테이블에 저장 → 새로고침해도 유지) ----------
async function addToCart(productId) {
  const { data: { user } } = await supabaseClient.auth.getUser();

  const existing = cartItems.find((c) => c.product_id === productId);
  if (existing) {
    const { error } = await supabaseClient
      .from("cart_items")
      .update({ quantity: existing.quantity + 1 })
      .eq("id", existing.id);
    if (error) return showStatus("장바구니 담기에 실패했습니다: " + error.message, true);
  } else {
    const { error } = await supabaseClient
      .from("cart_items")
      .insert({ user_id: user.id, product_id: productId, quantity: 1 });
    if (error) return showStatus("장바구니 담기에 실패했습니다: " + error.message, true);
  }
  await loadCart();
}

async function loadCart() {
  const { data, error } = await supabaseClient
    .from("cart_items")
    .select("id, product_id, quantity, products(name, price, image, sold_out)")
    .order("created_at");

  if (error) {
    showStatus("장바구니를 불러오지 못했습니다: " + error.message, true);
    return;
  }
  cartItems = data;
  renderCart();
}

function renderCart() {
  el("cart-count").textContent = cartItems.reduce((sum, c) => sum + c.quantity, 0);

  const list = el("cart-list");
  if (cartItems.length === 0) {
    list.innerHTML = '<div class="empty-state">장바구니가 비어 있습니다.</div>';
    el("cart-total-amount").textContent = formatWon(0);
    return;
  }

  list.innerHTML = "";
  let total = 0;
  cartItems.forEach((c) => {
    const lineTotal = c.products.price * c.quantity;
    total += lineTotal;

    const row = document.createElement("div");
    row.className = "cart-row";
    row.innerHTML = `
      <div class="thumb-sm"></div>
      <div class="info">
        <div class="name">${c.products.name}</div>
        <div class="price">${formatWon(c.products.price)}</div>
      </div>
      <div class="qty-control">
        <button data-action="dec">−</button>
        <span>${c.quantity}</span>
        <button data-action="inc">+</button>
      </div>
      <span class="remove-btn" data-action="remove">🗑</span>
    `;
    row.querySelector('[data-action="inc"]').addEventListener("click", () => changeQty(c, c.quantity + 1));
    row.querySelector('[data-action="dec"]').addEventListener("click", () => changeQty(c, c.quantity - 1));
    row.querySelector('[data-action="remove"]').addEventListener("click", () => removeFromCart(c));
    list.appendChild(row);
  });

  el("cart-total-amount").textContent = formatWon(total);
}

async function changeQty(cartItem, newQty) {
  if (newQty <= 0) return removeFromCart(cartItem);
  const { error } = await supabaseClient
    .from("cart_items")
    .update({ quantity: newQty })
    .eq("id", cartItem.id);
  if (error) return showStatus("수량 변경에 실패했습니다: " + error.message, true);
  await loadCart();
}

async function removeFromCart(cartItem) {
  const { error } = await supabaseClient.from("cart_items").delete().eq("id", cartItem.id);
  if (error) return showStatus("삭제에 실패했습니다: " + error.message, true);
  await loadCart();
}

el("cart-nav-btn").addEventListener("click", () => switchView("view-cart"));

// ---------- 초기화 ----------
async function init() {
  if (!supabaseClient) return;
  try {
    await ensureSession();
    await loadProducts();
    await loadCart();
  } catch (e) {
    console.error(e);
  }
}

init();
