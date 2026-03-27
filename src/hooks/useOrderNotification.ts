import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const STATUS_LABELS: Record<string, string> = {
  pending: 'รอชำระเงิน',
  paid: 'ชำระเงินแล้ว',
  processing: 'กำลังเตรียมจัดส่ง',
  shipping: 'กำลังจัดส่ง',
  delivered: 'จัดส่งสำเร็จ',
  failed: 'ชำระเงินไม่สำเร็จ',
  refunded: 'คืนเงินแล้ว',
};

export function useOrderNotification(orderNumber: string | undefined) {
  const permissionAsked = useRef(false);

  // Request notification permission on mount
  useEffect(() => {
    if (!orderNumber || permissionAsked.current) return;
    if ('Notification' in window && Notification.permission === 'default') {
      permissionAsked.current = true;
      Notification.requestPermission();
    }
  }, [orderNumber]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!orderNumber) return;

    const channel = supabase
      .channel(`order-track-${orderNumber}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `order_number=eq.${orderNumber}`,
        },
        (payload) => {
          const newStatus = payload.new.status as string;
          const label = STATUS_LABELS[newStatus] || newStatus;
          const title = `คำสั่งซื้อ ${orderNumber}`;
          const body = `สถานะอัปเดต: ${label}`;

          // Toast notification (always works)
          toast({
            title,
            description: body,
          });

          // Browser push notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
              body,
              icon: '/favicon.ico',
              badge: '/favicon.ico',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderNumber]);
}
