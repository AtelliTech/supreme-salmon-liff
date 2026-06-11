import { faTruck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type Props = {
  customer: { name: string };
  address: { name: string; address: string };
  remark: string;
};

export function OrderDeliveryCard({ customer, address, remark }: Props) {
  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center border-gray-100 border-b bg-gray-50/50 px-4 py-3">
        <FontAwesomeIcon icon={faTruck} className="mr-2 text-gray-400" />
        <h3 className="font-bold text-gray-700 text-sm">配送資訊</h3>
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between">
          <span className="mt-0.5 w-20 shrink-0 font-medium text-gray-500 text-xs">
            收件人
          </span>
          <span className="text-right font-medium text-gray-800 text-sm">
            {customer.name}
          </span>
        </div>
        <div className="flex items-start justify-between">
          <span className="mt-0.5 w-20 shrink-0 font-medium text-gray-500 text-xs">
            店別
          </span>
          <span className="text-right font-medium text-gray-800 text-sm">
            {address.name}
          </span>
        </div>
        <div className="flex items-start justify-between">
          <span className="mt-0.5 w-20 shrink-0 font-medium text-gray-500 text-xs">
            收件地址
          </span>
          <span className="text-right font-medium text-gray-800 text-sm leading-relaxed">
            {address.address}
          </span>
        </div>
        {remark && (
          <div className="flex items-start justify-between">
            <span className="mt-0.5 w-20 shrink-0 font-medium text-gray-500 text-xs">
              訂單備註
            </span>
            <span className="text-right font-medium text-gray-800 text-sm">
              {remark}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
