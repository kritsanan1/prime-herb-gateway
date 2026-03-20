export interface Product {
  id: string;
  name: string;
  description: string;
  shortDesc: string;
  price: number;
  originalPrice?: number;
  image: string;
  stock: number;
  features: string[];
  category: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  province: string;
  postalCode: string;
  note: string;
  couponCode: string;
}

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipping' | 'delivered' | 'failed' | 'refunded';
export type PaymentMethod = 'promptpay' | 'credit_card' | 'bank_transfer';

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  customer: CustomerInfo;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'รอชำระเงิน',
  paid: 'ชำระเงินแล้ว',
  processing: 'กำลังเตรียมจัดส่ง',
  shipping: 'กำลังจัดส่ง',
  delivered: 'จัดส่งสำเร็จ',
  failed: 'ชำระเงินไม่สำเร็จ',
  refunded: 'คืนเงินแล้ว',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  promptpay: 'PromptPay / QR Payment',
  credit_card: 'บัตรเครดิต / เดบิต',
  bank_transfer: 'โอนผ่านธนาคาร',
};
