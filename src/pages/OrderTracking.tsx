import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Package, CheckCircle2, Truck, CreditCard, Clock, XCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOrders, Order, OrderStatus } from '@/contexts/OrderContext';
import { useOrderNotification } from '@/hooks/useOrderNotification';
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';

const STATUS_STEPS: { status: OrderStatus; icon: typeof Clock; label: string }[] = [
  { status: 'pending', icon: Clock, label: 'รอชำระเงิน' },
  { status: 'paid', icon: CreditCard, label: 'ชำระเงินแล้ว' },
  { status: 'processing', icon: Package, label: 'กำลังเตรียมจัดส่ง' },
  { status: 'shipping', icon: Truck, label: 'กำลังจัดส่ง' },
  { status: 'delivered', icon: CheckCircle2, label: 'จัดส่งสำเร็จ' },
];

function getStepIndex(status: OrderStatus): number {
  if (status === 'failed' || status === 'refunded') return -1;
  return STATUS_STEPS.findIndex(s => s.status === status);
}

export default function OrderTrackingPage() {
  const [orderNum, setOrderNum] = useState('');
  const [contact, setContact] = useState('');
  const [result, setResult] = useState<Order | null | undefined>(undefined);
  const [searching, setSearching] = useState(false);
  const { findOrder } = useOrders();
  useOrderNotification(result?.orderNumber);

  const handleSearch = async () => {
    if (!orderNum || !contact) return;
    setSearching(true);
    const found = await findOrder(orderNum.trim(), contact.trim());
    setResult(found || null);
    setSearching(false);
  };

  const currentStep = result ? getStepIndex(result.status) : -1;

  return (
    <div className="min-h-screen flex flex-col relative">
      <Header />
      <CartDrawer />

      {/* Background layers */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-radial-gold opacity-15" />
        <div className="absolute inset-0 noise-overlay" />
      </div>

      <main className="flex-1 pt-24 pb-16 relative z-10">
        <div className="container max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient-gold mb-4">ติดตามคำสั่งซื้อ</h1>
            <p className="text-muted-foreground font-thai">ค้นหาสถานะคำสั่งซื้อด้วยเลขออเดอร์</p>
          </motion.div>

          {/* Search card with glass */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass border border-border rounded-2xl p-6 shadow-card mb-8 relative overflow-hidden"
          >
            <div className="absolute inset-0 noise-overlay pointer-events-none rounded-2xl" />
            <div className="relative z-10 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-thai text-muted-foreground">เลขคำสั่งซื้อ</label>
                <Input value={orderNum} onChange={e => setOrderNum(e.target.value)} placeholder="เช่น DAXXXX" className="bg-secondary/50 border-border font-mono focus:border-primary/50" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-thai text-muted-foreground">เบอร์โทรศัพท์ หรือ อีเมล</label>
                <Input value={contact} onChange={e => setContact(e.target.value)} placeholder="เบอร์โทรหรืออีเมลที่ใช้สั่งซื้อ" className="bg-secondary/50 border-border font-thai focus:border-primary/50" />
              </div>
              <Button onClick={handleSearch} disabled={searching} className="w-full bg-gradient-gold text-primary-foreground font-thai font-semibold hover:opacity-90 shadow-gold rounded-xl" size="lg">
                <Search className="mr-2 w-4 h-4" /> {searching ? 'กำลังค้นหา...' : 'ค้นหา'}
              </Button>
            </div>
          </motion.div>

          {result === null && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
              <XCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-thai">ไม่พบคำสั่งซื้อ กรุณาตรวจสอบข้อมูลอีกครั้ง</p>
            </motion.div>
          )}

          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="glass border border-border rounded-2xl p-6 shadow-card relative overflow-hidden">
                <div className="absolute inset-0 noise-overlay pointer-events-none rounded-2xl" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-xs text-muted-foreground font-thai">เลขคำสั่งซื้อ</p>
                      <p className="text-lg font-mono font-bold text-gradient-gold">{result.orderNumber}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-thai font-medium ${
                      result.status === 'delivered' ? 'bg-primary/20 text-primary' :
                      result.status === 'failed' ? 'bg-destructive/20 text-destructive' :
                      'bg-secondary text-secondary-foreground'
                    }`}>
                      {ORDER_STATUS_LABELS[result.status]}
                    </div>
                  </div>

                  {result.status !== 'failed' && result.status !== 'refunded' ? (
                    <div className="mb-6">
                      {/* Timeline with animated progress */}
                      <div className="flex items-center justify-between relative">
                        {/* Background line */}
                        <div className="absolute top-4 left-4 right-4 h-0.5 bg-border" />
                        {/* Active line */}
                        <motion.div
                          className="absolute top-4 left-4 h-0.5 bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: currentStep >= 0 ? `${(currentStep / (STATUS_STEPS.length - 1)) * (100 - 8)}%` : 0 }}
                          transition={{ duration: 0.8, delay: 0.3 }}
                        />
                        {STATUS_STEPS.map((step, i) => (
                          <motion.div
                            key={step.status}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 * i }}
                            className="flex flex-col items-center flex-1 relative z-10"
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-all duration-500 ${
                              i <= currentStep
                                ? 'bg-primary text-primary-foreground shadow-[0_0_12px_hsl(var(--primary)/0.4)]'
                                : 'bg-secondary text-muted-foreground'
                            }`}>
                              <step.icon className="w-4 h-4" />
                            </div>
                            <span className={`text-[10px] font-thai text-center ${
                              i <= currentStep ? 'text-primary' : 'text-muted-foreground'
                            }`}>{step.label}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ) : result.status === 'failed' ? (
                    <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-lg mb-4">
                      <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                      <p className="text-sm text-destructive font-thai">การชำระเงินไม่สำเร็จ กรุณาติดต่อทีมงาน</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg mb-4">
                      <RotateCcw className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <p className="text-sm text-muted-foreground font-thai">คำสั่งซื้อนี้ได้รับการคืนเงินแล้ว</p>
                    </div>
                  )}

                  <div className="border-t border-border pt-4 space-y-2 text-sm font-thai">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">วิธีชำระเงิน</span>
                      <span className="text-foreground">{PAYMENT_METHOD_LABELS[result.paymentMethod]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ยอดรวม</span>
                      <span className="text-primary font-bold">฿{result.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">วันที่สั่งซื้อ</span>
                      <span className="text-foreground">{new Date(result.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
