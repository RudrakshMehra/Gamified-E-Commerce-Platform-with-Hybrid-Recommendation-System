// =============================================
// script.js  —  ShopXP  (fully fixed)
// =============================================

const API_BASE = (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === ""
) ? "http://localhost:5000/api" : "/api";

const UPLOADS_BASE = API_BASE.replace("/api", "/uploads");

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
function isLoggedIn() { return !!getUser() && !!localStorage.getItem("token"); }
function saveSession(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}
function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("cart");
}

// ── Register ─────────────────────────────────
async function register() {
  const name     = document.getElementById("regName")?.value.trim();
  const email    = document.getElementById("regEmail")?.value.trim();
  const password = document.getElementById("regPassword")?.value.trim();
  clearErrors(["nameError","emailError","passwordError"]);
  let valid = true;
  if (!name)                { showError("nameError","Name is required"); valid=false; }
  if (!email?.includes("@")){ showError("emailError","Enter a valid email"); valid=false; }
  if ((password?.length??0)<6){ showError("passwordError","Min 6 characters"); valid=false; }
  if (!valid) return;
  try {
    await apiRequest("/auth/register", { method:"POST", body:JSON.stringify({name,email,password}) });
    showSuccess("successMsg","Registration successful! Redirecting...");
    setTimeout(()=>window.location.href="login.html",1200);
  } catch(err){ showError("emailError",err.message); }
}

// ── Login ────────────────────────────────────
async function login() {
  const email    = document.getElementById("loginEmail")?.value.trim();
  const password = document.getElementById("loginPassword")?.value.trim();
  clearErrors(["loginError"]);
  try {
    const data = await apiRequest("/auth/login", { method:"POST", body:JSON.stringify({email,password}) });
    saveSession(data.token, data.user);
    showToast("Login successful 🎉");
    setTimeout(()=>window.location.href="index.html",800);
  } catch(err){ showError("loginError",err.message||"Invalid credentials"); }
}

function logout() { clearSession(); showToast("Logged out 👋"); setTimeout(()=>window.location.href="login.html",800); }

// =============================================
// CART  (DB-backed)
// =============================================
async function syncCart() {
  if (!isLoggedIn()) return [];
  try {
    const items = await apiRequest("/cart");
    localStorage.setItem("cart", JSON.stringify(items));
    return items;
  } catch { return JSON.parse(localStorage.getItem("cart")||"[]"); }
}

async function updateCartCount() {
  const el = document.getElementById("cart-count");
  if (!el) return;
  const cart = await syncCart();
  el.innerText = cart.reduce((s,i)=>s+(i.quantity||i.qty||0),0);
}

async function addToCart(product) {
  if (!isLoggedIn()) {
    showToast("Please login first 🔑");
    setTimeout(()=>window.location.href="login.html",900);
    return;
  }
  try {
    await apiRequest("/cart", { method:"POST", body:JSON.stringify({product_id:product.id,quantity:1}) });
    addXP(10);
    showToast(product.name+" added to cart 🎉");
    await updateCartCount();
  } catch(err){ showToast("Could not add to cart ❌"); console.error(err); }
}

async function displayCart() {
  const container = document.getElementById("cart-items");
  if (!container) return;
  container.innerHTML=`<p style="color:#888;padding:20px;">Loading cart…</p>`;
  try {
    const cart = await syncCart();
    if (cart.length===0) {
      container.innerHTML="<p class='empty-cart'>Your cart is empty 🛒</p>";
      setCartTotals(0,0,0); return;
    }
    container.innerHTML="";
    let total=0;
    cart.forEach(item=>{
      const price=Number(item.price), qty=item.quantity??item.qty??1;
      total+=price*qty;
      const div=document.createElement("div");
      div.className="cart-item-box";
      div.innerHTML=`
        <div class="cart-item-left">
          <img src="${item.image?UPLOADS_BASE+'/'+item.image:'https://placehold.co/120x120?text='+encodeURIComponent(item.name)}" alt="${item.name}" onerror="this.src='https://placehold.co/120x120?text=img'">
        </div>
        <div class="cart-item-center">
          <h4>${item.name}</h4>
          <p>₹${price.toLocaleString("en-IN")}</p>
          <div class="qty-controls">
            <button onclick="changeQty(${item.id},${qty-1})">−</button>
            <span>${qty}</span>
            <button onclick="changeQty(${item.id},${qty+1})">+</button>
          </div>
          <button onclick="removeItem(${item.id})" class="remove-btn">REMOVE</button>
        </div>`;
      container.appendChild(div);
    });
    const mrp=Math.round(total*1.2), discount=mrp-total;
    setCartTotals(total,mrp,discount);
  } catch(err){ container.innerHTML="<p>Failed to load cart. Please refresh.</p>"; console.error(err); }
}

