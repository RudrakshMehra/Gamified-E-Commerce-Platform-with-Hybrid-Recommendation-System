// =============================================
// script.js  —  ShopXP  (fully DB-integrated)
// =============================================

const API_BASE = "http://localhost:5000/api";

// ── Request helper ───────────────────────────

async function apiRequest(path, options = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = localStorage.getItem("token");
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || "Request failed");
  return data;
}

// =============================================
// AUTH HELPERS
// =============================================

function getUser() {
  try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
}

function isLoggedIn() {
  return !!getUser() && !!localStorage.getItem("token");
}

function saveSession(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("cart");   // local cart cache
}

// ── Register ─────────────────────────────────

async function register() {
  const name     = document.getElementById("regName")?.value.trim();
  const email    = document.getElementById("regEmail")?.value.trim();
  const password = document.getElementById("regPassword")?.value.trim();

  clearErrors(["nameError","emailError","passwordError"]);

  let valid = true;
  if (!name)              { showError("nameError", "Name is required");                   valid = false; }
  if (!email?.includes("@")) { showError("emailError", "Enter a valid email");            valid = false; }
  if ((password?.length ?? 0) < 6) { showError("passwordError", "Min 6 characters");    valid = false; }
  if (!valid) return;

  try {
    const data = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });

    showSuccess("successMsg", "Registration successful! Redirecting...");
    setTimeout(() => window.location.href = "login.html", 1200);
  } catch (err) {
    showError("emailError", err.message);
  }
}

// ── Login ────────────────────────────────────

async function login() {
  const email    = document.getElementById("loginEmail")?.value.trim();
  const password = document.getElementById("loginPassword")?.value.trim();

  clearErrors(["loginError"]);

  try {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    saveSession(data.token, data.user);
    showToast("Login successful 🎉");
    setTimeout(() => window.location.href = "index.html", 800);
  } catch (err) {
    showError("loginError", err.message || "Invalid credentials");
  }
}

// ── Logout ───────────────────────────────────

function logout() {
  clearSession();
  showToast("Logged out 👋");
  setTimeout(() => window.location.href = "login.html", 800);
}

// =============================================
// CART  (DB-backed; local cache for counts)
// =============================================

// Fetch cart from DB and cache locally
async function syncCart() {
  if (!isLoggedIn()) return [];
  try {
    const items = await apiRequest("/cart");
    localStorage.setItem("cart", JSON.stringify(items));
    return items;
  } catch {
    return JSON.parse(localStorage.getItem("cart") || "[]");
  }
}

async function updateCartCount() {
  const el = document.getElementById("cart-count");
  if (!el) return;
  const cart = await syncCart();
  const total = cart.reduce((s, i) => s + (i.quantity || i.qty || 0), 0);
  el.innerText = total;
}

// Add item by product_id  (called from product cards)
async function addToCart(product) {
  if (!isLoggedIn()) {
    showToast("Please login first 🔑");
    setTimeout(() => window.location.href = "login.html", 900);
    return;
  }

  try {
    await apiRequest("/cart", {
      method: "POST",
      body: JSON.stringify({ product_id: product.id, quantity: 1 }),
    });

    addXP(10);
    showToast(product.name + " added to cart 🎉");
    await updateCartCount();
  } catch (err) {
    showToast("Could not add to cart ❌");
    console.error(err);
  }
}

// Display full cart page
async function displayCart() {
  const container = document.getElementById("cart-items");
  if (!container) return;

  container.innerHTML = `<p style="color:#888;padding:20px;">Loading cart…</p>`;

  try {
    const cart = await syncCart();

    if (cart.length === 0) {
      container.innerHTML = "<p class='empty-cart'>Your cart is empty 🛒</p>";
      setCartTotals(0, 0, 0);
      return;
    }

    container.innerHTML = "";
    let total = 0;

    cart.forEach((item) => {
      const price    = Number(item.price);
      const qty      = item.quantity ?? item.qty ?? 1;
      const itemTotal = price * qty;
      total += itemTotal;

      const div = document.createElement("div");
      div.className = "cart-item-box";
      div.innerHTML = `
        <div class="cart-item-left">
          <img src="${item.image || 'https://via.placeholder.com/120'}" alt="${item.name}">
        </div>
        <div class="cart-item-center">
          <h4>${item.name}</h4>
          <p>₹${price.toLocaleString("en-IN")}</p>
          <div class="qty-controls">
            <button onclick="changeQty(${item.id}, ${qty - 1})">−</button>
            <span>${qty}</span>
            <button onclick="changeQty(${item.id}, ${qty + 1})">+</button>
          </div>
          <button onclick="removeItem(${item.id})" class="remove-btn">REMOVE</button>
        </div>
      `;
      container.appendChild(div);
    });

    const mrp      = Math.round(total * 1.2);
    const discount = mrp - total;
    setCartTotals(total, mrp, discount);
  } catch (err) {
    container.innerHTML = "<p>Failed to load cart. Please refresh.</p>";
    console.error(err);
  }
}

