import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, QrCode, Building2, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/contexts/CartContext';
import { useOrders } from '@/contexts/OrderContext';
import { SHIPPING_COST, FREE_SHIPPING_THRESHOLD } from '@/data';
import { CustomerInfo, PaymentMethod } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: typeof CreditCard; desc: string }[] = [
  { id: 'promptpay', label: 'PromptPay / QR Payment', icon: QrCode, desc: 'สแกน QR เพื่อชำระเงิน' },
  { id: 'credit_card', label: 'บัตรเครดิต / เดบิต', icon: CreditCard, desc: 'Visa, Mastercard, JCB' },
  { id: 'bank_transfer', label: 'โอนผ่านธนาคาร', icon: Building2, desc: 'โอนเงินผ่าน Mobile Banking' },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { createOrder, simulatePayment } = useOrders();

  const [step, setStep] = useState<'info' | 'payment' | 'processing'>('info');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('promptpay');
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [processing, setProcessing] = useState(false);

  const [form, setForm] = useState<CustomerInfo>({
    name: '', phone: '', email: '', address: '', province: '', postalCode: '', note: '', couponCode: '',
  });

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping - discount;

  const updateField = (field: keyof CustomerInfo, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const applyCoupon = () => {
    if (coupon.toUpperCase() === 'DRARTY10') {
      setDiscount(Math.round(subtotal * 0.1));
      setForm(prev => ({ ...prev, couponCode: coupon }));
    }
  };

  const isFormValid = form.name && form.phone && form.email && form.address && form.province && form.postalCode;

  const handleSubmit = async () => {
    if (!isFormValid || items.length === 0) return;
    setStep('processing');
    setProcessing(true);

    try {
      const order = await createOrder(items, form, paymentMethod, subtotal, shipping, discount);
      const success = await simulatePayment(order.id);
      clearCart();

      if (success) {
        navigate(`/order-success/${order.orderNumber}`);
      } else {
        navigate(`/order-success/${order.orderNumber}?status=failed`);
      }
    } catch (err) {
      console.error('Order creation failed:', err);
      setStep('payment');
      setProcessing(false);
    }
  };

  if (items.length === 0 && step !== 'processing') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <CartDrawer />
        <div className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center">
            <p className="text-muted-foreground font-thai mb-4">ไม่มีสินค้าในตะกร้า</p>
            <Button onClick={() => navigate('/')} variant="outline" className="border-gold text-primary font-thai">
              กลับไปหน้าสินค้า
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CartDrawer />

      <main className="flex-1 pt-24 pb-16">
        <div className="container max-w-4xl">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary font-thai mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
          </button>

          {step === 'processing' ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">กำลังดำเนินการชำระเงิน</h2>
              <p className="text-muted-foreground font-thai">กรุณารอสักครู่...</p>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3 space-y-6">
                <div className="flex items-center gap-2 mb-8">
                  <button onClick={() => setStep('info')} className={`px-4 py-2 rounded-full text-xs font-thai font-medium transition-colors ${step === 'info' ? 'bg-gradient-gold text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                    1. ข้อมูลจัดส่ง
                  </button>
                  <div className="w-8 h-px bg-border" />
                  <button onClick={() => isFormValid && setStep('payment')} className={`px-4 py-2 rounded-full text-xs font-thai font-medium transition-colors ${step === 'payment' ? 'bg-gradient-gold text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                    2. ชำระเงิน
                  </button>
                </div>

                {step === 'info' && (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <h2 className="text-xl font-display font-bold text-foreground">ข้อมูลการจัดส่ง</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-thai text-muted-foreground">ชื่อ-นามสกุล *</Label>
                        <Input value={form.name} onChange={e => updateField('name', e.target.value)} placeholder="ชื่อ นามสกุล" className="bg-secondary border-border font-thai" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-thai text-muted-foreground">เบอร์โทรศัพท์ *</Label>
                        <Input value={form.phone} onChange={e => updateField('phone', e.target.value)} placeholder="08X-XXX-XXXX" className="bg-secondary border-border font-thai" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-thai text-muted-foreground">อีเมล *</Label>
                      <Input value={form.email} onChange={e => updateField('email', e.target.value)} type="email" placeholder="email@example.com" className="bg-secondary border-border font-thai" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-thai text-muted-foreground">ที่อยู่จัดส่ง *</Label>
                      <Textarea value={form.address} onChange={e => updateField('address', e.target.value)} placeholder="บ้านเลขที่ ซอย ถนน แขวง/ตำบล เขต/อำเภอ" className="bg-secondary border-border font-thai" rows={3} />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-thai text-muted-foreground">จังหวัด *</Label>
                        <Input value={form.province} onChange={e => updateField('province', e.target.value)} placeholder="กรุงเทพมหานคร" className="bg-secondary border-border font-thai" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-thai text-muted-foreground">รหัสไปรษณีย์ *</Label>
                        <Input value={form.postalCode} onChange={e => updateField('postalCode', e.target.value)} placeholder="10XXX" className="bg-secondary border-border font-thai" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-thai text-muted-foreground">หมายเหตุ (ถ้ามี)</Label>
                      <Input value={form.note} onChange={e => updateField('note', e.target.value)} placeholder="ข้อความถึงทีมงาน" className="bg-secondary border-border font-thai" />
                    </div>
                    <Button
                      onClick={() => setStep('payment')}
                      disabled={!isFormValid}
                      className="w-full bg-gradient-gold text-primary-foreground font-thai font-semibold hover:opacity-90 mt-4"
                      size="lg"
                    >
                      ถัดไป: เลือกวิธีชำระเงิน
                    </Button>
                  </motion.div>
                )}

                {step === 'payment' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <h2 className="text-xl font-display font-bold text-foreground">วิธีชำระเงิน</h2>
                    <div className="space-y-3">
                      {PAYMENT_METHODS.map(pm => (
                        <button
                          key={pm.id}
                          onClick={() => setPaymentMethod(pm.id)}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-colors ${paymentMethod === pm.id ? 'border-primary bg-primary/5' : 'border-border bg-secondary/50 hover:border-muted-foreground/30'}`}
                        >
                          <pm.icon className={`w-6 h-6 ${paymentMethod === pm.id ? 'text-primary' : 'text-muted-foreground'}`} />
                          <div className="text-left">
                            <p className="text-sm font-thai font-medium text-foreground">{pm.label}</p>
                            <p className="text-xs text-muted-foreground font-thai">{pm.desc}</p>
                          </div>
                          {paymentMethod === pm.id && <CheckCircle2 className="w-5 h-5 text-primary ml-auto" />}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="รหัสคูปอง" className="bg-secondary border-border font-thai" />
                      <Button onClick={applyCoupon} variant="outline" className="border-gold text-primary font-thai flex-shrink-0">ใช้คูปอง</Button>
                    </div>
                    {discount > 0 && <p className="text-xs text-primary font-thai">✓ ใช้คูปองสำเร็จ ลด ฿{discount.toLocaleString()}</p>}
                    <Button
                      onClick={handleSubmit}
                      disabled={processing}
                      className="w-full bg-gradient-gold text-primary-foreground font-thai font-semibold hover:opacity-90 mt-4 shadow-gold"
                      size="lg"
                    >
                      {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      ยืนยันและชำระเงิน ฿{total.toLocaleString()}
                    </Button>
                  </motion.div>
                )}
              </div>

              <div className="lg:col-span-2">
                <div className="bg-gradient-card border border-border rounded-xl p-6 sticky top-24 shadow-card">
                  <h3 className="font-display font-bold text-foreground mb-4">สรุปคำสั่งซื้อ</h3>
                  <div className="space-y-3 mb-4">
                    {items.map(item => (
                      <div key={item.product.id} className="flex justify-between text-sm font-thai">
                        <span className="text-muted-foreground">{item.product.name} x{item.quantity}</span>
                        <span className="text-foreground">฿{(item.product.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border pt-3 space-y-2">
                    <div className="flex justify-between text-sm font-thai">
                      <span className="text-muted-foreground">ค่าสินค้า</span>
                      <span>฿{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm font-thai">
                      <span className="text-muted-foreground">ค่าจัดส่ง</span>
                      <span>{shipping === 0 ? 'ฟรี' : `฿${shipping}`}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm font-thai text-primary">
                        <span>ส่วนลด</span>
                        <span>-฿{discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-thai font-bold pt-2 border-t border-border">
                      <span className="text-foreground">ยอดรวมทั้งหมด</span>
                      <span className="text-primary">฿{total.toLocaleString()}</span>
                    </div>
                  </div>
                  {subtotal < FREE_SHIPPING_THRESHOLD && (
                    <p className="text-[10px] text-muted-foreground font-thai mt-3">
                      สั่งซื้อ ฿{FREE_SHIPPING_THRESHOLD.toLocaleString()} ขึ้นไป จัดส่งฟรี
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
