"use client";

import {
  faCircleExclamation,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { forwardRef } from "react";

export const CancelOrderDialog = forwardRef<HTMLDialogElement>(
  function CancelOrderDialog(_, ref) {
    function close() {
      if (typeof ref === "object" && ref?.current) ref.current.close();
    }

    return (
      <dialog
        ref={ref}
        className="fixed inset-0 z-50 m-0 h-full w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-transparent"
        aria-labelledby="cancel-order-modal-title"
        aria-describedby="cancel-order-modal-content"
        onClick={(e) => {
          if (typeof ref === "object" && e.target === ref?.current) close();
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") close();
        }}
      >
        <div className="flex h-full items-center justify-center bg-gray-900/45 px-4 py-6">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start gap-3 border-gray-100 border-b px-5 pt-5 pb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-salmon-50 text-salmon-500">
                <FontAwesomeIcon
                  icon={faCircleExclamation}
                  className="text-base"
                />
              </div>
              <div className="flex-1">
                <h2
                  id="cancel-order-modal-title"
                  className="font-bold text-base text-gray-800"
                >
                  取消訂單
                </h2>
                <p
                  id="cancel-order-modal-content"
                  className="mt-1 text-gray-500 text-sm leading-6"
                >
                  取消後將停止目前訂單流程。請再次確認是否要繼續。
                </p>
              </div>
              <button
                type="button"
                className="h-8 w-8 rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                aria-label="關閉確認視窗"
                onClick={close}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <div className="bg-gray-50/80 px-5 py-4 text-gray-500 text-xs leading-5">
              若仍需保留內容，請先返回檢查後再決定是否取消。
            </div>
            <div className="grid grid-cols-2 gap-3 p-4">
              <button
                type="button"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-600 text-sm transition-colors hover:bg-gray-50"
                onClick={close}
              >
                先保留訂單
              </button>
              <button
                type="button"
                id="confirm-cancel-order"
                className="w-full rounded-xl bg-salmon-500 px-4 py-3 font-semibold text-sm text-white shadow-md transition-colors hover:bg-salmon-600"
              >
                取消訂單
              </button>
            </div>
          </div>
        </div>
      </dialog>
    );
  },
);
