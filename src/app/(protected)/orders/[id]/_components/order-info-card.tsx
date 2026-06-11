"use client";

import { faCopy } from "@fortawesome/free-regular-svg-icons";
import { faFileInvoice } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs from "dayjs";

type Props = {
  number: string;
  order_date: string;
};

export function OrderInfoCard({ number, order_date }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center border-gray-100 border-b bg-gray-50/50 px-4 py-3">
        <FontAwesomeIcon icon={faFileInvoice} className="mr-2 text-gray-400" />
        <h3 className="font-bold text-gray-700 text-sm">訂單資訊</h3>
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between">
          <span className="w-20 shrink-0 font-medium text-gray-500 text-xs">
            訂單編號
          </span>
          <div className="flex items-center gap-2 font-medium text-gray-800 text-sm">
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(number)}
              className="flex h-6 w-6 items-center justify-center rounded-md bg-salmon-50 text-salmon-500 transition-colors hover:text-salmon-600 focus:outline-none"
            >
              <FontAwesomeIcon icon={faCopy} className="text-[10px]" />
            </button>
            <span>#{number}</span>
          </div>
        </div>
        <div className="flex items-start justify-between">
          <span className="mt-0.5 w-20 shrink-0 font-medium text-gray-500 text-xs">
            訂購時間
          </span>
          <span className="text-right font-medium text-gray-800 text-sm">
            {dayjs(order_date).format("YYYY/MM/DD HH:mm")}
          </span>
        </div>
      </div>
    </div>
  );
}
