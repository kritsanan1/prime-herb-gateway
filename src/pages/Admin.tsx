import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useOrders, Order, OrderStatus } from '@/contexts/OrderContext';
import { useAuth } from '@/contexts/AuthContext';
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Users, DollarSign, Eye, ChevronLeft, BarChart3, Lock, ShoppingBag, Settings, LogOut, Loader2, Tag, TrendingUp, Download } from 'lucide-react';
import CouponManager from '@/components/admin/CouponManager';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';

function AdminLogin() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError('');

    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    } else {
      const { error } = await signUp(email, password, displayName);
      if (error) {
        setError(error);
      } else {
        setRegistered(true);
      }
    }
    setLoading(false);
  };

  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-card border border-border rounded-xl p-8 max-w-sm w-full shadow-card text-center">
          <Lock className="w-10 h-10 text-primary mx-auto mb-3" />
          <h1 className="text-xl font-display font-bold text-foreground mb-2">ลงทะเบียนสำเร็จ</h1>
          <p className="text-xs text-muted-foreground font-thai mb-4">กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี จากนั้นเข้าสู่ระบบอีกครั้ง</p>
          <Button onClick={() => { setMode('login'); setRegistered(false); }} className="w-full bg-gradient-gold text-primary-foreground font-thai font-semibold">
            กลับไปหน้าเข้าสู่ระบบ
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-card border border-border rounded-xl p-8 max-w-sm w-full shadow-card">
        <div className="text-center mb-6">
          <Lock className="w-10 h-10 text-primary mx-auto mb-3" />
          <h1 className="text-xl font-display font-bold text-foreground">
            {mode === 'login' ? 'Admin Access' : 'สมัครบัญชี Admin'}
          </h1>
          <p className="text-xs text-muted-foreground font-thai mt-1">
            {mode === 'login' ? 'เข้าสู่ระบบจัดการหลังบ้าน' : 'สร้างบัญชีสำหรับผู้ดูแลระบบ'}
          </p>
        </div>
        <div className="space-y-4">
          {mode === 'register' && (
            <Input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="ชื่อที่แสดง"
              className="bg-secondary border-border font-thai"
            />
          )}
          <Input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            placeholder="อีเมล"
            className="bg-secondary border-border font-thai"
          />
          <Input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="รหัสผ่าน"
            className="bg-secondary border-border font-thai"
          />
          {error && <p className="text-xs text-destructive font-thai">{error}</p>}
          <Button onClick={handleSubmit} disabled={loading} className="w-full bg-gradient-gold text-primary-foreground font-thai font-semibold">
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {mode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครบัญชี'}
          </Button>
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            className="w-full text-xs text-muted-foreground hover:text-primary font-thai transition-colors"
          >
            {mode === 'login' ? 'ยังไม่มีบัญชี? สมัครที่นี่' : 'มีบัญชีแล้ว? เข้าสู่ระบบ'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

type Tab = 'overview' | 'analytics' | 'orders' | 'products' | 'coupons' | 'customers';

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { orders, updateOrderStatus, refreshOrders, loading: ordersLoading } = useOrders();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && isAdmin) {
      refreshOrders();
    }
  }, [user, isAdmin, refreshOrders]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AdminLogin />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-card border border-border rounded-xl p-8 max-w-sm w-full shadow-card text-center">
          <Lock className="w-10 h-10 text-destructive mx-auto mb-3" />
          <h1 className="text-xl font-display font-bold text-foreground mb-2">ไม่มีสิทธิ์เข้าถึง</h1>
          <p className="text-xs text-muted-foreground font-thai mb-4">บัญชีนี้ไม่มีสิทธิ์ admin กรุณาติดต่อผู้ดูแลระบบ</p>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/')} variant="outline" className="flex-1 border-border text-muted-foreground font-thai text-xs">กลับหน้าเว็บ</Button>
            <Button onClick={signOut} variant="outline" className="flex-1 border-border text-muted-foreground font-thai text-xs">ออกจากระบบ</Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0);
  const paidOrders = orders.filter(o => o.paymentStatus === 'paid').length;
  const uniqueCustomers = new Set(orders.map(o => o.customer.phone)).size;

  const TABS: { id: Tab; label: string; icon: typeof Package }[] = [
    { id: 'overview', label: 'ภาพรวม', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'orders', label: 'คำสั่งซื้อ', icon: ShoppingBag },
    { id: 'products', label: 'สินค้า', icon: Package },
    { id: 'coupons', label: 'คูปอง', icon: Tag },
    { id: 'customers', label: 'ลูกค้า', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-gradient-gold">Dr.Arty</span>
          <span className="text-xs text-muted-foreground font-thai">Admin Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-thai hidden sm:inline">{user.email}</span>
          <Button variant="outline" size="sm" onClick={() => navigate('/')} className="text-xs font-thai border-border text-muted-foreground">
            <ChevronLeft className="w-3 h-3 mr-1" /> กลับหน้าเว็บ
          </Button>
          <Button variant="outline" size="sm" onClick={signOut} className="text-xs font-thai border-border text-destructive">
            <LogOut className="w-3 h-3 mr-1" /> ออกจากระบบ
          </Button>
        </div>
      </header>

      <div className="flex">
        <aside className="w-56 border-r border-border min-h-[calc(100vh-57px)] p-4 hidden md:block">
          <nav className="space-y-1">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setSelectedOrder(null); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-thai transition-colors ${
                  tab === t.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="md:hidden border-b border-border bg-card flex overflow-x-auto fixed top-[57px] left-0 right-0 z-10">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setSelectedOrder(null); }}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-thai whitespace-nowrap border-b-2 transition-colors ${
                tab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        <main className="flex-1 p-6 md:p-8 mt-12 md:mt-0">
          {tab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-bold text-foreground">ภาพรวม</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-gradient-card border border-border rounded-xl p-5">
                  <DollarSign className="w-8 h-8 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground font-thai">ยอดขายรวม</p>
                  <p className="text-2xl font-display font-bold text-foreground">฿{totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-gradient-card border border-border rounded-xl p-5">
                  <ShoppingBag className="w-8 h-8 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground font-thai">ออเดอร์ที่ชำระแล้ว</p>
                  <p className="text-2xl font-display font-bold text-foreground">{paidOrders}</p>
                </div>
                <div className="bg-gradient-card border border-border rounded-xl p-5">
                  <Users className="w-8 h-8 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground font-thai">ลูกค้าทั้งหมด</p>
                  <p className="text-2xl font-display font-bold text-foreground">{uniqueCustomers}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-display font-bold text-foreground mb-4">ออเดอร์ล่าสุด</h3>
                {ordersLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
                ) : orders.length === 0 ? (
                  <p className="text-muted-foreground font-thai text-sm">ยังไม่มีออเดอร์</p>
                ) : (
                  <div className="space-y-2">
                    {orders.slice(0, 5).map(o => (
                      <button
                        key={o.id}
                        onClick={() => { setTab('orders'); setSelectedOrder(o); }}
                        className="w-full flex items-center justify-between bg-gradient-card border border-border rounded-lg p-4 hover:border-gold transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono text-primary">{o.orderNumber}</span>
                          <span className="text-xs text-muted-foreground font-thai">{o.customer.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-thai text-foreground">฿{o.total.toLocaleString()}</span>
                          <span className={`text-xs px-2 py-0.5 rounded font-thai ${
                            o.paymentStatus === 'paid' ? 'bg-primary/20 text-primary' :
                            o.paymentStatus === 'failed' ? 'bg-destructive/20 text-destructive' :
                            'bg-secondary text-muted-foreground'
                          }`}>{ORDER_STATUS_LABELS[o.status]}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'analytics' && <AnalyticsDashboard orders={orders} />}

          {tab === 'orders' && !selectedOrder && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-bold text-foreground">คำสั่งซื้อทั้งหมด ({orders.length})</h2>
              {orders.length === 0 ? (
                <p className="text-muted-foreground font-thai text-sm">ยังไม่มีออเดอร์</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground font-thai text-xs">
                        <th className="text-left py-3 px-2">เลขออเดอร์</th>
                        <th className="text-left py-3 px-2">ลูกค้า</th>
                        <th className="text-left py-3 px-2">ยอด</th>
                        <th className="text-left py-3 px-2">สถานะ</th>
                        <th className="text-left py-3 px-2">วันที่</th>
                        <th className="py-3 px-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                          <td className="py-3 px-2 font-mono text-primary">{o.orderNumber}</td>
                          <td className="py-3 px-2 font-thai text-foreground">{o.customer.name}</td>
                          <td className="py-3 px-2 font-thai">฿{o.total.toLocaleString()}</td>
                          <td className="py-3 px-2">
                            <span className={`text-xs px-2 py-0.5 rounded font-thai ${
                              o.paymentStatus === 'paid' ? 'bg-primary/20 text-primary' :
                              o.paymentStatus === 'failed' ? 'bg-destructive/20 text-destructive' :
                              'bg-secondary text-muted-foreground'
                            }`}>{ORDER_STATUS_LABELS[o.status]}</span>
                          </td>
                          <td className="py-3 px-2 text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString('th-TH')}</td>
                          <td className="py-3 px-2">
                            <Button size="sm" variant="ghost" onClick={() => setSelectedOrder(o)} className="text-xs text-primary font-thai">
                              <Eye className="w-3 h-3 mr-1" /> ดู
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === 'orders' && selectedOrder && (
            <div className="space-y-6">
              <button onClick={() => setSelectedOrder(null)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary font-thai">
                <ChevronLeft className="w-4 h-4" /> กลับ
              </button>
              <div className="bg-gradient-card border border-border rounded-xl p-6 shadow-card space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-display font-bold text-foreground">ออเดอร์ {selectedOrder.orderNumber}</h3>
                    <p className="text-xs text-muted-foreground font-thai mt-1">
                      สร้างเมื่อ {new Date(selectedOrder.createdAt).toLocaleString('th-TH')}
                    </p>
                  </div>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(val) => {
                      updateOrderStatus(selectedOrder.id, val as OrderStatus);
                      setSelectedOrder({ ...selectedOrder, status: val as OrderStatus });
                    }}
                  >
                    <SelectTrigger className="w-48 bg-secondary border-border font-thai text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k} className="font-thai text-xs">{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-thai font-medium text-foreground mb-3">ข้อมูลลูกค้า</h4>
                    <div className="space-y-1 text-sm font-thai text-muted-foreground">
                      <p>ชื่อ: <span className="text-foreground">{selectedOrder.customer.name}</span></p>
                      <p>โทร: <span className="text-foreground">{selectedOrder.customer.phone}</span></p>
                      <p>อีเมล: <span className="text-foreground">{selectedOrder.customer.email}</span></p>
                      <p>ที่อยู่: <span className="text-foreground">{selectedOrder.customer.address} {selectedOrder.customer.province} {selectedOrder.customer.postalCode}</span></p>
                      {selectedOrder.customer.note && <p>หมายเหตุ: <span className="text-foreground">{selectedOrder.customer.note}</span></p>}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-thai font-medium text-foreground mb-3">ข้อมูลการชำระเงิน</h4>
                    <div className="space-y-1 text-sm font-thai text-muted-foreground">
                      <p>วิธีชำระ: <span className="text-foreground">{PAYMENT_METHOD_LABELS[selectedOrder.paymentMethod]}</span></p>
                      <p>สถานะ: <span className={selectedOrder.paymentStatus === 'paid' ? 'text-primary' : 'text-destructive'}>{selectedOrder.paymentStatus}</span></p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-thai font-medium text-foreground mb-3">สินค้า</h4>
                  {selectedOrder.items.map((item: any) => (
                    <div key={item.product?.id || Math.random()} className="flex justify-between text-sm font-thai py-2 border-b border-border/50">
                      <span className="text-foreground">{item.product?.name} x{item.quantity}</span>
                      <span className="text-foreground">฿{((item.product?.price || 0) * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="pt-3 space-y-1 text-sm font-thai">
                    <div className="flex justify-between text-muted-foreground"><span>ค่าสินค้า</span><span>฿{selectedOrder.subtotal.toLocaleString()}</span></div>
                    <div className="flex justify-between text-muted-foreground"><span>ค่าจัดส่ง</span><span>฿{selectedOrder.shipping}</span></div>
                    {selectedOrder.discount > 0 && <div className="flex justify-between text-primary"><span>ส่วนลด</span><span>-฿{selectedOrder.discount.toLocaleString()}</span></div>}
                    <div className="flex justify-between font-bold text-foreground pt-2 border-t border-border"><span>รวม</span><span className="text-primary">฿{selectedOrder.total.toLocaleString()}</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-display font-bold text-foreground">จัดการสินค้า</h2>
                <Button size="sm" className="bg-gradient-gold text-primary-foreground font-thai text-xs">
                  <Settings className="w-3 h-3 mr-1" /> เพิ่มสินค้า
                </Button>
              </div>
              <div className="bg-gradient-card border border-border rounded-xl p-6 shadow-card">
                <p className="text-xs text-muted-foreground font-thai mb-4">สินค้าปัจจุบัน — ข้อมูลจากฐานข้อมูล Lovable Cloud</p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-thai text-xs">
                      <th className="text-left py-3">สินค้า</th>
                      <th className="text-left py-3">ราคา</th>
                      <th className="text-left py-3">สต็อก</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-3 font-thai text-foreground">Dr.Arty Prime Herb</td>
                      <td className="py-3 text-primary">฿1,290</td>
                      <td className="py-3 text-foreground">50</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'coupons' && <CouponManager />}

          {tab === 'customers' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-bold text-foreground">รายชื่อลูกค้า</h2>
              {orders.length === 0 ? (
                <p className="text-muted-foreground font-thai text-sm">ยังไม่มีข้อมูลลูกค้า</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground font-thai text-xs">
                        <th className="text-left py-3 px-2">ชื่อ</th>
                        <th className="text-left py-3 px-2">โทร</th>
                        <th className="text-left py-3 px-2">อีเมล</th>
                        <th className="text-left py-3 px-2">จำนวนออเดอร์</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from(new Map(orders.map(o => [o.customer.phone, o.customer])).values()).map(c => (
                        <tr key={c.phone} className="border-b border-border/50">
                          <td className="py-3 px-2 font-thai text-foreground">{c.name}</td>
                          <td className="py-3 px-2 text-muted-foreground">{c.phone}</td>
                          <td className="py-3 px-2 text-muted-foreground">{c.email}</td>
                          <td className="py-3 px-2 text-foreground">{orders.filter(o => o.customer.phone === c.phone).length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
