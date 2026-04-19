/* ============================================
   LivyLamp — Admin Module
   Dashboard, product management, order viewing.
   ============================================ */

async function loadAdminDashboard() {
  if (!isLoggedIn() || !isAdmin()) {
    showPage("home");
    showToast("Admin access required.", true);
    return;
  }
  await Promise.all([loadAdminProducts(), loadAdminOrders()]);
}

/* ---- Admin Products ---- */
async function loadAdminProducts() {
  const container = document.getElementById("admin-products-list");
  if (!container) return;
  container.innerHTML = '<p class="loading-message">Loading products...</p>';

  try {
    const products = await apiGetProducts();
    updateProductStats(products.length);

    if (products.length === 0) {
      container.innerHTML = '<p class="empty-message">No products found.</p>';
      return;
    }

    const tbody = document.getElementById("admin-products-tbody");
    if (tbody) {
      tbody.innerHTML = products
        .map(
          (p) => `
        <tr>
          <td class="table-cell table-cell--muted">#${p.id}</td>
          <td class="table-cell">${p.name}</td>
          <td class="table-cell">$${parseFloat(p.price).toFixed(2)}</td>
          <td class="table-cell">${p.stock_quantity}</td>
        <td class="table-cell" style="display:flex; gap:0.5rem;">
  <button
    class="btn-secondary-sm"
    onclick="openEditProductModal(${p.id}, '${p.name.replace(/'/g, "\\'")}', ${parseFloat(p.price)}, ${p.stock_quantity})"
  >Edit</button>
  <button
    class="btn-danger-sm"
    onclick="handleDeleteProduct(${p.id})"
  >Delete</button>
</td>
        </tr>
      `,
        )
        .join("");
      container.innerHTML = "";
      container.appendChild(document.getElementById("admin-products-table"));
    } else {
      container.innerHTML = buildProductsTable(products);
    }
  } catch (err) {
    container.innerHTML =
      '<p class="error-message">Failed to load products.</p>';
  }
}

function buildProductsTable(products) {
  return `
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${products
            .map(
              (p) => `
            <tr>
              <td class="table-cell table-cell--muted">#${p.id}</td>
              <td class="table-cell">${p.name}</td>
              <td class="table-cell">$${parseFloat(p.price).toFixed(2)}</td>
              <td class="table-cell">${p.stock_quantity}</td>
              <td class="table-cell" style="display:flex; gap:0.5rem;">
                <button
                  class="btn-secondary-sm"
                  onclick="openEditProductModal(${p.id}, '${p.name.replace(/'/g, "\\'")}', ${parseFloat(p.price)}, ${p.stock_quantity})"
                >Edit</button>
                <button
                  class="btn-danger-sm"
                  onclick="handleDeleteProduct(${p.id})"
                >Delete</button>
              </td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    </div>`;
}

/* ---- Admin Orders ---- */
async function loadAdminOrders() {
  const container = document.getElementById("admin-orders-list");
  if (!container) return;
  container.innerHTML = '<p class="loading-message">Loading orders...</p>';

  try {
    const orders = await apiGetAdminOrders();
    updateOrderStats(orders);

    if (orders.length === 0) {
      container.innerHTML = '<p class="empty-message">No orders yet.</p>';
      return;
    }

    container.innerHTML = buildOrdersTable(orders);
  } catch (err) {
    if (err.message.includes("Admin")) {
      container.innerHTML =
        '<p class="error-message">Admin access required. Make sure your account has admin privileges.</p>';
    } else {
      container.innerHTML =
        '<p class="error-message">Failed to load orders.</p>';
    }
  }
}

function buildOrdersTable(orders) {
  return `
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          ${orders
            .map(
              (o) => `
            <tr>
              <td class="table-cell table-cell--muted">#${o.id}</td>
              <td class="table-cell">${o.email}</td>
              <td class="table-cell">${o.items.map((i) => `${i.name} x${i.quantity}`).join(", ")}</td>
              <td class="table-cell">$${parseFloat(o.total).toFixed(2)}</td>
              <td class="table-cell">
  <select class="status-select" onchange="handleUpdateOrderStatus(${o.id}, this.value)">
    ${["pending", "processing", "shipped", "delivered", "cancelled"]
      .map(
        (s) => `
      <option value="${s}" ${o.status === s ? "selected" : ""}>${s.charAt(0).toUpperCase() + s.slice(1)}</option>
    `,
      )
      .join("")}
  </select>
</td>
              <td class="table-cell table-cell--muted">${new Date(o.created_at).toLocaleDateString()}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    </div>`;
}

/* ---- Stats ---- */
function updateProductStats(count) {
  const statsEl = document.getElementById("admin-stats");
  if (!statsEl) return;
  const productStat = statsEl.querySelector(".stat-card--products");
  if (productStat) {
    productStat.querySelector(".stat-card__value").textContent = count;
  }
}

function updateOrderStats(orders) {
  const statsEl = document.getElementById("admin-stats");
  if (!statsEl) return;

  const totalRevenue = orders.reduce((s, o) => s + parseFloat(o.total), 0);

  const orderStat = statsEl.querySelector(".stat-card--orders");
  if (orderStat)
    orderStat.querySelector(".stat-card__value").textContent = orders.length;

  const revenueStat = statsEl.querySelector(".stat-card--revenue");
  if (revenueStat)
    revenueStat.querySelector(".stat-card__value").textContent =
      `$${totalRevenue.toFixed(2)}`;
}

/* ---- Add Product ---- */
async function handleAddProduct(e) {
  e.preventDefault();

  const name = document.getElementById("ap-name").value.trim();
  const price = document.getElementById("ap-price").value;
  const description = document.getElementById("ap-desc").value.trim();
  const stock_quantity = document.getElementById("ap-stock").value;
  const imageFile = document.getElementById("ap-image").files[0];

  if (!name) {
    showError("err-ap-name", "Name required");
    return;
  }
  if (!price) {
    showError("err-ap-price", "Price required");
    return;
  }

  const btn = e.target.querySelector('button[type="submit"]');
  btn.textContent = "Adding...";
  btn.disabled = true;

  try {
    let image_url = "";

    // Upload image first if one was selected
    if (imageFile) {
      btn.textContent = "Uploading image...";
      const uploadResult = await apiUploadImage(imageFile);
      image_url = uploadResult.url;
    }

    await apiAddProduct({
      name,
      price,
      description,
      image_url,
      stock_quantity,
    });
    showToast(`${name} added successfully!`);
    e.target.reset();
    document.getElementById("ap-image-preview-label").textContent = "";
    loadAdminProducts();
  } catch (err) {
    showToast(err.message || "Failed to add product.", true);
  } finally {
    btn.textContent = "Add Product";
    btn.disabled = false;
  }
}
/* ---- Delete Product ---- */
async function handleDeleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  try {
    await apiDeleteProduct(id);
    showToast("Product deleted.");
    loadAdminProducts();
  } catch (err) {
    showToast(err.message || "Failed to delete product.", true);
  }
}

