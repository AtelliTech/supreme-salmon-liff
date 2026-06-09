"use client";

import NiceModal from "@ebay/nice-modal-react";
import { ReactQueryProvider } from "@/providers/query-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <NiceModal.Provider>
      <ReactQueryProvider>
        {children}
      </ReactQueryProvider>
    </NiceModal.Provider>
  );
}
