import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useOrders } from '@/contexts/OrderContext';
import { SHIPPING_COST, FREE_SHIPPING_THRESHOLD } from '@/data';
import { CustomerInfo, PaymentMethod } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import CheckoutShippingForm from '@/components/checkout/CheckoutShippingForm';
import CheckoutPaymentForm from '@/components/checkout/CheckoutPaymentForm';
import CheckoutSummary from '@/components/checkout/CheckoutSummary';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { createOrder, createStripeCheckout } = useOrders();

  const [step, setStep] = useState<'info' | 'payment' | 'processing'>('info');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
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

  const applyCoupon = async () => {
    if (!coupon) return;
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .ilike('code', coupon)
      .eq('is_active', true)
      .maybeSingle();

    if (data) {
      const c = data as any;
      if (c.max_uses && c.used_count >= c.max_uses) return;
      if (subtotal < c.min_order) return;
      const discountAmt = c.discount_type === 'percentage'
        ? Math.round(subtotal * c.discount_value / 100)
        : c.discount_value;
      setDiscount(discountAmt);
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
      
      if (paymentMethod === 'credit_card' || paymentMethod === 'promptpay') {
        const checkoutUrl = await createStripeCheckout(order);
        clearCart();
        window.location.href = checkoutUrl;
        return;
      }

      clearCart();
      navigate(`/order-success/${order.orderNumber}`);
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
    <div className="min-h-screen flex flex-col relative">
      <Header />
      <CartDrawer />

      {/* Background layers */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-radial-gold opacity-20" />
        <div className="absolute inset-0 noise-overlay" />
      </div>

      <main className="flex-1 pt-24 pb-16 relative z-10">
        <div className="container max-w-4xl">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary font-thai mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
          </button>

          {/* Animated step indicator */}
          <div className="flex items-center gap-2 mb-10">
            {[
              { key: 'info', label: '1. ข้อมูลจัดส่ง' },
              { key: 'payment', label: '2. ชำระเงิน' },
            ].map((s, i) => (
              <div key={s.key} className="flex items-center gap-2">
                {i > 0 && (
                  <div className="w-8 h-px relative overflow-hidden">
                    <div className="absolute inset-0 bg-border" />
                    <motion.div
                      className="absolute inset-0 bg-primary"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: step === 'payment' || step === 'processing' ? 1 : 0 }}
                      transition={{ duration: 0.4 }}
                      style={{ transformOrigin: 'left' }}
                    />
                  </div>
                )}
                <motion.button
                  onClick={() => {
                    if (s.key === 'info') setStep('info');
                    if (s.key === 'payment' && isFormValid) setStep('payment');
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-thai font-medium transition-all duration-300 ${
                    step === s.key || (step === 'processing' && s.key === 'payment')
                      ? 'bg-gradient-gold text-primary-foreground shadow-gold'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {step === s.key && (
                    <motion.span
                      className="absolute inset-0 rounded-full bg-primary/20"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                  {s.label}
                </motion.button>
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 'processing' ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
                <h2 className="text-2xl font-display font-bold text-foreground mb-2">กำลังดำเนินการชำระเงิน</h2>
                <p className="text-muted-foreground font-thai">กำลังเปลี่ยนเส้นทางไปหน้าชำระเงิน...</p>
              </motion.div>
            ) : (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid lg:grid-cols-5 gap-8"
              >
                <div className="lg:col-span-3 space-y-6">
                  {step === 'info' && (
                    <CheckoutShippingForm
                      form={form}
                      updateField={updateField}
                      isFormValid={!!isFormValid}
                      onNext={() => setStep('payment')}
                    />
                  )}

                  {step === 'payment' && (
                    <CheckoutPaymentForm
                      paymentMethod={paymentMethod}
                      setPaymentMethod={setPaymentMethod}
                      coupon={coupon}
                      setCoupon={setCoupon}
                      discount={discount}
                      applyCoupon={applyCoupon}
                      processing={processing}
                      total={total}
                      onSubmit={handleSubmit}
                    />
                  )}
                </div>

                <div className="lg:col-span-2">
                  <CheckoutSummary
                    items={items}
                    subtotal={subtotal}
                    shipping={shipping}
                    discount={discount}
                    total={total}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
