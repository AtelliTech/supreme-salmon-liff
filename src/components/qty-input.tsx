"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function QtyInput({
  qty,
  onCommit,
  className,
}: {
  qty: number;
  onCommit: (qty: number) => void;
  className?: string;
}) {
  const [text, setText] = useState(String(qty));

  useEffect(() => {
    setText(String(qty));
  }, [qty]);

  return (
    <input
      type="number"
      min="1"
      step="1"
      inputMode="numeric"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => {
        const parsed = Math.max(1, Math.floor(Number(text)) || 1);
        setText(String(parsed));
        onCommit(parsed);
      }}
      className={cn(
        "w-14 bg-white text-center font-semibold text-gray-800 focus:outline-none",
        className,
      )}
      aria-label="輸入數量"
    />
  );
}
