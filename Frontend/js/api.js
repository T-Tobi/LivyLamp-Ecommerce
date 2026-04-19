/* ============================================
   LivyLamp — API Module
   All backend communication lives here.
   ============================================ */

const API_URL = "http://localhost:3000";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("livylamp_token");
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  const data = await res.json();

  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem("livylamp_token");
    showToast("Session expired. Please log in again.");
    showPage("home");
    throw new Error(data.message || "Unauthorized");
  }

  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

/* ---- Auth ---- */
async function apiLogin(email, password) {
  return request("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

async function apiRegister(email, password) {
  return request("/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/* ---- Products ---- */
async function apiGetProducts() {
  return request("/products");
}

/* ---- Orders ---- */
async function apiPlaceOrder(items) {
  return request("/orders", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}

/* ---- Admin ---- */
async function apiGetAdminOrders() {
  return request("/admin/orders");
}

async function apiAddProduct(productData) {
  return request("/admin/products", {
    method: "POST",
    body: JSON.stringify(productData),
  });
}

async function apiDeleteProduct(id) {
  return request(`/admin/products/${id}`, { method: "DELETE" });
}

/* ---- Reviews ---- */
async function apiGetReviews(productId) {
  return request(`/products/${productId}/reviews`);
}

async function apiSubmitReview(productId, rating, comment) {
  return request(`/products/${productId}/reviews`, {
    method: "POST",
    body: JSON.stringify({ rating, comment }),
  });
}

/* ---- Admin: Edit & Status ---- */
async function apiEditProduct(id, productData) {
  return request(`/admin/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(productData),
  });
}

async function apiUpdateOrderStatus(id, status) {
  return request(`/admin/orders/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

async function apiUploadImage(file) {
  const token = localStorage.getItem("livylamp_token");
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_URL}/admin/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    // No Content-Type header — browser sets it automatically with boundary for FormData
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Upload failed");
  return data;
}
