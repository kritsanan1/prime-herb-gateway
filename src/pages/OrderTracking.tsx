import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Package, CheckCircle2, Truck, CreditCard, Clock, XCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOrders } from '@/contexts/OrderContext';
import { Order, OrderStatus, ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@/types';
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
  const { findOrder } = useOrders();

  const handleSearch = () => {
    if (!orderNum || !contact) return;
    const found = findOrder(orderNum.trim(), contact.trim());
    setResult(found || null);
  };

  const currentStep = result ? getStepIndex(result.status) : -1;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CartDrawer />

      <main className="flex-1 pt-24 pb-16">
        <div className="container max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient-gold mb-4">ติดตามคำสั่งซื้อ</h1>
            <p className="text-muted-foreground font-thai">ค้นหาสถานะคำสั่งซื้อด้วยเลขออเดอร์</p>
          </motion.div>

          <div className="bg-gradient-card border border-border rounded-xl p-6 shadow-card mb-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-thai text-muted-foreground">เลขคำสั่งซื้อ</label>
                <Input value={orderNum} onChange={e => setOrderNum(e.target.value)} placeholder="เช่น DAXXXX" className="bg-secondary border-border font-mono" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-thai text-muted-foreground">เบอร์โทรศัพท์ หรือ อีเมล</label>
                <Input value={contact} onChange={e => setContact(e.target.value)} placeholder="เบอร์โทรหรืออีเมลที่ใช้สั่งซื้อ" className="bg-secondary border-border font-thai" />
              </div>
              <Button onClick={handleSearch} className="w-full bg-gradient-gold text-primary-foreground font-thai font-semibold hover:opacity-90" size="lg">
                <Search className="mr-2 w-4 h-4" /> ค้นหา
              </Button>
            </div>
          </div>

          {result === null && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
              <XCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-thai">ไม่พบคำสั่งซื้อ กรุณาตรวจสอบข้อมูลอีกครั้ง</p>
            </motion.div>
          )}

          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-gradient-card border border-border rounded-xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs text-muted-foreground font-thai">เลขคำสั่งซื้อ</p>
                    <p className="text-lg font-mono font-bold text-primary">{result.orderNumber}</p>
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
                  <div className="flex items-center justify-between mb-6">
                    {STATUS_STEPS.map((step, i) => (
                      <div key={step.status} className="flex flex-col items-center flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                          i <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                        }`}>
                          <step.icon className="w-4 h-4" />
                        </div>
                        <span className={`text-[10px] font-thai text-center ${
                          i <= currentStep ? 'text-primary' : 'text-muted-foreground'
                        }`}>{step.label}</span>
                        {i < STATUS_STEPS.length - 1 && (
                          <div className={`hidden sm:block absolute h-0.5 ${
                            i < currentStep ? 'bg-primary' : 'bg-border'
                          }`} style={{ width: '100%' }} />
                        )}
                      </div>
                    ))}
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
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
