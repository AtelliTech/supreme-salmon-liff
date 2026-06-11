import { useEffect, useState } from "react";

const CART_KEY = "mowi_cart";
const CART_EVENT = "mowi-cart-updated";

export type CartItem = {
  product_id: string;
  product_img_url: string;
  product_name: string;
  product_desc: string;
  box_net_weight: number;
  unit_price: number;
  remark: string;
  qty: number;
};

function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_EVENT));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    return readCart();
  });

  useEffect(() => {
    const handler = () => setItems(readCart());
    window.addEventListener(CART_EVENT, handler);
    return () => window.removeEventListener(CART_EVENT, handler);
  }, []);

  function addItem(
    product: {
      id: string;
      img_url: string;
      name: string;
      description: string;
      box_net_weight: number;
      unit_price: number;
      remark: string;
    },
    qty: number,
  ) {
    if (qty <= 0) return;
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === product.id);
      const next = existing
        ? prev.map((i) =>
            i.product_id === product.id ? { ...i, qty: i.qty + qty } : i,
          )
        : [
            ...prev,
            {
              product_id: product.id,
              product_img_url: product.img_url,
              product_name: product.name,
              product_desc: product.description,
              box_net_weight: product.box_net_weight,
              unit_price: product.unit_price,
              remark: product.remark,
              qty,
            },
          ];
      writeCart(next);
      return next;
    });
  }

  function updateQty(productId: string, qty: number) {
    setItems((prev) => {
      const next =
        qty <= 0
          ? prev.filter((i) => i.product_id !== productId)
          : prev.map((i) => (i.product_id === productId ? { ...i, qty } : i));
      writeCart(next);
      return next;
    });
  }

  function removeItem(productId: string) {
    setItems((prev) => {
      const next = prev.filter((i) => i.product_id !== productId);
      writeCart(next);
      return next;
    });
  }

  function clearCart() {
    localStorage.removeItem(CART_KEY);
    window.dispatchEvent(new Event(CART_EVENT));
    setItems([]);
  }

  const totalCount = items.reduce((sum, i) => sum + i.qty, 0);

  return { items, totalCount, addItem, updateQty, removeItem, clearCart };
}
