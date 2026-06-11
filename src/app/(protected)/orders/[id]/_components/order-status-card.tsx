import { faBoxOpen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getOrderStatus } from "../../_components/order-card";

type OrderStatus = ReturnType<typeof getOrderStatus>;

const STATUS_DISPLAY: Record<OrderStatus, { title: string; desc: string }> = {
  processing: {
    title: "商家處理中",
    desc: "預計於 1-2 個工作天內出貨及配發單號",
  },
  established: { title: "訂單已成立", desc: "商家已確認訂單" },
  pending: { title: "待收貨", desc: "商品已出貨，請注意配送狀態" },
  completed: { title: "訂單已完成", desc: "感謝您的訂購" },
  cancelled: { title: "訂單已取消", desc: "如有問題請聯繫客服" },
};

export function OrderStatusCard({ state }: { state: number }) {
  const orderStatus = getOrderStatus(state);
  const { title, desc } = STATUS_DISPLAY[orderStatus];

  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 text-center shadow-sm">
      <div className="relative z-10 mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full border border-salmon-200 bg-salmon-100 text-salmon-500 shadow-sm">
        <FontAwesomeIcon icon={faBoxOpen} className="text-2xl" />
      </div>
      <h2 className="relative z-10 mb-1 font-bold text-gray-800 text-xl">
        {title}
      </h2>
      <p className="relative z-10 text-gray-500 text-sm">{desc}</p>
    </div>
  );
}
