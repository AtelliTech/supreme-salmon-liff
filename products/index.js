import liff from "@line/liff";
import { createApi } from "/api/index.js";
import { resolveUserState, routeByUserState } from "/utils/index.js";

main();

async function main() {
  const api = createApi();
  const result = await resolveUserState({ api });

  if (result.state !== "NOT_FOUND") {
    routeByUserState({ result });
    return;
  }

  const profile = await liff.getProfile();
  const { userId } = profile;

  api
    .getProducts(userId, {
      customerId: 1,
      divisionId: 1,
    })
    .then((res) => {
      renderPage({
        productsRes: res.data
      });
    })
    .catch((err) => {
      console.error(err);
    });
}

function renderPage({ productsRes }) {
  // --- DOM elements ---
  const modal = document.getElementById("product-modal");
  const panel = document.getElementById("product-modal-panel");
  const backdrop = document.getElementById("product-modal-backdrop");
  const closeBtn = document.getElementById("product-modal-close");
  const confirmBtn = document.getElementById("modal-confirm-btn");

  const productImage = document.getElementById("modal-product-image");
  const productName = document.getElementById("modal-product-name");
  const productDesc = document.getElementById("modal-product-desc");
  const productPrice = document.getElementById("modal-product-price");
  const variantOptions = document.getElementById("modal-spec-options");

  const qtyMinusBtn = document.getElementById("modal-qty-minus");
  const qtyPlusBtn = document.getElementById("modal-qty-plus");
  const qtyValue = document.getElementById("modal-qty-value");

  const productContainer = document.querySelector(".product-container");

  // --- State ---
  const state = {
    qty: 1,
    selectedVariant: "",
  };

  // --- Variant classes ---
  const VARIANT_ACTIVE_CLASSES = ["border-salmon-500", "bg-salmon-50", "text-salmon-600"];
  const VARIANT_INACTIVE_CLASSES = ["border-gray-200", "bg-white", "text-gray-600", "hover:border-salmon-300"];

  // --- Qty ---
  const setQty = (nextQty) => {
    const parsed = Number(nextQty);
    const safe = Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
    state.qty = safe;
    qtyValue.value = String(safe);
  };

  // --- Variants ---
  const parseVariants = (button) => {
    const variants = (button.dataset.specs || "標準規格")
      .split("|")
      .map((v) => v.trim())
      .filter(Boolean);
    return variants.length ? variants : ["標準規格"];
  };

  const setActiveVariant = (activeButton) => {
    variantOptions.querySelectorAll(".js-variant-item").forEach((item) => {
      item.classList.remove(...VARIANT_ACTIVE_CLASSES);
      item.classList.add(...VARIANT_INACTIVE_CLASSES);
    });
    activeButton.classList.remove(...VARIANT_INACTIVE_CLASSES);
    activeButton.classList.add(...VARIANT_ACTIVE_CLASSES);
    state.selectedVariant = activeButton.dataset.variant || "";
  };

  const renderVariants = (variants) => {
    state.selectedVariant = variants[0];

    variantOptions.innerHTML = variants
      .map(
        (variant, index) =>
          `<button data-variant="${variant}" class="js-variant-item px-3 py-2 rounded-lg text-xs border transition-colors ${
            index === 0 ? VARIANT_ACTIVE_CLASSES.join(" ") : VARIANT_INACTIVE_CLASSES.join(" ")
          }">${variant}</button>`,
      )
      .join("");

    variantOptions.querySelectorAll(".js-variant-item").forEach((button) => {
      button.addEventListener("click", () => setActiveVariant(button));
    });
  };

  // --- Modal ---
  const fillModalContent = (triggerButton) => {
    const card = triggerButton.closest(".bg-white.rounded-xl");
    if (!card) return false;

    const imageEl = card.querySelector("img");
    const nameEl = card.querySelector("h3");
    const descEl = card.querySelector(".product-description");
    const priceEl = card.querySelector("p.text-red-500");

    productImage.src = imageEl?.src || "/placeholder.jpg";
    productImage.alt = nameEl?.textContent?.trim() || "商品圖片";
    productName.textContent = nameEl?.textContent?.trim() || "未命名商品";
    productDesc.innerHTML = descEl?.innerHTML?.trim() || "";
    productPrice.textContent = priceEl?.textContent?.trim() || "NT$ 0";

    return true;
  };

  const showPanel = () => {
    requestAnimationFrame(() => {
      backdrop.classList.remove("opacity-0");
      backdrop.classList.add("opacity-100");
      panel.classList.remove("translate-y-full");
      panel.classList.add("translate-y-0");
    });
  };

  const hidePanel = () => {
    backdrop.classList.remove("opacity-100");
    backdrop.classList.add("opacity-0");
    panel.classList.remove("translate-y-0");
    panel.classList.add("translate-y-full");
  };

  const openModal = (triggerButton) => {
    if (!fillModalContent(triggerButton)) return;

    renderVariants(parseVariants(triggerButton));
    setQty(1);

    modal.classList.remove("hidden");
    document.body.classList.add("modal-open");
    modal.setAttribute("aria-hidden", "false");
    showPanel();
  };

  const closeModal = () => {
    hidePanel();
    modal.setAttribute("aria-hidden", "true");
    window.setTimeout(() => {
      modal.classList.add("hidden");
      document.body.classList.remove("modal-open");
    }, 250);
  };

  // --- Event bindings ---
  productContainer.addEventListener("click", (e) => {
    const button = e.target.closest(".js-open-product-modal");
    if (button) openModal(button);
  });

  closeBtn.addEventListener("click", closeModal);
  confirmBtn.addEventListener("click", closeModal);
  backdrop.addEventListener("click", closeModal);

  qtyMinusBtn.addEventListener("click", () => setQty(state.qty - 1));
  qtyPlusBtn.addEventListener("click", () => setQty(state.qty + 1));
  qtyValue.addEventListener("input", () => setQty(qtyValue.value));
  qtyValue.addEventListener("blur", () => setQty(qtyValue.value));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.getAttribute("aria-hidden") === "false") {
      closeModal();
    }
  });


  renderCategories();
  renderProducts(productsRes?.data || []);
}

