"use client";

import { useEffect } from "react";
import { useLIFF } from "@/providers/liff-providers";

export default function Page() {
  const { liff } = useLIFF();

  // useEffect(() => {
  //   liff
  //     ?.getProfile()
  //     .then((profile) => {
  //       console.log("LIFF Profile:", profile);
  //     })
  //     .catch((err) => {
  //       console.error("Failed to get LIFF profile:", err);
  //     });
  // }, [liff]);

  return null;
}