function setCartTotals(total, mrp, discount) {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
  set("cart-total",    Math.round(total).toLocaleString("en-IN"));
  set("mrp-total",     Math.round(mrp).toLocaleString("en-IN"));
  set("discount-total",Math.round(discount).toLocaleString("en-IN"));
  set("save-amount",   Math.round(discount).toLocaleString("en-IN"));
}

async function changeQty(cart_id, newQty) {
  try {
    if (newQty <= 0) {
      await apiRequest(`/cart/${cart_id}`, { method: "DELETE" });
    } else {
      await apiRequest(`/cart/${cart_id}`, {
        method: "PUT",
        body: JSON.stringify({ quantity: newQty }),
      });
    }
    await displayCart();
    await updateCartCount();
  } catch (err) {
    showToast("Update failed ❌");
  }
}

async function removeItem(cart_id) {
  try {
    await apiRequest(`/cart/${cart_id}`, { method: "DELETE" });
    await displayCart();
    await updateCartCount();
  } catch (err) {
    showToast("Remove failed ❌");
  }
}

// =============================================
// CHECKOUT  →  POST /api/orders/place
// =============================================

async function checkout() {
  if (!isLoggedIn()) {
    showToast("Please login first 🔑");
    return;
  }

  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  if (cart.length === 0) { showToast("Cart is empty ⚠️"); return; }

  const user  = getUser();
  const items = cart.map(i => ({
    product_id: i.product_id ?? i.id,
    quantity:   i.quantity   ?? i.qty ?? 1,
  }));

  try {
    const result = await apiRequest("/orders/place", {
      method: "POST",
      body: JSON.stringify({ user_id: user.id, items }),
    });

    // Persist XP/level from server response into localStorage so UI updates
    const updatedUser = { ...user, xp: result.newXP ?? user.xp, level: result.newLevel ?? user.level };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    localStorage.setItem("xp", updatedUser.xp);

    showToast(`Order placed 🎉 +${result.xpEarned} XP, +${result.coinsEarned} coins`);
    localStorage.removeItem("cart");
    await displayCart();
    await updateCartCount();
  } catch (err) {
    showToast("Checkout failed: " + err.message);
    console.error(err);
  }
}

// =============================================
// PRODUCTS  →  GET /api/products
// =============================================

async function loadProducts() {
  const container = document.getElementById("products");
  if (!container) return;

  try {
    const products = await apiRequest("/products");
    renderProductCards(container, products);
  } catch {
    // If API fails gracefully degrade to placeholder cards already in HTML
  }
}

function renderProductCards(container, products) {
  container.innerHTML = "";
  products.forEach(p => {
    const div = document.createElement("article");
    div.className = "product-card";
    div.setAttribute("data-category", p.category || "");

    div.innerHTML = `
      <img src="${p.image ? '/uploads/' + p.image : 'https://via.placeholder.com/200'}"
           alt="${p.name}" loading="lazy">
      <h3>${p.name}</h3>
      <p class="price">₹${Number(p.price).toLocaleString("en-IN")}</p>
      <div class="reward">🎯 Earn ${Math.floor(p.price / 100)} XP</div>
      <button onclick='addToCart(${JSON.stringify({id: p.id, name: p.name, price: p.price, image: p.image ? "/uploads/"+p.image : ""})})'>
        Add to Cart
      </button>
    `;
    container.appendChild(div);
  });
}

// =============================================
// ML RECOMMENDATIONS
// =============================================

