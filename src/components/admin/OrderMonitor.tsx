import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@/types';
import { Bell, Clock, Package, DollarSign, User, Phone, Wifi, WifiOff } from 'lucide-react';

interface RealtimeOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  total: number;
  status: string;
  payment_status: string;
  payment_method: string;
  items: any;
  created_at: string;
  updated_at: string;
}

interface OrderEvent {
  type: 'INSERT' | 'UPDATE';
  order: RealtimeOrder;
  timestamp: Date;
}

export default function OrderMonitor() {
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [recentOrders, setRecentOrders] = useState<RealtimeOrder[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load recent orders on mount
  useEffect(() => {
    async function loadRecent() {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (data) setRecentOrders(data as unknown as RealtimeOrder[]);
    }
    loadRecent();
  }, []);

  // Subscribe to realtime changes
  useEffect(() => {
    const channel = supabase
      .channel('admin-order-monitor')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          const order = (payload.new || payload.old) as unknown as RealtimeOrder;
          const eventType = payload.eventType as 'INSERT' | 'UPDATE';
          
          const newEvent: OrderEvent = {
            type: eventType,
            order,
            timestamp: new Date(),
          };

          setEvents(prev => [newEvent, ...prev].slice(0, 50));

          if (eventType === 'INSERT') {
            setRecentOrders(prev => [order, ...prev].slice(0, 20));
            // Play notification sound for new orders
            try {
              const ctx = new AudioContext();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.frequency.value = 800;
              gain.gain.value = 0.1;
              osc.start();
              osc.stop(ctx.currentTime + 0.15);
              setTimeout(() => {
                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.connect(gain2);
                gain2.connect(ctx.destination);
                osc2.frequency.value = 1200;
                gain2.gain.value = 0.1;
                osc2.start();
                osc2.stop(ctx.currentTime + 0.15);
              }, 150);
            } catch {}
          } else if (eventType === 'UPDATE') {
            setRecentOrders(prev =>
              prev.map(o => o.id === order.id ? order : o)
            );
          }
        }
      )
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const statusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-emerald-400 bg-emerald-400/10';
      case 'processing': return 'text-amber-400 bg-amber-400/10';
      case 'shipping': return 'text-blue-400 bg-blue-400/10';
      case 'delivered': return 'text-emerald-500 bg-emerald-500/10';
      case 'failed': return 'text-red-400 bg-red-400/10';
      case 'refunded': return 'text-purple-400 bg-purple-400/10';
      default: return 'text-muted-foreground bg-secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with connection status */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <Bell className="w-6 h-6 text-primary" /> Order Monitor
        </h2>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-thai ${
          connected ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'
        }`}>
          {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {connected ? 'เชื่อมต่อ Realtime' : 'กำลังเชื่อมต่อ...'}
          {connected && <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />}
        </div>
      </div>

      {/* Live event feed */}
      <div className="bg-gradient-card border border-border rounded-xl p-5 shadow-card">
        <h3 className="text-sm font-thai font-medium text-foreground mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          กิจกรรมล่าสุด (Live)
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          <AnimatePresence initial={false}>
            {events.length === 0 ? (
              <p className="text-xs text-muted-foreground font-thai text-center py-8">
                รอรับเหตุการณ์ใหม่... ระบบจะอัปเดตอัตโนมัติ
              </p>
            ) : (
              events.map((e, i) => (
                <motion.div
                  key={`${e.order.id}-${e.timestamp.getTime()}`}
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs ${
                    e.type === 'INSERT'
                      ? 'bg-primary/5 border border-primary/20'
                      : 'bg-secondary/50 border border-border/50'
                  }`}
                >
                  <span className={`shrink-0 px-1.5 py-0.5 rounded font-mono text-[10px] ${
                    e.type === 'INSERT' ? 'bg-primary/20 text-primary' : 'bg-blue-400/20 text-blue-400'
                  }`}>
                    {e.type === 'INSERT' ? 'NEW' : 'UPD'}
                  </span>
                  <span className="font-mono text-primary">{e.order.order_number}</span>
                  <span className="font-thai text-muted-foreground">{e.order.customer_name}</span>
                  <span className={`px-1.5 py-0.5 rounded font-thai ${statusColor(e.order.status)}`}>
                    {ORDER_STATUS_LABELS[e.order.status as keyof typeof ORDER_STATUS_LABELS] || e.order.status}
                  </span>
                  <span className="ml-auto text-muted-foreground/60">
                    {e.timestamp.toLocaleTimeString('th-TH')}
                  </span>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Recent orders grid */}
      <div className="bg-gradient-card border border-border rounded-xl p-5 shadow-card">
        <h3 className="text-sm font-thai font-medium text-foreground mb-4 flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" />
          ออเดอร์ล่าสุด (อัปเดตอัตโนมัติ)
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence initial={false}>
            {recentOrders.map(o => (
              <motion.div
                key={o.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-background/50 border border-border/60 rounded-xl p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-primary text-sm font-medium">{o.order_number}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-thai ${statusColor(o.status)}`}>
                    {ORDER_STATUS_LABELS[o.status as keyof typeof ORDER_STATUS_LABELS] || o.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="w-3 h-3" />
                  <span className="font-thai">{o.customer_name}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="w-3 h-3" />
                  <span>{o.customer_phone}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border/40">
                  <span className="text-xs text-muted-foreground font-thai">
                    {PAYMENT_METHOD_LABELS[o.payment_method as keyof typeof PAYMENT_METHOD_LABELS] || o.payment_method}
                  </span>
                  <span className="text-sm font-display font-bold text-foreground flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-primary" />
                    ฿{Number(o.total).toLocaleString()}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground/50">
                  {new Date(o.created_at).toLocaleString('th-TH')}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
