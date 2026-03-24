import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrders } from '@/contexts/OrderContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';

export default function OrderSuccessPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [searchParams] = useSearchParams();
  const { getOrder } = useOrders();
  const [order, setOrder] = useState(orderNumber ? getOrder(orderNumber) : undefined);
  const failed = searchParams.get('status') === 'failed';

  useEffect(() => {
    if (orderNumber) {
      setOrder(getOrder(orderNumber));
    }
  }, [orderNumber, getOrder]);

  return (
    <div className="min-h-screen flex flex-col relative">
      <Header />
      <CartDrawer />

      {/* Background depth */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-radial-gold opacity-15" />
        <div className="absolute inset-0 noise-overlay" />
      </div>

      <main className="flex-1 pt-24 pb-16 flex items-center justify-center relative z-10">
        <div className="container max-w-lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="glass border border-border rounded-2xl p-8 md:p-12 text-center shadow-card relative overflow-hidden"
          >
            <div className="absolute inset-0 noise-overlay pointer-events-none rounded-2xl" />
            <div className="relative z-10">
              {failed ? (
                <>
                  <XCircle className="w-16 h-16 text-destructive mx-auto mb-6" />
                  <h1 className="text-2xl font-display font-bold text-foreground mb-3">การชำระเงินไม่สำเร็จ</h1>
                  <p className="text-sm text-muted-foreground font-thai mb-2">
                    กรุณาลองใหม่อีกครั้ง หรือติดต่อทีมงาน
                  </p>
                  {order && (
                    <p className="text-xs text-muted-foreground font-thai mb-6">
                      เลขออเดอร์: <span className="text-primary font-mono">{order.orderNumber}</span>
                    </p>
                  )}
                  <div className="flex gap-3 justify-center">
                    <Button asChild variant="outline" className="border-gold text-primary font-thai">
                      <Link to="/#contact">ติดต่อทีมงาน</Link>
                    </Button>
                    <Button asChild className="bg-gradient-gold text-primary-foreground font-thai">
                      <Link to="/">กลับหน้าแรก</Link>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  >
                    <div className="relative inline-block mb-6">
                      <CheckCircle2 className="w-16 h-16 text-primary" />
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-primary/30"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>
                  </motion.div>
                  <h1 className="text-2xl font-display font-bold text-foreground mb-3">สั่งซื้อสำเร็จ!</h1>
                  <p className="text-sm text-muted-foreground font-thai mb-2">ขอบคุณที่สั่งซื้อสินค้ากับ Dr.Arty Prime Herb</p>

                  {order && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-secondary/30 glass rounded-xl p-4 my-6 space-y-2 border border-border"
                    >
                      <p className="text-xs text-muted-foreground font-thai">เลขคำสั่งซื้อ</p>
                      <p className="text-xl font-mono font-bold text-gradient-gold">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground font-thai">ยอดชำระ: ฿{order.total.toLocaleString()}</p>
                    </motion.div>
                  )}

                  <p className="text-xs text-muted-foreground font-thai mb-6">
                    กรุณาบันทึกเลขคำสั่งซื้อไว้ สำหรับติดตามสถานะการจัดส่ง
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild variant="outline" className="border-gold text-primary font-thai">
                      <Link to="/tracking">
                        <Package className="mr-2 w-4 h-4" />
                        ติดตามคำสั่งซื้อ
                      </Link>
                    </Button>
                    <Button asChild className="bg-gradient-gold text-primary-foreground font-thai">
                      <Link to="/">
                        กลับหน้าแรก
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
