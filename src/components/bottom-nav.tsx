"use client";

import { Bell, LayoutDashboard, List, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "總覽", icon: LayoutDashboard, href: "/overview" },
  { label: "列表", icon: List, href: "/briefs" },
  { label: "建立", icon: Plus, href: "/sheet-start", isCreate: true },
  { label: "通知", icon: Bell, href: "/notifications" },
  { label: "設定", icon: Settings, href: "/settings" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="flex h-16 shrink-0 items-stretch border-border border-t bg-background">
      {NAV_ITEMS.map(({ label, icon: Icon, href, isCreate }) =>
        isCreate ? (
          <Link
            key={label}
            href={href}
            className="flex flex-1 flex-col items-center justify-center gap-0.5"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
              <Icon size={22} strokeWidth={2.5} />
            </span>
          </Link>
        ) : (
          <Link
            key={label}
            href={href}
            className={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${pathname === href ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Icon size={22} strokeWidth={1.75} />
            <span className="font-medium text-[10px] leading-none">
              {label}
            </span>
          </Link>
        ),
      )}
    </nav>
  );
}
