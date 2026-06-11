"use client";

import NiceModal, { useModal } from "@ebay/nice-modal-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Customer } from "./store-select-drawer";

export const SwitchStoreDialog = NiceModal.create<{ customer: Customer }>(
  ({ customer }) => {
    const modal = useModal();

    function handleKeep() {
      modal.resolve(false);
      modal.hide();
    }

    function handleSwitch() {
      modal.resolve(true);
      modal.hide();
    }

    return (
      <AlertDialog open={modal.visible} onOpenChange={() => {}}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              繼續使用 {customer.customer_name} · {customer.division_name} 嗎？
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleSwitch}>
              否，我要切換店家
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleKeep}>
              是，繼續使用
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  },
);