function setCartTotals(total,mrp,discount) {
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.innerText=v;};
  set("cart-total",   Math.round(total).toLocaleString("en-IN"));
  set("mrp-total",    Math.round(mrp).toLocaleString("en-IN"));
  set("discount-total",Math.round(discount).toLocaleString("en-IN"));
  set("save-amount",  Math.round(discount).toLocaleString("en-IN"));
}

async function changeQty(cart_id,newQty) {
  try {
    if (newQty<=0) await apiRequest(`/cart/${cart_id}`,{method:"DELETE"});
    else            await apiRequest(`/cart/${cart_id}`,{method:"PUT",body:JSON.stringify({quantity:newQty})});
    await displayCart(); await updateCartCount();
  } catch(err){ showToast("Update failed ❌"); }
}

async function removeItem(cart_id) {
  try {
    await apiRequest(`/cart/${cart_id}`,{method:"DELETE"});
    await displayCart(); await updateCartCount();
  } catch(err){ showToast("Remove failed ❌"); }
}

// =============================================
// CHECKOUT WITH PAYMENT SELECTION
// =============================================
async function checkout() {
  if (!isLoggedIn()) { showToast("Please login first 🔑"); return; }

  let cart;
  try { cart = await apiRequest("/cart"); }
  catch { cart = JSON.parse(localStorage.getItem("cart")||"[]"); }
  if (!cart||cart.length===0) { showToast("Cart is empty ⚠️"); return; }

  // Show payment modal
  showPaymentModal(cart);
}

