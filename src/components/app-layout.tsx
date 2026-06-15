"use client";

import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";
import { useLIFF } from "@/providers/liff-providers";

library.add(fas, far, fab);

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { liff } = useLIFF();

  useEffect(() => {
    if (liff && !liff.isLoggedIn()) {
      liff.login();
    } else {
      console.log("LIFF is ready and user is logged in");
    }
  }, [liff]);

  return children;
}
