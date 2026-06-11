"use client";

import NiceModal, { useModal } from "@ebay/nice-modal-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
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
            <AlertDialogTitle>切換店家？</AlertDialogTitle>
            <AlertDialogDescription>
              目前選擇：{customer.customer_name} · {customer.division_name}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleKeep}>否</AlertDialogCancel>
            <AlertDialogAction onClick={handleSwitch}>是</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  },
);
