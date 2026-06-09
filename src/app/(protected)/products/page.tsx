"use client";

import { faUser } from "@fortawesome/free-regular-svg-icons";
import {
  faFileInvoice,
  faMinus,
  faPlus,
  faShoppingCart,
  faStore,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Page() {
  return (
    <div className="no-scrollbar bg-gray-50 pb-20 text-gray-800 antialiased">
      <header className="sticky top-0 z-40 flex items-center justify-between bg-white px-4 py-3 shadow-sm">
        <div className="font-bold text-lg text-salmon-600">MOWI Taiwan</div>
        <div className="relative">
          <a href="/orders/create">
            <FontAwesomeIcon
              icon={faShoppingCart}
              className="text-gray-600 text-xl"
            />
            <span className="-top-1.5 -right-1.5 absolute flex h-4 w-4 items-center justify-center rounded-full bg-red-500 font-bold text-[10px] text-white">
              2
            </span>
          </a>
        </div>
      </header>

      <div className="category-container no-scrollbar mb-2 overflow-x-auto whitespace-nowrap bg-white px-3 py-3 shadow-sm">
        <a
          href="/#"
          className="category-item mr-2 inline-block rounded-full bg-salmon-500 px-4 py-1.5 font-medium text-sm text-white"
        >
          全部商品
        </a>
      </div>

      <main className="product-container grid grid-cols-2 gap-3 p-3">
        <div className="product-item flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="relative pb-[100%]">
            <img
              src="/placeholder.jpg"
              alt="鮭魚"
              className="absolute top-0 left-0 h-full w-full object-contain"
            />
            <div className="absolute top-2 left-2 rounded bg-red-500 px-2 py-0.5 font-bold text-[10px] text-white shadow">
              熱銷
            </div>
          </div>
          <div className="flex flex-1 flex-col p-2.5">
            <h3 className="mb-1 line-clamp-2 font-medium text-gray-800 text-sm leading-snug">
              頂級挪威鮮切鮭魚菲力 (300g)
            </h3>
            <p className="product-description mb-0.5 text-gray-400 text-xs">
              嚴選大西洋鮭魚，定重切割、貼體包裝
            </p>
            <div className="mt-auto flex items-end justify-between pt-2">
              <div>
                <p className="font-bold text-base text-red-500 leading-none">
                  NT$ 380
                </p>
              </div>
              <button
                type="button"
                className="js-open-product-modal flex h-7 w-7 items-center justify-center rounded-full bg-salmon-500 text-white shadow-sm transition-transform hover:bg-salmon-600 active:scale-95"
                data-specs="300g 厚切|600g 雙片|1kg 家庭號"
              >
                <FontAwesomeIcon icon={faPlus} className="text-sm" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <div
        id="product-modal"
        className="fixed inset-0 z-50 hidden"
        aria-hidden="true"
      >
        <div
          id="product-modal-backdrop"
          className="absolute inset-0 bg-black/35 opacity-0 transition-opacity duration-200"
        ></div>

        <div
          id="product-modal-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-modal-title"
          className="absolute right-0 bottom-0 left-0 max-h-[86vh] translate-y-full overflow-y-auto rounded-t-3xl bg-white pb-safe shadow-2xl transition-transform duration-300"
        >
          <div className="flex items-center justify-between border-gray-100 border-b px-4 py-3">
            <h2
              id="product-modal-title"
              className="font-bold text-base text-gray-800"
            >
              商品選購
            </h2>
            <button
              type="button"
              id="product-modal-close"
              className="h-8 w-8 rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200"
              aria-label="關閉"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>

          <div className="space-y-4 p-4">
            <div className="flex gap-3">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-100">
                <img
                  id="modal-product-image"
                  src="/placeholder.jpg"
                  alt="商品圖片"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3
                  id="modal-product-name"
                  className="font-semibold text-gray-800 text-sm leading-snug"
                >
                  商品名稱
                </h3>
                <p
                  id="modal-product-desc"
                  className="mt-1 text-gray-500 text-xs"
                >
                  商品描述
                </p>
                <p
                  id="modal-product-price"
                  className="mt-2 font-bold text-lg text-red-500"
                >
                  NT$ 0
                </p>
              </div>
            </div>

            <div>
              <h4 className="mb-2 font-semibold text-gray-800 text-sm">
                商品規格
              </h4>
              <div
                id="modal-spec-options"
                className="grid grid-cols-2 gap-2"
              ></div>
            </div>

            <div>
              <h4 className="mb-2 font-semibold text-gray-800 text-sm">
                購買數量
              </h4>
              <div className="inline-flex items-center overflow-hidden rounded-xl border border-gray-200">
                <button
                  type="button"
                  id="modal-qty-minus"
                  className="h-10 w-10 bg-gray-50 text-gray-600 transition-transform hover:bg-gray-100 active:scale-95"
                  aria-label="減少數量"
                >
                  <FontAwesomeIcon icon={faMinus} className="text-xs" />
                </button>
                <input
                  type="number"
                  min="0"
                  step="1"
                  id="modal-qty-value"
                  value="1"
                  className="w-16 bg-white text-center font-semibold text-gray-800 focus:outline-none"
                  aria-label="輸入數量"
                />
                <button
                  type="button"
                  id="modal-qty-plus"
                  className="h-10 w-10 bg-gray-50 text-gray-600 transition-transform hover:bg-gray-100 active:scale-95"
                  aria-label="增加數量"
                >
                  <i className="fas fa-plus text-xs"></i>
                </button>
              </div>
            </div>

            <button
              type="button"
              id="modal-confirm-btn"
              className="w-full rounded-xl bg-salmon-500 py-3.5 font-semibold text-sm text-white shadow-md transition-all hover:bg-salmon-600 active:scale-[0.98]"
            >
              確定
            </button>
          </div>
        </div>
      </div>

      <nav className="fixed bottom-0 bottom-nav left-0 z-40 w-full border-gray-200 border-t bg-white pb-safe">
        <div className="flex h-14 items-center justify-around">
          <a
            href="/#"
            className="flex h-full w-full flex-col items-center justify-center text-salmon-500"
          >
            <FontAwesomeIcon icon={faStore} className="mb-0.5 text-lg" />
            <span className="font-medium text-[10px]">商品</span>
          </a>
          <a
            href="../orders/index.html"
            className="flex h-full w-full flex-col items-center justify-center text-gray-400 transition-colors hover:text-gray-600"
          >
            <FontAwesomeIcon icon={faFileInvoice} className="mb-0.5 text-lg" />
            <span className="font-medium text-[10px]">訂單</span>
          </a>
          <a
            href="/#"
            className="flex h-full w-full flex-col items-center justify-center text-gray-400 transition-colors hover:text-gray-600"
          >
            <FontAwesomeIcon icon={faUser} className="mb-0.5 text-lg" />
            <span className="font-medium text-[10px]">會員</span>
          </a>
        </div>
      </nav>
    </div>
  );
}
