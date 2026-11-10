import {
  products,
  formatMoney,
  sanitizeCart,
  cartTotal,
  cartCount,
} from "./catalog.js";

// All artwork is a provisional illustration, not the official packaging.
function can(p, id) {
  return `<svg class="can" viewBox="0 0 170 320" aria-hidden="true" focusable="false"><defs><linearGradient id="metal-${id}"><stop stop-color="#93978d"/><stop offset=".25" stop-color="#e9eade"/><stop offset=".6" stop-color="#fafbf3"/><stop offset="1" stop-color="#92978d"/></linearGradient><linearGradient id="shine-${id}"><stop stop-color="#000" stop-opacity=".12"/><stop offset=".25" stop-color="#fff" stop-opacity=".16"/><stop offset=".65" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".15"/></linearGradient></defs><path d="M39 18Q85 8 131 18L129 31Q143 43 145 58L145 287Q145 307 128 312Q85 322 42 312Q25 307 25 287V58Q27 43 41 31Z" fill="${p.color}"/><path d="M25 122Q90 90 145 126V238Q80 207 25 244Z" fill="${p.accent}" opacity=".55"/><path d="M25 66Q85 84 145 55V80Q85 103 25 84ZM25 258Q85 279 145 249V270Q85 293 25 279Z" fill="#fff" opacity=".14"/><g fill="#24251e" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900"><text x="83" y="141" font-size="54" letter-spacing="-5" transform="rotate(-7 83 141)">dada</text><text x="85" y="166" font-size="10" letter-spacing="6">DRINKS</text><text x="85" y="209" font-size="13" letter-spacing="1">${p.name.toUpperCase()}</text></g><text x="85" y="254" text-anchor="middle" font-size="30" fill="#24251e">${p.icon}</text><path d="M39 18Q85 8 131 18L129 31Q85 43 41 31Z" fill="url(#metal-${id})"/><ellipse cx="85" cy="21" rx="43" ry="8" fill="#a5aa9d"/><ellipse cx="85" cy="21" rx="34" ry="5" fill="#c8ccbf"/><ellipse cx="87" cy="22" rx="12" ry="4" fill="#7e8577"/><path d="M40 304Q85 316 130 304L128 312Q85 322 42 312Z" fill="url(#metal-${id})"/><path d="M39 18Q85 8 131 18L129 31Q143 43 145 58V287Q145 307 128 312Q85 322 42 312Q25 307 25 287V58Q27 43 41 31Z" fill="url(#shine-${id})"/><path d="M37 58V286" stroke="#fff" stroke-width="3" opacity=".2"/></svg>`;
}

let cart = {};
try {
  cart = sanitizeCart(JSON.parse(localStorage.getItem("dada-cart-v1")));
} catch {
  /* Storage may be unavailable; the cart still works for this visit. */
}
const grid = document.querySelector("#product-grid");
const cartDialog = document.querySelector("#cart-dialog");
const productDialog = document.querySelector("#product-dialog");
let toastTimer;

