export type OrderDetailItem = {
  product_id: string;
  product_img_url: string;
  product_name: string;
  product_desc: string;
  unit: string;
  quantity: number;
  weight: number;
  box_net_weight: number;
  price: number;
  deal_price: number;
  sub_total: number;
  final_quantity: number;
  final_weight: number;
  final_total: number;
  remark: string;
};

export type OrderDetail = {
  id: number;
  order_date: string;
  number: string;
  deliver_date: string;
  address: { id: string; name: string; address: string };
  customer: { id: string; name: string; vat_id: string };
  division: { id: string; name: string };
  remark: string;
  amount: number;
  final_amount: number;
  state: number;
  ship_status: number;
  items: OrderDetailItem[];
};

export type OrderDetailResponse = {
  status: string;
  code: number;
  data: OrderDetail;
};