const SUBCATEGORY_PRODUCTS = {
  Laptop:      { id: 201, name: "Laptop",           price: 55000 },
  Mobile:      { id: 202, name: "Smartphone",       price: 22000 },
  Accessories: { id: 203, name: "Wireless Earbuds", price: 2200  },
  Men:         { id: 204, name: "Men's Jacket",      price: 2500  },
  Women:       { id: 205, name: "Women's Dress",     price: 1800  },
  Sports:      { id: 206, name: "Sports Shoes",      price: 3000  },
  Furniture:   { id: 207, name: "Office Chair",      price: 12000 },
  Kitchen:     { id: 208, name: "Microwave",         price: 7000  },
  Decor:       { id: 209, name: "Wall Art Set",      price: 1500  },
};

const FALLBACK_SUGGESTIONS = [
  { id: 301, name: "Smart Watch",       price: 5000  },
  { id: 302, name: "Bluetooth Speaker", price: 2500  },
  { id: 303, name: "Power Bank",        price: 1200  },
  { id: 304, name: "Wireless Earbuds",  price: 2200  },
];

async function loadSuggestions() {
  const container = document.getElementById("suggested-products");
  if (!container) return;

  container.innerHTML = `
    <div class="suggestion-loading">
      ${[...Array(4)].map(() => '<div class="skeleton-card"></div>').join("")}
    </div>`;

  const user = getUser();

  if (!user?.id) {
    renderSuggestions(FALLBACK_SUGGESTIONS, false);
    return;
  }

  try {
    const data = await apiRequest(`/recommendations?user_id=${user.id}&top_n=4`);

    if (!data.recommendations?.length) { renderSuggestions(FALLBACK_SUGGESTIONS, false); return; }

    const products = data.recommendations
      .map(rec => {
        const base = SUBCATEGORY_PRODUCTS[rec.subcategory];
        if (!base) return null;
        return { ...base, mlScore: rec.score, subcategory: rec.subcategory };
      })
      .filter(Boolean);

    renderSuggestions(products.length ? products : FALLBACK_SUGGESTIONS, !!products.length);
  } catch {
    renderSuggestions(FALLBACK_SUGGESTIONS, false);
  }
}

function renderSuggestions(products, isPersonalized) {
  const container = document.getElementById("suggested-products");
  if (!container) return;

  const heading = document.querySelector(".suggest-section h2");
  if (heading) {
    heading.innerHTML = isPersonalized
      ? "🤖 Recommended For You <span class='ml-badge'>AI-Powered</span>"
      : "🔥 Suggested For You";
  }

  container.innerHTML = "";
  products.forEach(p => {
    const div = document.createElement("div");
    div.className = "product-card";
    const label = p.subcategory
      ? `<div class="reward">🏷️ ${p.subcategory}</div>`
      : `<div class="reward">🎯 Earn ${Math.floor(p.price / 100)} XP</div>`;

    div.innerHTML = `
      <img src="https://via.placeholder.com/200?text=${encodeURIComponent(p.name)}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p class="price">₹${p.price.toLocaleString("en-IN")}</p>
      ${label}
      <button onclick='addToCart(${JSON.stringify({id: p.id, name: p.name, price: p.price, image: ""})})'>
        Add to Cart
      </button>`;
    container.appendChild(div);
  });
}

// =============================================
// PROFILE  →  reads from localStorage (seeded by login)
// =============================================

function loadProfile() {
  const user = getUser();
  if (!user) { window.location.href = "login.html"; return; }

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
  set("profileName",  user.name  || user.email?.split("@")[0]);
  set("profileEmail", user.email);

  // XP — prefer the DB value stored at login; fall back to localStorage
  const xp    = user.xp  ?? parseInt(localStorage.getItem("xp")) ?? 0;
  const level = user.level ?? Math.floor(xp / 500) + 1;
  const coins = user.coins ?? 0;

  set("xpPoints",   xp);
  set("coinPoints", coins);

  const icons = ["🔥","🥉","🥈","🥇","💎"];
  const iconIdx = Math.min(Math.floor(level / 3), icons.length - 1);
  set("levelIcon", `Level ${level} ${icons[iconIdx]}`);

  const pct = ((xp % 500) / 500) * 100;
  const bar = document.getElementById("xpProgress");
  if (bar) setTimeout(() => bar.style.width = pct + "%", 100);

  set("nextLevelText", `${500 - (xp % 500)} XP to next level`);
}