function notify(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 3500);
}
function saveCart() {
  cart = sanitizeCart(cart);
  try {
    localStorage.setItem("dada-cart-v1", JSON.stringify(cart));
  } catch {
    /* Non-persistent storage is supported. */
  }
  document.querySelector("#cart-count").textContent = cartCount(cart);
  renderCart();
}
function addProduct(id) {
  const p = products.find((p) => p.id === id);
  if (!p) return;
  if ((cart[id] || 0) >= 24)
    return notify("Maximum de 24 packs par saveur dans la simulation.");
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  notify(`${p.name} ajouté au panier découverte.`);
}
function renderProducts(filter = "all") {
  grid.innerHTML = products
    .filter((p) => filter === "all" || p.category === filter)
    .map(
      (p) =>
        `<article class="product-card"><button class="product-art" data-product="${p.id}" style="--shade:${p.color}44" aria-label="Découvrir DADA ${p.name}, pack de 24 canettes"><span class="card-kicker">PACK DE 24</span>${can(p, `card-${p.id}`)}<span class="view-label">↗</span></button><div class="product-info"><div><h3>${p.name}</h3><p>24 canettes · DADA Drinks</p></div><span class="product-price">${formatMoney(p.price)}</span></div><button class="add-button" data-add="${p.id}" aria-label="Ajouter un pack ${p.name} au panier découverte">Ajouter au panier découverte <span>+</span></button><span class="stock">Stock à confirmer · démo</span></article>`,
    )
    .join("");
}
function showProduct(id) {
  const p = products.find((p) => p.id === id);
  if (!p) return;
  document.querySelector("#product-detail").innerHTML =
    `<div class="detail-layout"><div class="detail-art" style="--shade:${p.color}55">${can(p, `detail-${p.id}`)}</div><div class="detail-copy"><span class="eyebrow">${p.note}</span><h2 id="product-title">DADA ${p.name}</h2><p>Pack de 24 canettes</p><p class="detail-price">${formatMoney(p.price)}</p><p>${p.description}</p><small>Stock à confirmer. Visuel provisoire. Composition, allergènes et format à compléter avant la vente.</small><button class="button dark" data-add="${p.id}">Ajouter au panier découverte <span>+</span></button><p class="stock">Simulation sans commande ni paiement.</p></div></div>`;
  productDialog.showModal();
}
function renderCart() {
  const selected = products.filter((p) => cart[p.id]);
  document.querySelector("#cart-items").innerHTML = selected.length
    ? selected
        .map(
          (p) =>
            `<div class="cart-item"><div class="cart-item-art" style="--shade:${p.color}55">${can(p, `cart-${p.id}`)}</div><div><h3>${p.name}</h3><small>Pack de 24 canettes</small><div class="quantity"><button data-decrease="${p.id}" aria-label="Retirer un pack ${p.name}">−</button><span aria-label="Quantité ${p.name}">${cart[p.id]}</span><button data-increase="${p.id}" aria-label="Ajouter un pack ${p.name}" ${cart[p.id] >= 24 ? "disabled" : ""}>+</button></div></div><div class="item-end">${formatMoney(p.price * cart[p.id])}<button class="remove" data-remove="${p.id}" aria-label="Supprimer ${p.name} du panier">Supprimer</button></div></div>`,
        )
        .join("")
    : '<div class="empty-cart"><span class="empty-symbol" aria-hidden="true">✳</span><h3>Une envie de DADA ?</h3><p>Votre panier attend sa première saveur.</p><button class="button dark" data-browse>Explorer les boissons ↗</button></div>';
  document.querySelector("#cart-summary").innerHTML = selected.length
    ? `<div class="total-row"><span>Sous-total simulé</span><span>${formatMoney(cartTotal(cart))}</span></div><p class="cart-summary-note">Livraison en France : frais et modalités à définir.<br>Prix affichés à confirmer avant l’ouverture.</p><button class="checkout-disabled" disabled>Paiement indisponible · boutique en préparation</button><p class="cart-summary-note">Aucune transaction ne sera effectuée. Les stocks, les informations légales et le paiement doivent être validés avant la mise en vente.</p>`
    : "";
}

document.querySelector("#hero-cans").innerHTML = [
  products[0],
  products[1],
  products[2],
]
  .map((p, i) => can(p, `hero-${i}`))
  .join("");
document.querySelector("#year").textContent = new Date().getFullYear();
document.querySelector("#open-cart").addEventListener("click", () => {
  renderCart();
  cartDialog.showModal();
});
document.querySelectorAll("[data-filter]").forEach((button) =>
  button.addEventListener("click", () => {
    document
      .querySelectorAll("[data-filter]")
      .forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
    renderProducts(button.dataset.filter);
  }),
);
document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.add) addProduct(button.dataset.add);
  if (button.dataset.product) showProduct(button.dataset.product);
  if (button.hasAttribute("data-close")) button.closest("dialog").close();
  if (button.hasAttribute("data-browse")) {
    cartDialog.close();
    document
      .querySelector("#collection")
      .scrollIntoView({ behavior: "smooth" });
  }
  if (
    button.dataset.increase ||
    button.dataset.decrease ||
    button.dataset.remove
  ) {
    const id =
      button.dataset.increase ||
      button.dataset.decrease ||
      button.dataset.remove;
    // Keep keyboard focus on a useful cart control after rerendering.
    const selector = button.dataset.increase
      ? `[data-increase="${id}"]`
      : button.dataset.decrease
        ? `[data-decrease="${id}"]`
        : null;
    if (button.dataset.remove) delete cart[id];
    else {
      cart[id] += button.dataset.increase ? 1 : -1;
      if (cart[id] <= 0) delete cart[id];
    }
    saveCart();
    const next = selector && cartDialog.querySelector(selector);
    (next && !next.disabled
      ? next
      : cartDialog.querySelector("[data-close]")
    ).focus();
  }
});
renderProducts();
saveCart();
