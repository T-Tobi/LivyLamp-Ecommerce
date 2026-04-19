/* ============================================
   LivyLamp — Products Module
   Fetching, rendering, and filtering products.
   ============================================ */

let PRODUCTS = [];
let activeFilter = "all";
let activeSearch = "";

const GALLERY_ITEMS = [
  {
    name: "Artisan Pine Cone Pendant",
    collection: "Pendant Collection",
    rating: 4.8,
    customers: 124,
    image:
      "https://coissvyrgsaovecbqgup.supabase.co/storage/v1/object/public/LivyLamp%20img/Artisan%20Pine%20Cone%20Wooden%20Pendant%20Lights%20in%20Dark%20Interior.jpg",
  },
  {
    name: "Classic Amber Floor Lamp",
    collection: "Floor Collection",
    rating: 4.7,
    customers: 98,
    image:
      "https://coissvyrgsaovecbqgup.supabase.co/storage/v1/object/public/LivyLamp%20img/Classic%20Floor%20Lamp%20Casting%20Warm%20Amber%20Glow%20in%20Cozy%20Living%20Room.jpg",
  },
  {
    name: "Bamboo Barrel Pendant",
    collection: "Pendant Collection",
    rating: 4.9,
    customers: 76,
    image:
      "https://coissvyrgsaovecbqgup.supabase.co/storage/v1/object/public/LivyLamp%20img/Handwoven%20Bamboo%20Barrel%20Pendant%20Lamp%20with%20Diamond%20Pattern.jpg",
  },
  {
    name: "Warm Pleated Floor Lamp",
    collection: "Floor Collection",
    rating: 4.6,
    customers: 210,
    image:
      "https://coissvyrgsaovecbqgup.supabase.co/storage/v1/object/public/LivyLamp%20img/Warm%20Pleated%20Floor%20Lamp%20Beside%20Vintage%20Armchair%20at%20Dusk.jpg",
  },
];

const TESTIMONIALS = [
  {
    name: "Sarah Jenkins",
    role: "Interior Designer",
    quote:
      "The personalized recommendation was spot on. The lamp doesn't just provide light; it completely changed the mood of my reading nook.",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB9UqCImwutkb6ijG3VIBrq6f_GQrYVxQJockKbo_D0OTgzc6S6DIvIKZ8ZkDhFhRgDzE3ZWVr36XPMM6jV-mfESYeIp6fLSzRX-6KlN4zjBq5T-uJEBmSB6R--Mz8qqSlZt4U6fGAuLxDoso-nXq4uS5WIkprJ0I1uq2OG0GikVFDjsne6C3f7vpu-UgjEZ009JLX64S4zajoZjCg6wN2xIKoylDlea9xARJBFMxgL1YgQwmLfeNz-cVBlAXfqB_hMPzJy1P53Pt1u",
  },
  {
    name: "David Chen",
    role: "Home Owner",
    quote:
      "I was skeptical about AI recommendations for decor, but LivyLamp proved me wrong. The quality and craftsmanship are exceptional.",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBeu4D_wQYHW_7lHbvIVo-lhqmQyAz66SZMeUE9hsg2O3SCiG_GAkM5zwfQXBtRQaNLr42DzzAkkzuBJPkSa0izV-upo7IcGiZNh7UYGBDVe8IjVhDsBvw3GIuc9aiQT2esUH9HmrY6FfKsu2oHrbD35EMC3WDd3esn70As4zXD4yjagtDb5InddSKBWfkus8EsjNltWM3FF6p2hrDn6B_pf01CuwyAyOtRmMt8ElfnDWbDdqYmS3X6l2QqnlTXCL-nn9E8xMyy6l_R",
  },
  {
    name: "Elena Rodriguez",
    role: "Architect",
    quote:
      "Modern, elegant, and efficient. The customer service throughout the selection process was professional and very helpful.",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDnjiRWJvtx7R5TaYvbCE4sXOpN9F9Uo25TlGebbtPzXt3oiDWWunxXiRUHB8m_1bjfzpvou33Xha_vyas_gkYQ36f2hhx5KNxaNRlOlUzsh6Sd5AhysLHl26Yp4Logp7kWgO-thD09TesnnFqg7pcwIz9mjlgTvJzgsda1GhxPgj2YD2_liAg_PRAxtFP84AHlQ_eAymtC6XHtTd5Vms0bXwD9Yrb-oIuTl7KYy75z1VHIYymmVwVSDGr2kq7f0VhMiRX5MHqjUISy",
  },
];

