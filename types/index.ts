export interface OrderItem {
  id: number;
  name: string;
  code: string;
  price: number;
  quantity: number;
  discount: number;
  subtotal: number;
  totalAfterDiscount: number;
  category: string;
  description: string;
}

export interface Sale {
  id: string;
  date: string;
  customerName: string;
  phoneNumber: string;
  total: number;
  tenderedAmount: number;
  change: number;
  items: OrderItem[];
}

export interface NewProduct {
  name: string;
  category: string;
  price: number;
  code: string;
  description: string;
} 