"use client";

import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { ChevronRight, X } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import { match } from "ts-pattern";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";

type Severity = "info" | "warning" | "critical";
type EventType =
  | "ad_account_credential_inaccessible"
  | "meta_campaign_sync_failed"
  | "spreadsheet_inaccessible"
  | "should_enable_but_disabled"
  | "should_disable_but_enabled";

type EventBatchItem = {
  id?: string;
  batch?: number;
  event?: string;
  spreadsheet_title?: string;
  spreadsheet_url?: string;
  sheet_title?: string;
  brief_title?: string;
  severity?: Severity;
  suggestion?: string;
  last_monitored_at?: number;
};

type ApiResponse = {
  _data: EventBatchItem[];
  _meta: { page: number; pageSize: number; total: number; pageCount: number };
};

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  ad_account_credential_inaccessible: "廣告帳號憑證無法存取",
  meta_campaign_sync_failed: "Meta 廣告活動同步失敗",
  spreadsheet_inaccessible: "試算表無法存取",
  should_enable_but_disabled: "應啟用但已停用",
  should_disable_but_enabled: "應停用但已啟用",
};

function formatTimestamp(ts: number | undefined): string {
  if (!ts) return "—";
  return new Date(ts * 1000).toLocaleString();
}

function SeverityDot({ severity }: { severity?: Severity }) {
  const { dotClass, label } = match(severity)
    .with("critical", () => ({ dotClass: "bg-destructive", label: "嚴重" }))
    .with("warning", () => ({ dotClass: "bg-amber-400", label: "警告" }))
    .with("info", () => ({ dotClass: "bg-blue-400", label: "資訊" }))
    .otherwise(() => ({
      dotClass: "bg-muted-foreground",
      label: severity ?? "—",
    }));

  return (
    <div className="flex items-center gap-1.5">
      <span className={`size-2 shrink-0 rounded-full ${dotClass}`} />
      <span className="font-medium text-xs">{label}</span>
    </div>
  );
}

export default function BatchEventDrawer() {
  const [bid, setBid] = useQueryState("bid", parseAsInteger);
  const [prevBid, setPrevBid] = useState(bid);
  const [severity, setSeverity] = useState<Severity | "">("");
  const [eventType, setEventType] = useState<EventType | "">("");

  if (prevBid !== bid) {
    setPrevBid(bid);
    setSeverity("");
    setEventType("");
  }

  const { data, isLoading } = useQuery<ApiResponse>({
    queryKey: ["/api/events/batch/search", { bid, severity, eventType }],
    queryFn: async () => {
      const res = await ky.post(`/api/events/batch/${bid}/search`, {
        json: {
          page: 1,
          pageSize: 50,
          sort: "-id",
          ...(severity && { severity }),
          ...(eventType && { eventType }),
        },
      });

      return res.json();
    },
    enabled: bid !== null,
  });

  const events = data?._data ?? [];

  return (
    <Drawer open={bid !== null} onOpenChange={(open) => !open && setBid(null)}>
      <DrawerContent>
        <DrawerHeader className="pb-2">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-left">事件 #{bid}</DrawerTitle>
            <button
              type="button"
              onClick={() => setBid(null)}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
          {/* <div className="flex gap-2 pt-2">
                        <Select value={severity} onValueChange={(v) => setSeverity(v === "all" ? "" : (v as Severity))}>
                            <SelectTrigger className="w-36">
                                <SelectValue placeholder="所有嚴重程度" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">所有嚴重程度</SelectItem>
                                <SelectItem value="info">資訊</SelectItem>
                                <SelectItem value="warning">警告</SelectItem>
                                <SelectItem value="critical">嚴重</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={eventType} onValueChange={(v) => setEventType(v === "all" ? "" : (v as EventType))}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="所有事件類型" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">所有事件類型</SelectItem>
                                {(Object.keys(EVENT_TYPE_LABELS) as EventType[]).map((et) => (
                                    <SelectItem key={et} value={et}>
                                        {EVENT_TYPE_LABELS[et]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div> */}
        </DrawerHeader>

        <div className="overflow-y-auto pb-4">
          {isLoading && (
            <div className="flex flex-col gap-px px-4 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          )}

          {!isLoading && events.length === 0 && (
            <p className="py-12 text-center text-muted-foreground text-sm">
              此批次沒有事件紀錄。
            </p>
          )}

          {!isLoading &&
            events.map((item) => (
              <a
                key={item.id}
                href={item.spreadsheet_url ?? undefined}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 border-b px-4 py-3 text-sm active:bg-muted/60"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center gap-2">
                    <SeverityDot severity={item.severity} />
                    <span className="truncate text-muted-foreground text-xs">
                      {(item.event &&
                        EVENT_TYPE_LABELS[item.event as EventType]) ??
                        item.event ??
                        "—"}
                    </span>
                  </div>
                  <p className="truncate font-medium">
                    {item.brief_title ?? "—"}
                  </p>
                  <p className="truncate text-muted-foreground text-xs">
                    {item.spreadsheet_title}
                    {item.sheet_title ? ` › ${item.sheet_title}` : ""}
                  </p>
                  {item.suggestion && (
                    <p className="mt-0.5 truncate text-muted-foreground text-xs">
                      {item.suggestion}
                    </p>
                  )}
                  <p className="mt-0.5 text-muted-foreground text-xs">
                    {formatTimestamp(item.last_monitored_at)}
                  </p>
                </div>
                {item.spreadsheet_url && (
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                )}
              </a>
            ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