/* ---- Type Derivation ---- */
function deriveType(name) {
  const n = name.toLowerCase();
  if (n.includes("floor")) return "Floor Lamp";
  if (n.includes("table") || n.includes("desk")) return "Table Lamp";
  if (
    n.includes("pendant") ||
    n.includes("ceiling") ||
    n.includes("cluster") ||
    n.includes("hanging") ||
    n.includes("dome") ||
    n.includes("drum")
  )
    return "Pendant Light";
  if (
    n.includes("bedside") ||
    n.includes("shelf") ||
    n.includes("sitting") ||
    n.includes("glow") ||
    n.includes("modern") ||
    n.includes("digital") ||
    n.includes("foldable") ||
    n.includes("futuristic") ||
    n.includes("spiral")
  )
    return "Table Lamp";
  return "Other";
}

/* ---- Fetch Products from API ---- */
async function loadProducts() {
  const grid = document.getElementById("products-grid");
  if (grid)
    grid.innerHTML = '<p class="loading-message">Loading products...</p>';

  try {
    const data = await apiGetProducts();
    PRODUCTS = data.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: parseFloat(p.price),
      image: p.image_url,
      stock: p.stock_quantity,
      type: p.type || deriveType(p.name),
    }));
    renderProducts("all");
  } catch (err) {
    if (grid)
      grid.innerHTML =
        '<p class="error-message">Could not load products. Make sure the server is running.</p>';
  }
}

function interleavedByType(products) {
  const groups = {};
  products.forEach((p) => {
    if (!groups[p.type]) groups[p.type] = [];
    groups[p.type].push(p);
  });

  const result = [];
  const keys = Object.keys(groups);
  const maxLen = Math.max(...keys.map((k) => groups[k].length));

  for (let i = 0; i < maxLen; i++) {
    keys.forEach((key) => {
      if (groups[key][i]) result.push(groups[key][i]);
    });
  }

  return result;
}

/* ---- Render Products ---- */
function renderProducts(filter) {
  const grid = document.getElementById("products-grid");
  if (!grid) return;

  const items =
    filter === "all"
      ? interleavedByType(PRODUCTS)
      : PRODUCTS.filter((p) => p.type === filter);

  if (activeSearch) {
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(activeSearch) ||
        (p.description && p.description.toLowerCase().includes(activeSearch)),
    );
  }

  if (items.length === 0) {
    grid.innerHTML = `<p class="empty-message">${activeSearch ? `No results for "${activeSearch}"` : "No products found."}</p>`;
    return;
  }

  grid.innerHTML = items
    .map(
      (p) => `
    <article class="product-card">
      <div class="product-img-wrap">
        <img src="${p.image || "https://via.placeholder.com/400x400?text=Lamp"}" alt="${p.name}" loading="lazy" />
      </div>
      <div class="product-info">
        <h4>${p.name}</h4>
        <p class="product-type-tag">${p.type}</p>
        ${p.description ? `<p class="product-description">${p.description}</p>` : ""}
        <div class="product-price-row">
          <span class="product-price">$${p.price.toFixed(2)}</span>
          <span class="product-stock ${p.stock === 0 ? "product-stock--out" : ""}">
            ${p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
          </span>
        </div>
        <div class="product-actions">
          <button
            class="btn-primary btn-lg btn--full"
            onclick="addToCart(${p.id})"
            ${p.stock === 0 ? "disabled" : ""}
          >
            ${p.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
          <button class="btn-secondary btn-lg btn--full" onclick="openReviewModal(${p.id}, '${p.name.replace(/'/g, "\\'")}')">
            Reviews
          </button>
        </div>
      </div>
    </article>
  `,
    )
    .join("");
}

