"use client";

import NiceModal from "@ebay/nice-modal-react";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import numeral from "numeral";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";
import { useUserSettings } from "@/providers/user-settings-provider";
import {
  type Product,
  ProductDrawer,
  type ProductDrawerResult,
} from "./product-drawer";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { displayPrice } = useUserSettings();

  function handleAddToCart() {
    NiceModal.show(ProductDrawer, { product }).then((result) => {
      if (!result) return;
      const { product: selectedProduct, qty } = result as ProductDrawerResult;

      addItem(selectedProduct, qty);

      NiceModal.hide(ProductDrawer);
    });
  }

  return (
    <div className="product-item flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="relative bg-muted/50 pb-[100%]">
        {product.img_url ? (
          <img
            src={product.img_url}
            alt={product.name}
            className="absolute top-0 left-0 h-full w-full object-contain"
          />
        ) : (
          <div className="absolute top-0 left-0 h-full w-full animate-pulse bg-gray-100" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-2.5">
        <h3 className="mb-1 line-clamp-2 font-medium text-gray-800 text-sm leading-snug">
          {product.name}
        </h3>
        <p className="product-description mb-0.5 text-gray-400 text-xs">
          {product.description}
        </p>
        <div className="mt-auto flex items-end justify-between pt-2">
          <p
            className={cn(
              "font-bold text-base text-red-500 leading-none",
              !displayPrice && "invisible",
            )}
          >
            NT$ {numeral(product.unit_price).format("0,0")}
          </p>
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-salmon-500 text-white shadow-sm transition-transform hover:bg-salmon-600 active:scale-95"
          >
            <FontAwesomeIcon icon={faPlus} className="text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
}
