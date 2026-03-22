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
      
      // Use Stripe Checkout for credit card and PromptPay
      if (paymentMethod === 'credit_card' || paymentMethod === 'promptpay') {
        const checkoutUrl = await createStripeCheckout(order);
        clearCart();
        window.location.href = checkoutUrl;
        return;
      }

      // For bank transfer, go to success page with pending status
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
              <p className="text-muted-foreground font-thai">กำลังเปลี่ยนเส้นทางไปหน้าชำระเงิน...</p>
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
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
