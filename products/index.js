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
      console.log(res);
    })
    .catch((err) => {
      console.error(err);
    });

  renderPage();
}

function renderPage() {
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

  const openButtons = document.querySelectorAll(".js-open-product-modal");

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
  openButtons.forEach((button) => {
    button.addEventListener("click", () => openModal(button));
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
}
