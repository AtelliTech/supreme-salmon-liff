"use client";

import NiceModal from "@ebay/nice-modal-react";
import { useLIFF } from "@/providers/liff-providers";
import { ReactQueryProvider } from "@/providers/query-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const { liff } = useLIFF();

  if (!liff) {
    return null;
  }

  return (
    <ReactQueryProvider>
      <NiceModal.Provider>{children}</NiceModal.Provider>
    </ReactQueryProvider>
  );
}
