import { motion } from 'framer-motion';
import { CreditCard, QrCode, Building2, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaymentMethod } from '@/types';

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: typeof CreditCard; desc: string }[] = [
  { id: 'credit_card', label: 'บัตรเครดิต / เดบิต', icon: CreditCard, desc: 'Visa, Mastercard, JCB (ผ่าน Stripe)' },
  { id: 'promptpay', label: 'PromptPay / QR Payment', icon: QrCode, desc: 'สแกน QR เพื่อชำระเงิน (ผ่าน Stripe)' },
  { id: 'bank_transfer', label: 'โอนผ่านธนาคาร', icon: Building2, desc: 'โอนเงินผ่าน Mobile Banking' },
];

interface Props {
  paymentMethod: PaymentMethod;
  setPaymentMethod: (pm: PaymentMethod) => void;
  coupon: string;
  setCoupon: (v: string) => void;
  discount: number;
  applyCoupon: () => void;
  processing: boolean;
  total: number;
  onSubmit: () => void;
}

export default function CheckoutPaymentForm({ paymentMethod, setPaymentMethod, coupon, setCoupon, discount, applyCoupon, processing, total, onSubmit }: Props) {
  return (
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
        onClick={onSubmit}
        disabled={processing}
        className="w-full bg-gradient-gold text-primary-foreground font-thai font-semibold hover:opacity-90 mt-4 shadow-gold"
        size="lg"
      >
        {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        ยืนยันและชำระเงิน ฿{total.toLocaleString()}
      </Button>
    </motion.div>
  );
}
