import { CartItem } from '@/types';
import { FREE_SHIPPING_THRESHOLD } from '@/data';

interface Props {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}

export default function CheckoutSummary({ items, subtotal, shipping, discount, total }: Props) {
  return (
    <div className="glass border border-border rounded-2xl p-6 sticky top-24 shadow-card relative overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-radial-gold opacity-20 pointer-events-none" />
      <div className="absolute inset-0 noise-overlay pointer-events-none rounded-2xl" />

      <div className="relative z-10">
        <h3 className="font-display font-bold text-foreground mb-4 gold-divider pb-3">สรุปคำสั่งซื้อ</h3>
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
          <div className="flex justify-between text-base font-thai font-bold pt-3 border-t border-primary/20">
            <span className="text-foreground">ยอดรวมทั้งหมด</span>
            <span className="text-gradient-gold text-lg">฿{total.toLocaleString()}</span>
          </div>
        </div>
        {subtotal < FREE_SHIPPING_THRESHOLD && (
          <p className="text-[10px] text-muted-foreground font-thai mt-3">
            สั่งซื้อ ฿{FREE_SHIPPING_THRESHOLD.toLocaleString()} ขึ้นไป จัดส่งฟรี
          </p>
        )}
      </div>
    </div>
  );
}