function showPaymentModal(cart) {
  // Remove any existing modal
  document.getElementById("payment-modal")?.remove();

  const total = cart.reduce((s,i)=>s+(Number(i.price)*(i.quantity||i.qty||1)),0);
  const user = getUser();

  const modal = document.createElement("div");
  modal.id = "payment-modal";
  modal.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,0.6);
    display:flex;align-items:center;justify-content:center;z-index:9999;
    padding:16px;box-sizing:border-box;`;

  modal.innerHTML = `
    <div style="background:white;border-radius:16px;padding:28px 28px 24px;width:100%;max-width:460px;
      font-family:Arial,sans-serif;box-shadow:0 20px 60px rgba(0,0,0,0.3);
      max-height:90vh;overflow-y:auto;">

      <!-- Step indicator -->
      <div style="display:flex;align-items:center;gap:0;margin-bottom:24px;">
        <div id="step-indicator-1" style="flex:1;text-align:center;">
          <div style="width:28px;height:28px;border-radius:50%;background:#fb641b;color:white;
            display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;">1</div>
          <div style="font-size:11px;color:#fb641b;font-weight:600;margin-top:4px;">Delivery</div>
        </div>
        <div style="flex:1;height:2px;background:#e0e0e0;margin-bottom:16px;"></div>
        <div id="step-indicator-2" style="flex:1;text-align:center;">
          <div id="step2-circle" style="width:28px;height:28px;border-radius:50%;background:#e0e0e0;color:#999;
            display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;">2</div>
          <div id="step2-label" style="font-size:11px;color:#999;font-weight:600;margin-top:4px;">Payment</div>
        </div>
      </div>

      <!-- STEP 1: Delivery Address -->
      <div id="step-1">
        <h2 style="margin:0 0 4px;font-size:18px;color:#1a1a2e;">📍 Delivery Address</h2>
        <p style="color:#666;margin:0 0 18px;font-size:13px;">Where should we deliver your order?</p>

        <div style="display:flex;flex-direction:column;gap:12px;">
          <div>
            <label style="font-size:12px;font-weight:600;color:#555;display:block;margin-bottom:5px;">Full Name *</label>
            <input id="addr-name" type="text" placeholder="Enter your full name"
              value="${user?.name||''}"
              style="width:100%;padding:10px 13px;border:1.5px solid #d0d0d0;border-radius:8px;font-size:14px;box-sizing:border-box;outline:none;">
          </div>
          <div>
            <label style="font-size:12px;font-weight:600;color:#555;display:block;margin-bottom:5px;">Phone Number *</label>
            <input id="addr-phone" type="tel" placeholder="10-digit mobile number"
              style="width:100%;padding:10px 13px;border:1.5px solid #d0d0d0;border-radius:8px;font-size:14px;box-sizing:border-box;outline:none;">
          </div>
          <div>
            <label style="font-size:12px;font-weight:600;color:#555;display:block;margin-bottom:5px;">Address Line *</label>
            <input id="addr-line" type="text" placeholder="House No., Street, Area"
              style="width:100%;padding:10px 13px;border:1.5px solid #d0d0d0;border-radius:8px;font-size:14px;box-sizing:border-box;outline:none;">
          </div>
          <div style="display:flex;gap:10px;">
            <div style="flex:1;">
              <label style="font-size:12px;font-weight:600;color:#555;display:block;margin-bottom:5px;">City *</label>
              <input id="addr-city" type="text" placeholder="City"
                style="width:100%;padding:10px 13px;border:1.5px solid #d0d0d0;border-radius:8px;font-size:14px;box-sizing:border-box;outline:none;">
            </div>
            <div style="flex:1;">
              <label style="font-size:12px;font-weight:600;color:#555;display:block;margin-bottom:5px;">Pincode *</label>
              <input id="addr-pin" type="text" placeholder="6-digit pincode" maxlength="6"
                style="width:100%;padding:10px 13px;border:1.5px solid #d0d0d0;border-radius:8px;font-size:14px;box-sizing:border-box;outline:none;">
            </div>
          </div>
          <div>
            <label style="font-size:12px;font-weight:600;color:#555;display:block;margin-bottom:5px;">State *</label>
            <input id="addr-state" type="text" placeholder="State"
              style="width:100%;padding:10px 13px;border:1.5px solid #d0d0d0;border-radius:8px;font-size:14px;box-sizing:border-box;outline:none;">
          </div>
          <div id="addr-error" style="color:#e53e3e;font-size:12px;display:none;padding:6px 10px;background:#fff5f5;border-radius:6px;"></div>
        </div>

        <div style="display:flex;gap:10px;margin-top:20px;">
          <button onclick="document.getElementById('payment-modal').remove()"
            style="flex:1;padding:12px;border:1.5px solid #ddd;border-radius:8px;background:white;cursor:pointer;font-size:14px;font-weight:600;color:#555;">
            Cancel
          </button>
          <button onclick="goToPaymentStep()"
            style="flex:2;padding:12px;background:#2874f0;color:white;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;">
            Continue to Payment →
          </button>
        </div>
      </div>

      <!-- STEP 2: Payment Method (hidden initially) -->
      <div id="step-2" style="display:none;">
        <h2 style="margin:0 0 4px;font-size:18px;color:#1a1a2e;">💳 Payment Method</h2>
        <p style="color:#666;margin:0 0 4px;font-size:13px;">Total: <strong style="color:#212121;">₹${Math.round(total).toLocaleString("en-IN")}</strong></p>

        <!-- Delivery address summary -->
        <div id="addr-summary" style="background:#f0f7ff;border:1px solid #bcd6f7;border-radius:8px;
          padding:10px 14px;margin-bottom:18px;font-size:13px;color:#333;line-height:1.6;">
        </div>

        <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:20px;">

          <label id="opt-cod" style="display:flex;align-items:center;gap:14px;border:2px solid #e0e0e0;border-radius:10px;padding:14px 16px;cursor:pointer;transition:.2s;">
            <input type="radio" name="payment" value="cod" checked style="accent-color:#fb641b;width:18px;height:18px;">
            <div>
              <div style="font-weight:700;font-size:15px;">💵 Cash on Delivery</div>
              <div style="font-size:12px;color:#888;margin-top:2px;">Pay when your order arrives</div>
            </div>
          </label>

          <label id="opt-upi" style="display:flex;align-items:center;gap:14px;border:2px solid #e0e0e0;border-radius:10px;padding:14px 16px;cursor:pointer;transition:.2s;">
            <input type="radio" name="payment" value="upi" style="accent-color:#fb641b;width:18px;height:18px;">
            <div>
              <div style="font-weight:700;font-size:15px;">📱 UPI</div>
              <div style="font-size:12px;color:#888;margin-top:2px;">Google Pay, PhonePe, Paytm, etc.</div>
            </div>
          </label>

        </div>

        <!-- UPI ID input (shown only when UPI is selected) -->
        <div id="upi-input-box" style="display:none;margin-bottom:16px;">
          <label style="font-size:13px;font-weight:600;color:#444;display:block;margin-bottom:6px;">Enter UPI ID</label>
          <input id="upi-id" type="text" placeholder="yourname@upi"
            style="width:100%;padding:11px 14px;border:1.5px solid #d0d0d0;border-radius:8px;font-size:14px;box-sizing:border-box;outline:none;">
          <div id="upi-error" style="color:#e53e3e;font-size:12px;margin-top:4px;"></div>
        </div>

        <div style="display:flex;gap:10px;">
          <button onclick="goBackToAddress()"
            style="flex:1;padding:12px;border:1.5px solid #ddd;border-radius:8px;background:white;cursor:pointer;font-size:14px;font-weight:600;color:#555;">
            ← Back
          </button>
          <button id="confirm-pay-btn" onclick="confirmPayment()"
            style="flex:2;padding:12px;background:#fb641b;color:white;border:none;border-radius:8px;font-size:15px;font-weight:700;cursor:pointer;">
            ✅ Place Order
          </button>
        </div>
      </div>
    </div>`;

  document.body.appendChild(modal);

  // Highlight selected radio + toggle UPI input
  modal.querySelectorAll("input[name='payment']").forEach(radio => {
    radio.addEventListener("change", () => {
      modal.querySelectorAll("label[id^='opt-']").forEach(l=>l.style.borderColor="#e0e0e0");
      radio.closest("label").style.borderColor="#fb641b";
      document.getElementById("upi-input-box").style.display = radio.value==="upi" ? "block" : "none";
    });
  });

  // Store cart reference on modal for confirmPayment
  modal._cart = cart;
}

function goToPaymentStep() {
  // Validate address fields
  const name  = document.getElementById("addr-name").value.trim();
  const phone = document.getElementById("addr-phone").value.trim();
  const line  = document.getElementById("addr-line").value.trim();
  const city  = document.getElementById("addr-city").value.trim();
  const pin   = document.getElementById("addr-pin").value.trim();
  const state = document.getElementById("addr-state").value.trim();
  const errEl = document.getElementById("addr-error");

  if (!name || !phone || !line || !city || !pin || !state) {
    errEl.innerText = "Please fill in all required fields.";
    errEl.style.display = "block"; return;
  }
  if (!/^\d{10}$/.test(phone)) {
    errEl.innerText = "Please enter a valid 10-digit phone number.";
    errEl.style.display = "block"; return;
  }
  if (!/^\d{6}$/.test(pin)) {
    errEl.innerText = "Please enter a valid 6-digit pincode.";
    errEl.style.display = "block"; return;
  }
  errEl.style.display = "none";

  // Store address on modal
  const modal = document.getElementById("payment-modal");
  modal._address = { name, phone, line, city, pin, state };

  // Show address summary in step 2
  document.getElementById("addr-summary").innerHTML =
    `📦 <strong>${name}</strong> · ${phone}<br>${line}, ${city} - ${pin}, ${state}`;

  // Activate step 2 indicator
  document.getElementById("step2-circle").style.background = "#fb641b";
  document.getElementById("step2-circle").style.color = "white";
  document.getElementById("step2-label").style.color = "#fb641b";

  // Switch steps
  document.getElementById("step-1").style.display = "none";
  document.getElementById("step-2").style.display = "block";

  // Highlight COD by default
  document.getElementById("opt-cod").style.borderColor = "#fb641b";
}

function goBackToAddress() {
  document.getElementById("step-1").style.display = "block";
  document.getElementById("step-2").style.display = "none";
  document.getElementById("step2-circle").style.background = "#e0e0e0";
  document.getElementById("step2-circle").style.color = "#999";
  document.getElementById("step2-label").style.color = "#999";
}

async function confirmPayment() {
  const modal = document.getElementById("payment-modal");
  const selectedMethod = modal.querySelector("input[name='payment']:checked")?.value || "cod";
  const cart = modal._cart;
  const address = modal._address;

  // Validate UPI ID if UPI selected
  if (selectedMethod === "upi") {
    const upiId = document.getElementById("upi-id").value.trim();
    if (!upiId || !upiId.includes("@")) {
      document.getElementById("upi-error").innerText = "Please enter a valid UPI ID (e.g. name@upi)";
      return;
    }
    document.getElementById("upi-error").innerText = "";
  }

  const btn = document.getElementById("confirm-pay-btn");
  btn.disabled = true;
  btn.innerText = "Placing order…";

  const items = cart.map(i=>({ product_id: i.product_id??i.id, quantity: i.quantity??i.qty??1 }));
  const deliveryAddress = address
    ? `${address.line}, ${address.city} - ${address.pin}, ${address.state}`
    : "";

  try {
    const result = await apiRequest("/orders/place", {
      method:"POST",
      body:JSON.stringify({ items, payment_method: selectedMethod, delivery_address: deliveryAddress }),
    });

    modal.remove();

    // Sync XP / coins
    const user = getUser();
    const updated = { ...user, xp:result.newXP??user.xp, level:result.newLevel??user.level, coins:(user.coins??0)+(result.coinsEarned??0) };
    localStorage.setItem("user", JSON.stringify(updated));
    localStorage.setItem("xp", updated.xp);
    localStorage.removeItem("cart");

    const methodLabel = selectedMethod==="cod" ? "Cash on Delivery" : "UPI";
    showToast(`Order placed via ${methodLabel} 🎉 +${result.xpEarned} XP`);

    // Show success on cart page if we're on it
    const successEl = document.getElementById("order-success");
    if (successEl) {
      document.getElementById("cart-items").style.display="none";
      document.getElementById("order-btn")?.style && (document.getElementById("order-btn").style.display="none");
      const detail = document.getElementById("order-detail");
      if (detail) detail.innerHTML = `
        Order #${result.orderId} confirmed via <strong>${methodLabel}</strong>.<br>
        📍 Delivering to: ${deliveryAddress}<br>
        🎮 You earned <strong>${result.xpEarned} XP</strong>!`;
      successEl.style.display="block";
    } else {
      await displayCart();
      await updateCartCount();
    }
  } catch(err) {
    btn.disabled = false;
    btn.innerText = "✅ Place Order";
    showToast("Order failed: "+err.message);
    console.error(err);
  }
}

// =============================================
// PRODUCTS  →  GET /api/products
// =============================================

// Map index-page category filter keys → possible DB category values (case-insensitive)
const CATEGORY_MAP = {
  fashion:     ["fashion","clothing","clothes","men","women","apparel","dress","shirt","kurta","jeans","saree"],
  mobiles:     ["mobiles","mobile","smartphone","phone","phones","smartphones"],
  beauty:      ["beauty","skincare","cosmetics","makeup","personal care","grooming","fragrance","perfume"],
  electronics: ["electronics","electronic","laptop","laptops","computer","tablet","camera","audio","headphone","earphone","tv","television","gadget"],
  appliances:  ["appliances","appliance","kitchen","home appliance","washing machine","refrigerator","microwave","ac","air conditioner"]
};

function matchCategory(dbCat, filterKey) {
  if (!dbCat) return false;
  const lower = dbCat.toLowerCase().trim();
  const keys = CATEGORY_MAP[filterKey] || [filterKey];
  return keys.some(k => lower.includes(k) || k.includes(lower));
}

async function loadProducts() {
  const isIndexPage = !!document.getElementById("products");
  const isProductsPage = !!document.getElementById("products-grid");
  const container = document.getElementById("products") || document.getElementById("products-grid");
  if (!container) return;

  container.innerHTML = `<p style="color:#888;padding:20px;grid-column:1/-1">Loading products…</p>`;
  try {
    const products = await apiRequest("/products");
    if (!products.length) {
      container.innerHTML = `<p style="color:#888;padding:20px;grid-column:1/-1">No products found. Run the seed SQL.</p>`;
      return;
    }
    DB_PRODUCTS_CACHE = products;

    if (isIndexPage) {
      renderIndexProducts(container, products);
    } else {
      renderProductCards(container, products);
    }
  } catch(err) {
    console.error("loadProducts:", err);
    container.innerHTML = `<p style="color:#c00;padding:20px;grid-column:1/-1">Could not load products — is the backend running on port 5000?</p>`;
  }
}

// ── Index page: render with category sections ─────────────────────────────────
function renderIndexProducts(container, products) {
  container.innerHTML = "";
  // store all for filter
  container.setAttribute("data-loaded", "true");

  // Render all products as flat grid (category filter shows/hides)
  products.forEach(p => {
    const card = buildIndexCard(p);
    container.appendChild(card);
  });
}

function buildIndexCard(p) {
  const div = document.createElement("article");
  div.className = "product-card";
  div.setAttribute("data-category", (p.category || "").toLowerCase().trim());
  const imgSrc = p.image
    ? UPLOADS_BASE + "/" + p.image
    : "https://placehold.co/200x200?text=" + encodeURIComponent(p.name);
  div.innerHTML = `
    <img src="${imgSrc}" alt="${p.name}" loading="lazy"
         onerror="this.src='https://placehold.co/200x200?text=img'">
    <h3>${p.name}</h3>
    <p class="price">₹${Number(p.price).toLocaleString("en-IN")}</p>
    <div class="reward">🎯 Earn ${Math.floor(p.price / 100)} XP</div>
    <button onclick='addToCart(${JSON.stringify({id:p.id,name:p.name,price:p.price,image:p.image})})'>
      Add to Cart
    </button>`;
  return div;
}

// ── Products page flat grid ────────────────────────────────────────────────────
function renderProductCards(container, products) {
  container.innerHTML = "";
  products.forEach(p => {
    const div = document.createElement("article");
    div.className = "product-card";
    div.setAttribute("data-category", (p.category || "").toLowerCase().trim());
    const imgSrc = p.image
      ? UPLOADS_BASE + "/" + p.image
      : "https://placehold.co/200x200?text=" + encodeURIComponent(p.name);
    div.innerHTML = `
      <img src="${imgSrc}" alt="${p.name}" loading="lazy"
           onerror="this.src='https://placehold.co/200x200?text=img'">
      <h3>${p.name}</h3>
      <p class="price">₹${Number(p.price).toLocaleString("en-IN")}</p>
      <div class="reward">🎯 Earn ${Math.floor(p.price / 100)} XP</div>
      <button onclick='addToCart(${JSON.stringify({id:p.id,name:p.name,price:p.price,image:p.image})})'>
        Add to Cart
      </button>`;
    container.appendChild(div);
  });
}

// =============================================
// ML RECOMMENDATIONS  (uses real DB products)
// =============================================
let DB_PRODUCTS_CACHE = [];

const SUBCATEGORY_NAME_MAP = {
  Laptop:      "Laptop",
  Mobile:      "Smartphone A",
  Accessories: "Smart Watch",
  Men:         "Jacket",
  Women:       "T-Shirt",
  Sports:      "Shoes",
  Kitchen:     "Microwave",
  Decor:       "Refrigerator",
};

async function loadSuggestions() {
  const container = document.getElementById("suggested-products");
  if (!container) return;
  container.innerHTML=`<div class="suggestion-loading">${[...Array(4)].map(()=>'<div class="skeleton-card"></div>').join("")}</div>`;

  if (!DB_PRODUCTS_CACHE.length) {
    try { DB_PRODUCTS_CACHE = await apiRequest("/products"); } catch {}
  }
  const fallback = DB_PRODUCTS_CACHE.slice(0,4);
  const user = getUser();

  if (!user?.id) { renderSuggestions(fallback,false); return; }

  try {
    const data = await apiRequest(`/recommendations?user_id=${user.id}&top_n=4`);
    if (!data.recommendations?.length) { renderSuggestions(fallback,false); return; }

    const products = data.recommendations.map(rec=>{
      const targetName = SUBCATEGORY_NAME_MAP[rec.subcategory];
      return DB_PRODUCTS_CACHE.find(p=>targetName&&p.name.toLowerCase().includes(targetName.toLowerCase()))||null;
    }).filter(Boolean);

    renderSuggestions(products.length?products:fallback, !!products.length);
  } catch { renderSuggestions(fallback,false); }
}

function renderSuggestions(products, isPersonalized) {
  const container = document.getElementById("suggested-products");
  if (!container) return;
  const heading = document.querySelector(".suggest-section h2");
  if (heading) heading.innerHTML = isPersonalized
    ? "🤖 Recommended For You <span class='ml-badge'>AI-Powered</span>"
    : "🔥 Suggested For You";

  container.innerHTML="";
  products.forEach(p=>{
    const div=document.createElement("div");
    div.className="product-card";
    div.innerHTML=`
      <img src="${p.image?UPLOADS_BASE+'/'+p.image:'https://placehold.co/200x200?text='+encodeURIComponent(p.name)}"
           alt="${p.name}" onerror="this.src='https://placehold.co/200x200?text=img'">
      <h3>${p.name}</h3>
      <p class="price">₹${Number(p.price).toLocaleString("en-IN")}</p>
      <div class="reward">🎯 Earn ${Math.floor(p.price/100)} XP</div>
      <button onclick='addToCart(${JSON.stringify({id:p.id,name:p.name,price:p.price,image:p.image})})'>
        Add to Cart
      </button>`;
    container.appendChild(div);
  });
}

// =============================================
// PROFILE
// =============================================
function loadProfile() {
  const user = getUser();
  if (!user) { window.location.href="login.html"; return; }
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.innerText=v;};
  set("profileName",  user.name||user.email?.split("@")[0]);
  set("profileEmail", user.email);
  const xp = getXP();
  const level = calcLevel(xp);
  set("xpPoints",   xp);
  set("coinPoints", user.coins??0);
  const icons=["🔥","🥉","🥈","🥇","💎"];
  set("levelIcon",`Level ${level} ${icons[Math.min(Math.floor(level/3),4)]}`);
  const pct=((xp%500)/500)*100;
  const bar=document.getElementById("xpProgress");
  if (bar) setTimeout(()=>bar.style.width=pct+"%",100);
  set("nextLevelText",`${500-(xp%500)} XP to next level`);
}

// =============================================
// REWARDS
// =============================================
function loadRewards() {
  const user=getUser();
  // getXP() is now the single source of truth — reads user.xp first, then cache
  const xp = getXP();
  const level = calcLevel(xp);
  // Keep user object in sync
  if (user && user.level !== level) {
    user.level = level;
    localStorage.setItem("user", JSON.stringify(user));
  }
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.innerText=v;};
  set("xp",xp); set("levelBadge","Level "+level);
  const pct=((xp%500)/500)*100;
  const bar=document.getElementById("progressBar");
  if (bar) setTimeout(()=>bar.style.width=pct+"%",100);
  set("nextLevelText",`${500-(xp%500)} XP to reach next level`);
  checkRewardAccess(level); updateCartCount();
}

function checkRewardAccess(level) {
  const claimed=JSON.parse(localStorage.getItem("claimedRewards")||"[]");
  // Reward definitions: [rewardLevel, xpRequired]
  const rewards = [
    { lvl:2,  xpNeeded:500  },
    { lvl:3,  xpNeeded:1000 },
    { lvl:5,  xpNeeded:2000 },
  ];
  rewards.forEach(({lvl, xpNeeded})=>{
    const btn=document.getElementById("reward"+lvl);
    if (!btn) return;
    if (claimed.includes(lvl)) {
      btn.innerText="✅ Claimed";
      btn.disabled=true;
      btn.style.background="gray";
    } else if (level >= lvl) {
      btn.innerText="Claim 🎁";
      btn.disabled=false;
      btn.style.background="#22c55e";
    } else {
      btn.innerText=`Locked (need Lvl ${lvl})`;
      btn.disabled=true;
      btn.style.background="#64748b";
    }
  });
}

function claimReward(level) {
  const claimed=JSON.parse(localStorage.getItem("claimedRewards")||"[]");
  if (claimed.includes(level)) { showToast("Already claimed!"); return; }
  // Double-check user actually has the required level
  const xp = getXP();
  const currentLevel = calcLevel(xp);
  if (currentLevel < level) { showToast("You haven't reached this level yet!"); return; }
  claimed.push(level);
  localStorage.setItem("claimedRewards",JSON.stringify(claimed));
  showToast("🎉 Level "+level+" reward claimed!"); loadRewards();
}

// =============================================
// CONTACT
// =============================================
async function sendMessage(event) {
  event.preventDefault();
  const form=event.target;
  const name=form.querySelector('[name="name"]')?.value.trim();
  const email=form.querySelector('[name="email"]')?.value.trim();
  const message=form.querySelector('[name="message"]')?.value.trim();
  try { await apiRequest("/contact",{method:"POST",body:JSON.stringify({name,email,message})}); }
  catch {}
  showToast("Message sent ✉️"); form.reset();
}

// =============================================
// XP HELPERS
// =============================================
function getXP() {
  // user.xp is the authoritative source (synced from DB at login & after orders)
  // localStorage("xp") is a secondary cache — may be missing if user just logged in
  const user = getUser();
  const fromUser = user?.xp;
  const fromCache = parseInt(localStorage.getItem("xp"));
  const xp = (fromUser != null ? fromUser : 0) || fromCache || 0;
  // Keep the cache in sync so both sources agree
  if (xp && fromCache !== xp) localStorage.setItem("xp", xp);
  return xp;
}
function calcLevel(xp) { return Math.floor(xp / 500) + 1; }
function addXP(amount) {
  const xp = getXP() + amount;
  localStorage.setItem("xp", xp);
  const user = getUser();
  if (user) { user.xp = xp; user.level = calcLevel(xp); localStorage.setItem("user", JSON.stringify(user)); }
}

// =============================================
// CATEGORY FILTER
// =============================================
function filterProducts(category, event, label) {
  let visibleCount = 0;
  document.querySelectorAll("#products .product-card").forEach(card => {
    let show = false;
    if (category === "all") {
      show = true;
    } else {
      const dbCat = card.getAttribute("data-category") || "";
      show = matchCategory(dbCat, category);
    }
    card.style.display = show ? "block" : "none";
    if (show) visibleCount++;
  });

  // Update active category tab
  document.querySelectorAll(".category").forEach(c => c.classList.remove("active"));
  event?.currentTarget?.classList.add("active");

  // Update heading
  const heading = document.getElementById("products-heading");
  if (heading && label) {
    const icons = { "All Products":"🛍️", "Fashion":"👗", "Mobiles":"📱", "Beauty":"💄", "Electronics":"💻", "Appliances":"🏠" };
    heading.textContent = (icons[label] || "🛍️") + " " + label;
  }

  // Show/hide empty state
  const noMsg = document.getElementById("no-products-msg");
  if (noMsg) noMsg.style.display = visibleCount === 0 ? "block" : "none";

  // Scroll to products section
  const section = document.getElementById("products-section-wrapper") || document.getElementById("products");
  if (section) section.scrollIntoView({ behavior: "smooth" });
}

// =============================================
// UI HELPERS
// =============================================
function showToast(msg) {
  const t=document.createElement("div"); t.className="toast"; t.innerText=msg;
  document.body.appendChild(t); setTimeout(()=>t.remove(),2200);
}
function showError(id,msg){const el=document.getElementById(id);if(el)el.innerText=msg;}
function showSuccess(id,msg){const el=document.getElementById(id);if(el){el.innerText=msg;el.style.color="green";}}
function clearErrors(ids){ids.forEach(id=>{const el=document.getElementById(id);if(el)el.innerText="";});}
function toggleMenu(){document.getElementById("nav")?.classList.toggle("active");}

// =============================================
// INIT
// =============================================
document.addEventListener("DOMContentLoaded", async () => {
  // Swap Login → Logout in navbar
  const navAuthLink = document.getElementById("nav-auth-link");
  if (navAuthLink && localStorage.getItem("token")) {
    navAuthLink.textContent="Logout"; navAuthLink.href="#";
    navAuthLink.addEventListener("click",(e)=>{e.preventDefault();clearSession();window.location.href="login.html";});
  }

  // Protect pages
  const path = window.location.pathname;
  if (["profile.html","reward.html","cart.html"].some(p=>path.includes(p)) && !isLoggedIn()) {
    window.location.href="login.html"; return;
  }
  if ((path.includes("login.html")||path.includes("register.html")) && isLoggedIn()) {
    window.location.href="index.html"; return;
  }

  await updateCartCount();
  if (document.getElementById("cart-items"))  await displayCart();
  if (document.getElementById("profileName")) loadProfile();
  if (document.getElementById("levelBadge"))  loadRewards();
  if (document.getElementById("products") || document.getElementById("products-grid")) await loadProducts();
  await loadSuggestions();
});