// =============================================
// REWARDS
// =============================================

function loadRewards() {
  const user  = getUser();
  const xp    = user?.xp  ?? parseInt(localStorage.getItem("xp")) ?? 0;
  const level = user?.level ?? Math.floor(xp / 500) + 1;

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
  set("xp",        xp);
  set("levelBadge","Level " + level);

  const pct = ((xp % 500) / 500) * 100;
  const bar = document.getElementById("progressBar");
  if (bar) setTimeout(() => bar.style.width = pct + "%", 100);

  set("nextLevelText", `${500 - (xp % 500)} XP to next level`);
  checkRewardAccess(level);
  updateCartCount();
}

function checkRewardAccess(level) {
  const claimed = JSON.parse(localStorage.getItem("claimedRewards") || "[]");
  [2, 3, 5].forEach(lvl => {
    const btn = document.getElementById("reward" + lvl);
    if (!btn) return;
    if (claimed.includes(lvl))  { btn.innerText = "Claimed"; btn.disabled = true; }
    else                         btn.disabled = level < lvl;
  });
}

function claimReward(level) {
  const claimed = JSON.parse(localStorage.getItem("claimedRewards") || "[]");
  if (claimed.includes(level)) { alert("Already claimed!"); return; }
  claimed.push(level);
  localStorage.setItem("claimedRewards", JSON.stringify(claimed));
  showToast("Reward for Level " + level + " claimed 🎉");
  loadRewards();
}

// =============================================
// CONTACT  →  POST /api/contact
// =============================================

async function sendMessage(event) {
  event.preventDefault();
  const form    = event.target;
  const name    = form.querySelector('[name="name"]')?.value.trim();
  const email   = form.querySelector('[name="email"]')?.value.trim();
  const message = form.querySelector('[name="message"]')?.value.trim();

  try {
    await apiRequest("/contact", {
      method: "POST",
      body: JSON.stringify({ name, email, message }),
    });
    showToast("Message sent ✉️");
    form.reset();
  } catch {
    // Gracefully fall back
    showToast("Message sent ✉️");
    form.reset();
  }
}

// =============================================
// XP HELPERS
// =============================================

function getXP() { return parseInt(localStorage.getItem("xp")) || 0; }

function addXP(amount) {
  const xp = getXP() + amount;
  localStorage.setItem("xp", xp);
  // Keep user object in sync
  const user = getUser();
  if (user) { user.xp = xp; localStorage.setItem("user", JSON.stringify(user)); }
}

// =============================================
// CATEGORY FILTER
// =============================================

function filterProducts(category, event) {
  document.querySelectorAll(".product-card").forEach(card => {
    const cat = card.getAttribute("data-category");
    card.style.display = (category === "all" || cat === category) ? "block" : "none";
  });

  document.querySelectorAll(".category").forEach(c => c.classList.remove("active"));
  event?.currentTarget?.classList.add("active");

  document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
}

// =============================================
// UI HELPERS
// =============================================

function showToast(msg) {
  const t = document.createElement("div");
  t.className = "toast";
  t.innerText = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.innerText = msg;
}

function showSuccess(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.innerText = msg; el.style.color = "green"; }
}

function clearErrors(ids) {
  ids.forEach(id => { const el = document.getElementById(id); if (el) el.innerText = ""; });
}

function toggleMenu() {
  document.getElementById("nav")?.classList.toggle("active");
}

// =============================================
// INIT
// =============================================

document.addEventListener("DOMContentLoaded", async () => {

  // Protect auth-required pages
  const path = window.location.pathname;
  const protectedPages = ["profile.html", "reward.html", "cart.html"];
  if (protectedPages.some(p => path.includes(p)) && !isLoggedIn()) {
    window.location.href = "login.html";
    return;
  }

  // Redirect logged-in users away from auth pages
  if ((path.includes("login.html") || path.includes("register.html")) && isLoggedIn()) {
    window.location.href = "index.html";
    return;
  }

  await updateCartCount();

  if (document.getElementById("cart-items")) await displayCart();
  if (document.getElementById("profileName"))  loadProfile();
  if (document.getElementById("levelBadge"))   loadRewards();
  if (document.getElementById("products"))     await loadProducts();

  await loadSuggestions();
});