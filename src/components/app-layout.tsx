"use client";

import NiceModal from "@ebay/nice-modal-react";
import { ReactQueryProvider } from "@/providers/query-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <NiceModal.Provider>
      <ReactQueryProvider>
        <div className="relative mx-auto flex h-dvh max-w-md flex-col overflow-hidden bg-background">
          {children}
        </div>
      </ReactQueryProvider>
    </NiceModal.Provider>
  );
}
