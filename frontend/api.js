// =============================================
// api.js — centralised fetch wrapper
// Every backend call goes through here.
// =============================================

const API_BASE = "https://shopxp-backend.onrender.com";

// ── helpers ──────────────────────────────────

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || "Request failed");
  return data;
}

// ── Auth ─────────────────────────────────────

export const authAPI = {
  register: (name, email, password) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
};

// ── Cart ─────────────────────────────────────

export const cartAPI = {
  get: () => request("/cart"),

  add: (product_id, quantity = 1) =>
    request("/cart", {
      method: "POST",
      body: JSON.stringify({ product_id, quantity }),
    }),

  update: (cart_id, quantity) =>
    request(`/cart/${cart_id}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    }),

  remove: (cart_id) =>
    request(`/cart/${cart_id}`, { method: "DELETE" }),
};

// ── Orders ───────────────────────────────────

export const orderAPI = {
  place: (user_id, items) =>
    request("/orders/place", {
      method: "POST",
      body: JSON.stringify({ user_id, items }),
    }),
};

// ── Products ─────────────────────────────────

export const productAPI = {
  getAll: () => request("/products"),
};

// ── Recommendations ──────────────────────────

export const recommendAPI = {
  get: (user_id, top_n = 4) =>
    request(`/recommendations?user_id=${user_id}&top_n=${top_n}`),
};

// ── Contact ──────────────────────────────────

export const contactAPI = {
  send: (name, email, message) =>
    request("/contact", {
      method: "POST",
      body: JSON.stringify({ name, email, message }),
    }),
};