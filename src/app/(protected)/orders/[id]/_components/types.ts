export type OrderDetailItem = {
  product_id: string;
  product_img_url: string;
  product_name: string;
  product_desc: string;
  unit: string;
  quantity: number;
  price: number;
  remark: string;
};

export type OrderDetail = {
  id: number;
  order_date: string;
  number: string;
  deliver_date: string;
  address: { id: string; name: string; address: string };
  customer: { id: string; name: string; vat_id: string };
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
