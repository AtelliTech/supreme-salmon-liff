"use client";

import { faUser } from "@fortawesome/free-regular-svg-icons";
import { faFileInvoice, faStore } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { usePathname } from "next/navigation";

export function NavBottom() {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    pathname.startsWith(href)
      ? "flex h-full w-full flex-col items-center justify-center text-salmon-500"
      : "flex h-full w-full flex-col items-center justify-center text-gray-400 transition-colors hover:text-gray-600";

  return (
    <nav className="fixed bottom-0 bottom-nav left-0 z-40 w-full border-gray-200 border-t bg-white pb-safe">
      <div className="flex h-14 items-center justify-around">
        <a href="/products" className={linkClass("/products")}>
          <FontAwesomeIcon icon={faStore} className="mb-0.5 text-lg" />
          <span className="font-medium text-[10px]">商品</span>
        </a>
        <a href="/orders" className={linkClass("/orders")}>
          <FontAwesomeIcon icon={faFileInvoice} className="mb-0.5 text-lg" />
          <span className="font-medium text-[10px]">訂單</span>
        </a>
        <a href="/profile" className={linkClass("/profile")}>
          <FontAwesomeIcon icon={faUser} className="mb-0.5 text-lg" />
          <span className="font-medium text-[10px]">會員</span>
        </a>
      </div>
    </nav>
  );
}
