import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CartItem, CustomerInfo, PaymentMethod } from '@/types';

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipping' | 'delivered' | 'failed' | 'refunded';

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

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  createOrder: (items: CartItem[], customer: CustomerInfo, paymentMethod: PaymentMethod, subtotal: number, shipping: number, discount: number) => Promise<Order>;
  getOrder: (orderNumber: string) => Order | undefined;
  findOrder: (orderNumber: string, contact: string) => Promise<Order | undefined>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updatePaymentStatus: (orderId: string, status: 'pending' | 'paid' | 'failed' | 'refunded') => void;
  simulatePayment: (orderId: string) => Promise<boolean>;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

function generateOrderNumber(): string {
  const prefix = 'DA';
  const ts = Date.now().toString(36).toUpperCase().slice(-4);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `${prefix}${ts}${rand}`;
}

function dbRowToOrder(row: any): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    items: (row.items || []) as CartItem[],
    customer: {
      name: row.customer_name,
      phone: row.customer_phone,
      email: row.customer_email,
      address: row.customer_address,
      province: row.province,
      postalCode: row.postal_code,
      note: row.note || '',
      couponCode: row.coupon_code || '',
    },
    subtotal: row.subtotal,
    shipping: row.shipping,
    discount: row.discount,
    total: row.total,
    status: row.status as OrderStatus,
    paymentMethod: row.payment_method as PaymentMethod,
    paymentStatus: row.payment_status as 'pending' | 'paid' | 'failed' | 'refunded',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    trackingNumber: row.tracking_number,
  };
}

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshOrders = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) {
      setOrders(data.map(dbRowToOrder));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  const createOrder = useCallback(async (
    items: CartItem[],
    customer: CustomerInfo,
    paymentMethod: PaymentMethod,
    subtotal: number,
    shipping: number,
    discount: number,
  ): Promise<Order> => {
    const orderNumber = generateOrderNumber();
    const total = subtotal + shipping - discount;

    const { data, error } = await supabase.from('orders').insert({
      order_number: orderNumber,
      items: items as any,
      customer_name: customer.name,
      customer_phone: customer.phone,
      customer_email: customer.email,
      customer_address: customer.address,
      province: customer.province,
      postal_code: customer.postalCode,
      note: customer.note,
      coupon_code: customer.couponCode,
      subtotal,
      shipping,
      discount,
      total,
      status: 'pending' as any,
      payment_method: paymentMethod as any,
      payment_status: 'pending' as any,
    }).select().single();

    if (error) throw error;

    const order = dbRowToOrder(data);
    setOrders(prev => [order, ...prev]);
    return order;
  }, []);

  const getOrder = useCallback((orderNumber: string) => {
    return orders.find(o => o.orderNumber === orderNumber);
  }, [orders]);

  const findOrder = useCallback(async (orderNumber: string, contact: string): Promise<Order | undefined> => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .ilike('order_number', orderNumber)
      .or(`customer_phone.eq.${contact},customer_email.ilike.${contact}`)
      .maybeSingle();
    return data ? dbRowToOrder(data) : undefined;
  }, []);

  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    await supabase.from('orders').update({ status: status as any }).eq('id', orderId);
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o
    ));
  }, []);

  const updatePaymentStatus = useCallback((orderId: string, status: 'pending' | 'paid' | 'failed' | 'refunded') => {
    const newStatus: OrderStatus = status === 'paid' ? 'paid' : status === 'failed' ? 'failed' : status === 'refunded' ? 'refunded' : 'pending';
    supabase.from('orders').update({ payment_status: status as any, status: newStatus as any }).eq('id', orderId);
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      return { ...o, paymentStatus: status, status: newStatus, updatedAt: new Date().toISOString() };
    }));
  }, []);

  const simulatePayment = useCallback(async (orderId: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 2500));
    const success = Math.random() > 0.1;
    if (success) {
      updatePaymentStatus(orderId, 'paid');
    } else {
      updatePaymentStatus(orderId, 'failed');
    }
    return success;
  }, [updatePaymentStatus]);

  return (
    <OrderContext.Provider value={{ orders, loading, createOrder, getOrder, findOrder, updateOrderStatus, updatePaymentStatus, simulatePayment, refreshOrders }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrders must be used within OrderProvider');
  return ctx;
};