/* ---- Edit Product Modal ---- */
function openEditProductModal(id, name, price, stock) {
  document.getElementById("edit-product-modal")?.remove();

  const modal = document.createElement("div");
  modal.id = "edit-product-modal";
  modal.className = "review-modal-overlay";
  modal.innerHTML = `
    <div class="review-modal">
      <div class="review-modal__header">
        <h3>Edit Product</h3>
        <button class="review-modal__close" onclick="document.getElementById('edit-product-modal').remove()">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div style="display:flex; flex-direction:column; gap:0.75rem;">
        <label>Name
          <input id="ep-name" class="review-textarea" value="${name}" style="resize:none;height:auto;" />
        </label>
        <label>Price
          <input id="ep-price" class="review-textarea" type="number" value="${price}" style="resize:none;height:auto;" />
        </label>
        <label>Stock
          <input id="ep-stock" class="review-textarea" type="number" value="${stock}" style="resize:none;height:auto;" />
        </label>
        <p id="ep-msg" style="font-size:0.9rem;"></p>
        <button class="btn-primary btn-lg btn--full" onclick="handleEditProduct(${id})">Save Changes</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });
}

async function handleEditProduct(id) {
  const name = document.getElementById("ep-name").value.trim();
  const price = document.getElementById("ep-price").value;
  const stock_quantity = document.getElementById("ep-stock").value;
  const msg = document.getElementById("ep-msg");

  if (!name || !price) {
    msg.textContent = "Name and price are required.";
    return;
  }

  try {
    await apiEditProduct(id, { name, price, stock_quantity });
    showToast("Product updated!");
    document.getElementById("edit-product-modal").remove();
    loadAdminProducts();
  } catch (err) {
    msg.textContent = err.message || "Failed to update product.";
  }
}

/* ---- Update Order Status ---- */
async function handleUpdateOrderStatus(id, status) {
  try {
    await apiUpdateOrderStatus(id, status);
    showToast(`Order #${id} marked as ${status}.`);
  } catch (err) {
    showToast(err.message || "Failed to update status.", true);
  }
}
