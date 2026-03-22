import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { Order } from '@/contexts/OrderContext';
import { TrendingUp, Calendar, DollarSign, ShoppingBag } from 'lucide-react';

type Range = 'daily' | 'weekly' | 'monthly';

interface Props {
  orders: Order[];
}

function groupByDay(orders: Order[]) {
  const map = new Map<string, { revenue: number; count: number }>();
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    map.set(key, { revenue: 0, count: 0 });
  }
  orders.filter(o => o.paymentStatus === 'paid').forEach(o => {
    const key = new Date(o.createdAt).toISOString().slice(0, 10);
    const existing = map.get(key);
    if (existing) {
      existing.revenue += o.total;
      existing.count += 1;
    }
  });
  return Array.from(map.entries()).map(([date, v]) => ({
    label: `${date.slice(8, 10)}/${date.slice(5, 7)}`,
    ...v,
  }));
}

function groupByWeek(orders: Order[]) {
  const map = new Map<string, { revenue: number; count: number }>();
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = weekStart.toISOString().slice(0, 10);
    map.set(key, { revenue: 0, count: 0 });
  }
  orders.filter(o => o.paymentStatus === 'paid').forEach(o => {
    const d = new Date(o.createdAt);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = weekStart.toISOString().slice(0, 10);
    const existing = map.get(key);
    if (existing) {
      existing.revenue += o.total;
      existing.count += 1;
    }
  });
  return Array.from(map.entries()).map(([date, v]) => ({
    label: `${date.slice(8, 10)}/${date.slice(5, 7)}`,
    ...v,
  }));
}

function groupByMonth(orders: Order[]) {
  const map = new Map<string, { revenue: number; count: number }>();
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    map.set(key, { revenue: 0, count: 0 });
  }
  orders.filter(o => o.paymentStatus === 'paid').forEach(o => {
    const d = new Date(o.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const existing = map.get(key);
    if (existing) {
      existing.revenue += o.total;
      existing.count += 1;
    }
  });
  const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  return Array.from(map.entries()).map(([key, v]) => ({
    label: monthNames[parseInt(key.slice(5)) - 1],
    ...v,
  }));
}

const RANGE_LABELS: Record<Range, string> = {
  daily: 'รายวัน (30 วัน)',
  weekly: 'รายสัปดาห์ (12 สัปดาห์)',
  monthly: 'รายเดือน (12 เดือน)',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
      <p className="text-xs text-muted-foreground font-thai mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="text-sm font-thai text-foreground">
          {p.dataKey === 'revenue' ? `฿${p.value.toLocaleString()}` : `${p.value} ออเดอร์`}
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsDashboard({ orders }: Props) {
  const [range, setRange] = useState<Range>('daily');

  const data = useMemo(() => {
    if (range === 'daily') return groupByDay(orders);
    if (range === 'weekly') return groupByWeek(orders);
    return groupByMonth(orders);
  }, [orders, range]);

  const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
  const totalRevenue = paidOrders.reduce((s, o) => s + o.total, 0);
  const avgOrderValue = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;

  // Today's stats
  const today = new Date().toISOString().slice(0, 10);
  const todayOrders = paidOrders.filter(o => new Date(o.createdAt).toISOString().slice(0, 10) === today);
  const todayRevenue = todayOrders.reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" /> Analytics
        </h2>
        <div className="flex gap-1 bg-secondary rounded-lg p-1">
          {(Object.keys(RANGE_LABELS) as Range[]).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-md text-xs font-thai transition-colors ${
                range === r ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {r === 'daily' ? 'วัน' : r === 'weekly' ? 'สัปดาห์' : 'เดือน'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gradient-card border border-border rounded-xl p-4">
          <DollarSign className="w-5 h-5 text-primary mb-1" />
          <p className="text-[10px] text-muted-foreground font-thai">ยอดขายรวม</p>
          <p className="text-lg font-display font-bold text-foreground">฿{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-card border border-border rounded-xl p-4">
          <ShoppingBag className="w-5 h-5 text-primary mb-1" />
          <p className="text-[10px] text-muted-foreground font-thai">ออเดอร์ชำระแล้ว</p>
          <p className="text-lg font-display font-bold text-foreground">{paidOrders.length}</p>
        </div>
        <div className="bg-gradient-card border border-border rounded-xl p-4">
          <Calendar className="w-5 h-5 text-primary mb-1" />
          <p className="text-[10px] text-muted-foreground font-thai">ยอดวันนี้</p>
          <p className="text-lg font-display font-bold text-foreground">฿{todayRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-card border border-border rounded-xl p-4">
          <TrendingUp className="w-5 h-5 text-primary mb-1" />
          <p className="text-[10px] text-muted-foreground font-thai">เฉลี่ยต่อออเดอร์</p>
          <p className="text-lg font-display font-bold text-foreground">฿{avgOrderValue.toLocaleString()}</p>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="bg-gradient-card border border-border rounded-xl p-5 shadow-card">
        <h3 className="text-sm font-thai font-medium text-foreground mb-1">ยอดขาย ({RANGE_LABELS[range]})</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `฿${v >= 1000 ? `${v / 1000}k` : v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders count chart */}
      <div className="bg-gradient-card border border-border rounded-xl p-5 shadow-card">
        <h3 className="text-sm font-thai font-medium text-foreground mb-1">จำนวนออเดอร์ ({RANGE_LABELS[range]})</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