function filterProducts(type, btn) {
  document
    .querySelectorAll(".filter-chip")
    .forEach((c) => c.classList.remove("filter-chip--active"));
  btn.classList.add("filter-chip--active");
  activeFilter = type;
  renderProducts();
}

function handleSearch(value) {
  activeSearch = value.toLowerCase().trim();
  renderProducts();
}

/* ---- Render Gallery ---- */
function renderGallery() {
  const grid = document.getElementById("gallery-grid");
  if (!grid) return;

  grid.innerHTML = GALLERY_ITEMS.map((item) => {
    const fullStars = Math.floor(item.rating);
    const stars = Array.from({ length: 5 }, (_, i) =>
      i < fullStars
        ? '<span class="material-symbols-outlined filled-icon">star</span>'
        : '<span class="material-symbols-outlined star-empty">star</span>',
    ).join("");
    return `
    <article class="gallery-card">
      <div class="gallery-img-wrap">
        <img src="${item.image}" alt="${item.name} — ${item.collection}" loading="lazy" />
        <div class="gallery-overlay"></div>
        <button class="gallery-quick-view" onclick="showPage('collections')">Quick View</button>
      </div>
      <h4 class="gallery-name">${item.name}</h4>
      <p class="gallery-collection">${item.collection}</p>
      <div class="gallery-stars">${stars} <span class="gallery-stars__count">${item.rating} (${item.customers})</span></div>
      <button class="btn-quote" onclick="showPage('collections')">View Collection</button>
    </article>`;
  }).join("");
}

/* ---- Render Testimonials ---- */
function renderTestimonials() {
  const grid = document.getElementById("testimonials-grid");
  if (!grid) return;

  grid.innerHTML = TESTIMONIALS.map((t) => {
    const stars = Array.from(
      { length: 5 },
      () => '<span class="material-symbols-outlined filled-icon">star</span>',
    ).join("");
    return `
    <article class="testimonial-card">
      <div class="testimonial-stars">${stars}</div>
      <blockquote>"${t.quote}"</blockquote>
      <div class="testimonial-author">
        <img src="${t.avatar}" alt="${t.name}" class="testimonial-avatar" loading="lazy" />
        <div>
          <div class="testimonial-name">${t.name}</div>
          <div class="testimonial-role">${t.role}</div>
        </div>
      </div>
    </article>`;
  }).join("");
}

/* ---- Booking Form ---- */
function handleBooking(e) {
  e.preventDefault();
  clearAuthErrors();
  let valid = true;

  const name = document.getElementById("book-name").value.trim();
  const email = document.getElementById("book-email").value.trim();
  const phone = document.getElementById("book-phone").value.trim();
  const date = document.getElementById("book-date").value;
  const time = document.getElementById("book-time").value;

  if (!name) {
    showError("err-book-name", "Name required");
    valid = false;
  }
  if (!email || !isValidEmail(email)) {
    showError("err-book-email", "Valid email required");
    valid = false;
  }
  if (!phone || phone.length < 7) {
    showError("err-book-phone", "Valid phone required");
    valid = false;
  }
  if (!date) {
    showError("err-book-date", "Date required");
    valid = false;
  }
  if (!time) {
    showError("err-book-time", "Time required");
    valid = false;
  }
  if (!valid) return;

  const formContainer = document.getElementById("booking-form-container");
  const confirm = document.getElementById("booking-confirm");
  if (formContainer) formContainer.classList.add("booking-form--hidden");
  if (confirm) confirm.classList.remove("booking-confirm--hidden");

  const formatted = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const details = document.getElementById("confirm-details");
  if (details) {
    details.textContent = `Thank you, ${name}! Your showroom visit is booked for ${formatted} at ${time}. A confirmation has been sent to ${email}.`;
  }
}

