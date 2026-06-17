"use client";

import NiceModal from "@ebay/nice-modal-react";
import { Toaster } from "@/components/ui/sonner";
import { useLIFF } from "@/providers/liff-providers";
import { ReactQueryProvider } from "@/providers/query-provider";
import { UserSettingsProvider } from "@/providers/user-settings-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const { liff } = useLIFF();

  if (!liff) {
    return null;
  }

  return (
    <ReactQueryProvider>
      <UserSettingsProvider>
        <NiceModal.Provider>
          {children}
          <Toaster />
        </NiceModal.Provider>
      </UserSettingsProvider>
    </ReactQueryProvider>
  );
}
