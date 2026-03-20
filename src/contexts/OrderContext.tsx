import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Order, OrderStatus, CartItem, CustomerInfo, PaymentMethod } from '@/types';

interface OrderContextType {
  orders: Order[];
  createOrder: (items: CartItem[], customer: CustomerInfo, paymentMethod: PaymentMethod, subtotal: number, shipping: number, discount: number) => Order;
  getOrder: (orderNumber: string) => Order | undefined;
  findOrder: (orderNumber: string, contact: string) => Order | undefined;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updatePaymentStatus: (orderId: string, status: 'pending' | 'paid' | 'failed' | 'refunded') => void;
  simulatePayment: (orderId: string) => Promise<boolean>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

function generateOrderNumber(): string {
  const prefix = 'DA';
  const ts = Date.now().toString(36).toUpperCase().slice(-4);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `${prefix}${ts}${rand}`;
}

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem('orders');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const createOrder = useCallback((
    items: CartItem[],
    customer: CustomerInfo,
    paymentMethod: PaymentMethod,
    subtotal: number,
    shipping: number,
    discount: number,
  ): Order => {
    const now = new Date().toISOString();
    const order: Order = {
      id: crypto.randomUUID(),
      orderNumber: generateOrderNumber(),
      items,
      customer,
      subtotal,
      shipping,
      discount,
      total: subtotal + shipping - discount,
      status: 'pending',
      paymentMethod,
      paymentStatus: 'pending',
      createdAt: now,
      updatedAt: now,
    };
    setOrders(prev => [order, ...prev]);
    return order;
  }, []);

  const getOrder = useCallback((orderNumber: string) => {
    return orders.find(o => o.orderNumber === orderNumber);
  }, [orders]);

  const findOrder = useCallback((orderNumber: string, contact: string) => {
    return orders.find(o =>
      o.orderNumber.toLowerCase() === orderNumber.toLowerCase() &&
      (o.customer.phone === contact || o.customer.email.toLowerCase() === contact.toLowerCase())
    );
  }, [orders]);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o
    ));
  }, []);

  const updatePaymentStatus = useCallback((orderId: string, status: 'pending' | 'paid' | 'failed' | 'refunded') => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const newStatus: OrderStatus = status === 'paid' ? 'paid' : status === 'failed' ? 'failed' : status === 'refunded' ? 'refunded' : o.status;
      return { ...o, paymentStatus: status, status: newStatus, updatedAt: new Date().toISOString() };
    }));
  }, []);

  const simulatePayment = useCallback(async (orderId: string): Promise<boolean> => {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    const success = Math.random() > 0.1; // 90% success rate
    if (success) {
      updatePaymentStatus(orderId, 'paid');
    } else {
      updatePaymentStatus(orderId, 'failed');
    }
    return success;
  }, [updatePaymentStatus]);

  return (
    <OrderContext.Provider value={{ orders, createOrder, getOrder, findOrder, updateOrderStatus, updatePaymentStatus, simulatePayment }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrders must be used within OrderProvider');
  return ctx;
};