/* ---- Reviews Modal ---- */
async function openReviewModal(productId, productName) {
  // Remove any existing modal
  document.getElementById("review-modal")?.remove();

  const modal = document.createElement("div");
  modal.id = "review-modal";
  modal.className = "review-modal-overlay";
  modal.innerHTML = `
    <div class="review-modal">
      <div class="review-modal__header">
        <h3>${productName}</h3>
        <button class="review-modal__close" onclick="document.getElementById('review-modal').remove()">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div id="review-summary" class="review-summary">Loading reviews...</div>
      <div id="review-list" class="review-list"></div>

      <div class="review-form-section">
        <h4>Leave a Review</h4>
        <div class="review-star-picker" id="star-picker">
          ${[1, 2, 3, 4, 5]
            .map(
              (n) => `
            <span class="material-symbols-outlined star-pick" data-value="${n}" onclick="selectStar(${n})">star</span>
          `,
            )
            .join("")}
        </div>
        <p id="review-star-error" class="field-error"></p>
        <textarea id="review-comment" class="review-textarea" placeholder="Share your thoughts (optional)..." rows="3"></textarea>
        <button class="btn-primary btn-lg btn--full" onclick="submitReview(${productId})">Submit Review</button>
        <p id="review-submit-msg" class="review-submit-msg"></p>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Close on overlay click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });

  // Load reviews
  try {
    const data = await apiGetReviews(productId);
    const summary = document.getElementById("review-summary");
    const list = document.getElementById("review-list");

    summary.innerHTML =
      data.total_reviews > 0
        ? `<div class="review-avg">
           ${renderStars(data.average_rating)}
           <span>${data.average_rating} out of 5 (${data.total_reviews} review${data.total_reviews > 1 ? "s" : ""})</span>
         </div>`
        : `<p class="review-empty">No reviews yet. Be the first!</p>`;

    list.innerHTML =
      data.reviews
        .map(
          (r) => `
      <div class="review-item">
        <div class="review-item__header">
          <span class="review-item__author">${r.email.split("@")[0]}</span>
          <span class="review-item__stars">${renderStars(r.rating)}</span>
          <span class="review-item__date">${new Date(r.created_at).toLocaleDateString()}</span>
        </div>
        ${r.comment ? `<p class="review-item__comment">${r.comment}</p>` : ""}
      </div>
    `,
        )
        .join("") || "";
  } catch (err) {
    document.getElementById("review-summary").innerHTML =
      '<p class="error-message">Could not load reviews.</p>';
  }
}

let selectedRating = 0;

function selectStar(value) {
  selectedRating = value;
  document.querySelectorAll(".star-pick").forEach((s, i) => {
    s.classList.toggle("star-pick--active", i < value);
  });
}

async function submitReview(productId) {
  const msg = document.getElementById("review-submit-msg");
  const err = document.getElementById("review-star-error");
  msg.textContent = "";
  err.textContent = "";

  if (!selectedRating) {
    err.textContent = "Please select a star rating.";
    return;
  }

  const comment = document.getElementById("review-comment").value.trim();

  try {
    await apiSubmitReview(productId, selectedRating, comment);
    msg.textContent = "✓ Review submitted!";
    msg.style.color = "var(--color-success, green)";
    // Reload the review list
    const productName = document.querySelector("#review-modal h3").textContent;
    setTimeout(() => openReviewModal(productId, productName), 800);
  } catch (err2) {
    msg.textContent = err2.message || "Could not submit review.";
    msg.style.color = "var(--color-error, red)";
  }
}

function renderStars(rating) {
  return Array.from(
    { length: 5 },
    (_, i) =>
      `<span class="material-symbols-outlined ${i < Math.round(rating) ? "filled-icon" : "star-empty"}">star</span>`,
  ).join("");
}
