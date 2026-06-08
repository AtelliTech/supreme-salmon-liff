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
  const modal = document.getElementById("product-modal");
  const panel = document.getElementById("product-modal-panel");
  const backdrop = document.getElementById("product-modal-backdrop");
  const closeBtn = document.getElementById("product-modal-close");
  const confirmBtn = document.getElementById("modal-confirm-btn");

  const productImage = document.getElementById("modal-product-image");
  const productName = document.getElementById("modal-product-name");
  const productDesc = document.getElementById("modal-product-desc");
  const productPrice = document.getElementById("modal-product-price");
  const specOptions = document.getElementById("modal-spec-options");

  const qtyMinusBtn = document.getElementById("modal-qty-minus");
  const qtyPlusBtn = document.getElementById("modal-qty-plus");
  const qtyValue = document.getElementById("modal-qty-value");

  const openButtons = document.querySelectorAll(".js-open-product-modal");

  const state = {
    qty: 1,
    selectedSpec: "",
  };

  const setQty = (nextQty) => {
    const parsedQty = Number(nextQty);
    const safeQty = Number.isFinite(parsedQty)
      ? Math.max(0, Math.floor(parsedQty))
      : 0;

    state.qty = safeQty;
    qtyValue.value = String(state.qty);
  };

  const parseSpecs = (button) => {
    const specs = (button.dataset.specs || "標準規格")
      .split("|")
      .map((item) => item.trim())
      .filter(Boolean);

    return specs.length ? specs : ["標準規格"];
  };

  const renderSpecs = (specs) => {
    state.selectedSpec = specs[0];

    specOptions.innerHTML = specs
      .map(
        (spec, index) =>
          `<button data-spec="${spec}" class="js-spec-item px-3 py-2 rounded-lg text-xs border transition-colors ${
            index === 0
              ? "border-salmon-500 bg-salmon-50 text-salmon-600"
              : "border-gray-200 bg-white text-gray-600 hover:border-salmon-300"
          }">${spec}</button>`,
      )
      .join("");

    specOptions.querySelectorAll(".js-spec-item").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedSpec = button.dataset.spec || "";

        specOptions.querySelectorAll(".js-spec-item").forEach((item) => {
          item.classList.remove(
            "border-salmon-500",
            "bg-salmon-50",
            "text-salmon-600",
          );
          item.classList.add(
            "border-gray-200",
            "bg-white",
            "text-gray-600",
            "hover:border-salmon-300",
          );
        });

        button.classList.remove(
          "border-gray-200",
          "bg-white",
          "text-gray-600",
          "hover:border-salmon-300",
        );
        button.classList.add(
          "border-salmon-500",
          "bg-salmon-50",
          "text-salmon-600",
        );
      });
    });
  };

  const openModal = (button) => {
    const card = button.closest(".bg-white.rounded-xl");

    if (!card) {
      return;
    }

    const imageEl = card.querySelector("img");
    const nameEl = card.querySelector("h3");
    const descEl = card.querySelector(".product-description");
    const priceEl = card.querySelector("p.text-red-500");

    productImage.src = imageEl?.src || "/placeholder.jpg";
    productImage.alt = nameEl?.textContent?.trim() || "商品圖片";
    productName.textContent = nameEl?.textContent?.trim() || "未命名商品";
    productDesc.innerHTML = descEl?.innerHTML?.trim() || "";
    productPrice.textContent = priceEl?.textContent?.trim() || "NT$ 0";

    renderSpecs(parseSpecs(button));
    setQty(1);

    modal.classList.remove("hidden");
    document.body.classList.add("modal-open");

    requestAnimationFrame(() => {
      backdrop.classList.remove("opacity-0");
      backdrop.classList.add("opacity-100");
      panel.classList.remove("translate-y-full");
      panel.classList.add("translate-y-0");
    });

    modal.setAttribute("aria-hidden", "false");
  };

  const closeModal = () => {
    backdrop.classList.remove("opacity-100");
    backdrop.classList.add("opacity-0");
    panel.classList.remove("translate-y-0");
    panel.classList.add("translate-y-full");
    modal.setAttribute("aria-hidden", "true");

    window.setTimeout(() => {
      modal.classList.add("hidden");
      document.body.classList.remove("modal-open");
    }, 250);
  };

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
    if (
      event.key === "Escape" &&
      modal.getAttribute("aria-hidden") === "false"
    ) {
      closeModal();
    }
  });
}
