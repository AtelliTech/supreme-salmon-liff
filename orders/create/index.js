main();

function main() {
  MicroModal.init({
    disableScroll: true,
  });

  const orderItemTitle = document.getElementById("order-item-title");
  const orderItemList = document.getElementById("order-item-list");
  const openAddProductModalBtn = document.getElementById(
    "open-add-product-modal",
  );

  const addProductModal = document.getElementById("add-product-modal");
  const addProductBackdrop = document.getElementById("add-product-backdrop");
  const addProductModalClose = document.getElementById(
    "add-product-modal-close",
  );
  const addProductList = document.getElementById("add-product-list");

  const state = {
    orderItems: [
      {
        id: "salmon-fillet-300g",
        name: "頂級挪威鮮切鮭魚菲力",
        spec: "300g (厚切)",
        price: 380,
        qty: 2,
        image: "/placeholder.jpg",
        alt: "鮭魚",
      },
      {
        id: "salmon-steak-500g",
        name: "智利厚切鮭魚排 家庭號",
        spec: "500g",
        price: 520,
        qty: 1,
        image: "/placeholder.jpg",
        alt: "鮭魚排",
      },
    ],
  };

  const availableProducts = [
    {
      id: "salmon-fillet-300g",
      name: "頂級挪威鮮切鮭魚菲力",
      spec: "300g (厚切)",
      price: 380,
      image: "/placeholder.jpg",
      alt: "鮭魚",
    },
    {
      id: "salmon-steak-500g",
      name: "智利厚切鮭魚排 家庭號",
      spec: "500g",
      price: 520,
      image: "/placeholder.jpg",
      alt: "鮭魚排",
    },
    {
      id: "salmon-belly-250g",
      name: "炙燒級鮭魚腹排",
      spec: "250g",
      price: 320,
      image: "/placeholder.jpg",
      alt: "鮭魚腹排",
    },
    {
      id: "salmon-cube-600g",
      name: "鮭魚丁料理包",
      spec: "600g",
      price: 460,
      image: "/placeholder.jpg",
      alt: "鮭魚丁",
    },
  ];

  const normalizeQty = (value) => {
    const parsedQty = Number(value);
    if (!Number.isFinite(parsedQty)) {
      return 0;
    }

    return Math.max(0, Math.floor(parsedQty));
  };

  const formatPrice = (price) => `NT$ ${price}`;

  const setBodyScrollLock = (isLocked) => {
    if (isLocked) {
      document.body.classList.add("overflow-hidden");
      return;
    }

    document.body.classList.remove("overflow-hidden");
  };

  const renderAddProductList = () => {
    addProductList.innerHTML = availableProducts
      .map((product) => {
        const existingItem = state.orderItems.find(
          (item) => item.id === product.id,
        );

        return `
              <button
                type="button"
                data-add-product-id="${product.id}"
                class="w-full border border-gray-100 rounded-xl px-3 py-3 text-left flex items-center gap-3 hover:border-salmon-300 transition-colors"
                aria-label="加入 ${product.name}"
              >
                <div class="w-14 h-14 rounded-lg overflow-hidden border border-gray-100 shrink-0">
                  <img src="${product.image}" alt="${product.alt}" class="w-full h-full object-contain" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-800 line-clamp-1">${product.name}</p>
                  <p class="text-[11px] text-gray-400 mt-0.5">${product.spec}</p>
                  <p class="text-sm font-bold text-salmon-600 mt-1">${formatPrice(product.price)}</p>
                </div>
                <div class="text-[10px] rounded-full px-2 py-1 ${
                  existingItem
                    ? "bg-gray-100 text-gray-500"
                    : "bg-salmon-50 text-salmon-600"
                }">
                  ${existingItem ? "已在清單" : "新增"}
                </div>
              </button>
            `;
      })
      .join("");
  };

  const renderOrderItems = () => {
    const itemCount = state.orderItems.length;
    orderItemTitle.textContent = `商品清單 (${itemCount})`;

    if (!itemCount) {
      orderItemList.innerHTML = `
              <div class="text-center py-8 rounded-xl border border-dashed border-gray-200 bg-gray-50/80">
                <p class="text-sm text-gray-500">目前尚未加入商品</p>
                <p class="text-xs text-gray-400 mt-1">請點擊上方「新增」開始選購</p>
              </div>
            `;
      renderAddProductList();
      return;
    }

    orderItemList.innerHTML = state.orderItems
      .map(
        (item) => `
                <div class="flex gap-3" data-order-item-id="${item.id}">
                  <div class="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                    <img src="${item.image}" alt="${item.alt}" class="w-full h-full object-contain" />
                  </div>

                  <div class="flex-1 min-w-0 flex flex-col">
                    <div class="flex justify-between items-start gap-2">
                      <h4 class="text-sm font-medium text-gray-800 line-clamp-1">${item.name}</h4>
                      <button
                        type="button"
                        data-remove-item-id="${item.id}"
                        class="text-[11px] text-red-500 bg-red-50 px-2 py-1 rounded-md shrink-0"
                        aria-label="刪除 ${item.name}"
                      >
                        刪除
                      </button>
                    </div>

                    <p class="text-[11px] text-gray-400 mt-0.5">${item.spec}</p>

                    <div class="mt-2 flex items-center justify-between gap-2">
                      <span class="text-salmon-600 font-bold text-sm">${formatPrice(item.price)}</span>

                      <div class="inline-flex items-center border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          type="button"
                          data-qty-minus="${item.id}"
                          class="w-9 h-9 bg-gray-50 text-gray-600 hover:bg-gray-100 active:scale-95 transition-transform"
                          aria-label="減少數量"
                        >
                          <i class="fas fa-minus text-xs"></i>
                        </button>

                        <input
                          type="number"
                          min="0"
                          step="1"
                          inputmode="numeric"
                          data-qty-input="${item.id}"
                          value="${item.qty}"
                          class="w-14 text-center font-semibold text-gray-800 bg-white focus:outline-none"
                          aria-label="輸入數量"
                        />

                        <button
                          type="button"
                          data-qty-plus="${item.id}"
                          class="w-9 h-9 bg-gray-50 text-gray-600 hover:bg-gray-100 active:scale-95 transition-transform"
                          aria-label="增加數量"
                        >
                          <i class="fas fa-plus text-xs"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              `,
      )
      .join("");

    renderAddProductList();
  };

  const updateQtyById = (id, nextQty) => {
    const safeQty = normalizeQty(nextQty);
    state.orderItems = state.orderItems.map((item) =>
      item.id === id ? { ...item, qty: safeQty } : item,
    );
    renderOrderItems();
  };

  const removeItemById = (id) => {
    const target = state.orderItems.find((item) => item.id === id);

    if (!target) {
      return;
    }

    const shouldRemove = window.confirm(`確定要刪除「${target.name}」嗎？`);
    if (!shouldRemove) {
      return;
    }

    state.orderItems = state.orderItems.filter((item) => item.id !== id);
    renderOrderItems();
  };

  const addProductById = (id) => {
    const product = availableProducts.find((item) => item.id === id);

    if (!product) {
      return;
    }

    const existingItem = state.orderItems.find((item) => item.id === id);
    if (existingItem) {
      updateQtyById(id, existingItem.qty + 1);
      closeAddProductModal();
      return;
    }

    state.orderItems = [...state.orderItems, { ...product, qty: 1 }];
    renderOrderItems();
    closeAddProductModal();
  };

  const openAddProductModal = () => {
    addProductModal.classList.remove("hidden");
    addProductModal.setAttribute("aria-hidden", "false");
    setBodyScrollLock(true);
  };

  const closeAddProductModal = () => {
    addProductModal.classList.add("hidden");
    addProductModal.setAttribute("aria-hidden", "true");
    setBodyScrollLock(false);
  };

  openAddProductModalBtn.addEventListener("click", openAddProductModal);
  addProductModalClose.addEventListener("click", closeAddProductModal);
  addProductBackdrop.addEventListener("click", closeAddProductModal);

  addProductList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add-product-id]");
    if (!button) {
      return;
    }

    addProductById(button.dataset.addProductId || "");
  });

  orderItemList.addEventListener("click", (event) => {
    const minusButton = event.target.closest("[data-qty-minus]");
    if (minusButton) {
      const id = minusButton.dataset.qtyMinus || "";
      const target = state.orderItems.find((item) => item.id === id);
      updateQtyById(id, (target?.qty || 0) - 1);
      return;
    }

    const plusButton = event.target.closest("[data-qty-plus]");
    if (plusButton) {
      const id = plusButton.dataset.qtyPlus || "";
      const target = state.orderItems.find((item) => item.id === id);
      updateQtyById(id, (target?.qty || 0) + 1);
      return;
    }

    const removeButton = event.target.closest("[data-remove-item-id]");
    if (removeButton) {
      removeItemById(removeButton.dataset.removeItemId || "");
    }
  });

  orderItemList.addEventListener("input", (event) => {
    const input = event.target.closest("[data-qty-input]");
    if (!input) {
      return;
    }

    updateQtyById(input.dataset.qtyInput || "", input.value);
  });

  orderItemList.addEventListener(
    "blur",
    (event) => {
      const input = event.target.closest("[data-qty-input]");
      if (!input) {
        return;
      }

      updateQtyById(input.dataset.qtyInput || "", input.value);
    },
    true,
  );

  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      addProductModal.getAttribute("aria-hidden") === "false"
    ) {
      closeAddProductModal();
    }
  });

  document
    .getElementById("confirm-order-submit")
    .addEventListener("click", () => {
      MicroModal.close("confirm-order-modal");
    });

  renderOrderItems();
}
