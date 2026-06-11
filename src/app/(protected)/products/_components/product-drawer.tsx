"use client";

import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { faMinus, faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import numeral from "numeral";
import { useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";

export type Product = {
  id: string;
  img_url: string;
  name: string;
  description: string;
  box_net_weight: number;
  unit_price: number;
  remark: string;
  category: { id: number; name: string };
};

export type ProductsResponse = {
  status: string;
  code: number;
  data: Product[];
  meta: {
    page: number;
    page_size: number;
    total_count: number;
    page_count: number;
  };
};

export const ProductDrawer = NiceModal.create<{ product: Product }>(
  ({ product }) => {
    const modal = useModal();
    const [qty, setQty] = useState(1);

    return (
      <Drawer open={modal.visible} onOpenChange={() => modal.hide()}>
        <DrawerContent className="max-h-[86vh] rounded-t-3xl pb-safe">
          <DrawerTitle className="hidden" />
          <DrawerDescription className="hidden" />
          <div className="flex items-center justify-between border-gray-100 border-b px-4 py-3">
            <h2 className="font-bold text-base text-gray-800">商品選購</h2>
            <DrawerClose asChild>
              <button
                type="button"
                className="h-8 w-8 rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200"
                aria-label="關閉"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </DrawerClose>
          </div>

          <div className="space-y-4 overflow-y-auto p-4">
            <div className="flex gap-3">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-100">
                <img
                  src={product.img_url || "/placeholder.jpg"}
                  alt={product.name}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-800 text-sm leading-snug">
                  {product.name}
                </h3>
                <p className="mt-1 text-gray-500 text-xs">
                  {product.description}
                </p>
                <p className="mt-2 font-bold text-lg text-red-500">
                  NT$ {numeral(product.unit_price).format("0,0")}
                </p>
              </div>
            </div>

            <div>
              <h4 className="mb-2 font-semibold text-gray-800 text-sm">
                購買數量
              </h4>
              <div className="inline-flex items-center overflow-hidden rounded-xl border border-gray-200">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="h-10 w-10 bg-gray-50 text-gray-600 transition-transform hover:bg-gray-100 active:scale-95"
                  aria-label="減少數量"
                >
                  <FontAwesomeIcon icon={faMinus} className="text-xs" />
                </button>
                <span className="w-16 bg-white text-center font-semibold text-gray-800">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  className="h-10 w-10 bg-gray-50 text-gray-600 transition-transform hover:bg-gray-100 active:scale-95"
                  aria-label="增加數量"
                >
                  <FontAwesomeIcon icon={faPlus} className="text-xs" />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => modal.resolve({ product, qty })}
              className="w-full rounded-xl bg-salmon-500 py-3.5 font-semibold text-sm text-white shadow-md transition-all hover:bg-salmon-600 active:scale-[0.98]"
            >
              確定
            </button>
          </div>
        </DrawerContent>
      </Drawer>
    );
  },
);