function renderCategories(categories = [
    {name: '魚片',},
    {name: '整魚',},
]) {

  const container = document.querySelector(".category-container");
  if (!container) return;

  const allItem = document.createElement("a");
  allItem.href = "#";
  allItem.className = "category-item inline-block px-4 py-1.5 bg-salmon-500 text-white text-sm font-medium rounded-full mr-2";
  allItem.textContent = "全部商品";
  container.appendChild(allItem);

  categories.forEach((category) => {
    const name = category.name;
    const item = document.createElement("a");
    item.href = "#";
    item.className = "category-item inline-block px-4 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-full mr-2 transition-colors hover:bg-gray-200";
    item.textContent = name;
    container.appendChild(item);
  });
}

function renderProducts(products = []) {
  const container = document.querySelector(".product-container");
  if (!container) return;

  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-item bg-white rounded-xl shadow-sm overflow-hidden flex flex-col border border-gray-100";
    card.innerHTML = `
      <div class="relative pb-[100%]">
        <img
          src="${product.img_url || '/placeholder.jpg'}"
          alt="${product.name || ''}"
          class="absolute top-0 left-0 w-full h-full object-contain"
        />
      </div>
      <div class="p-2.5 flex-1 flex flex-col">
        <h3 class="text-sm font-medium text-gray-800 line-clamp-2 leading-snug mb-1"></h3>
        <p class="product-description text-xs text-gray-400 mb-0.5"></p>
        <div class="mt-auto pt-2 flex items-end justify-between">
          <div>
            <p class="text-red-500 font-bold leading-none text-base"></p>
          </div>
          <button
            class="js-open-product-modal bg-salmon-500 text-white w-7 h-7 rounded-full flex items-center justify-center hover:bg-salmon-600 active:scale-95 transition-transform shadow-sm"
            data-specs="${product.remark || '標準規格'}"
          >
            <i class="fas fa-plus text-sm"></i>
          </button>
        </div>
      </div>
    `;

    card.querySelector("h3").textContent = product.name || "";
    card.querySelector(".product-description").textContent = product.description || "";
    card.querySelector("p.text-red-500").textContent = `NT$ ${product.unit_price ?? 0}`;

    container.appendChild(card);
  });
}