import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export default function HeroSection() {
  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(/images/hero-bg.png)` }}
      />
      <div className="absolute inset-0 bg-background/60" />

      {/* Gold banner overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none">
        <img src="/images/hero-banner.png" alt="" className="max-w-3xl w-full object-contain" />
      </div>

      <div className="container relative z-10 py-32 md:py-40">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-thai font-medium tracking-wider uppercase border border-gold rounded-full text-primary">
              Official Store
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6 text-gradient-gold leading-tight"
          >
            มั่นใจอย่างมีระดับ
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-base md:text-lg text-muted-foreground font-thai mb-10 leading-relaxed max-w-lg mx-auto"
          >
            ช่องทางสั่งซื้ออย่างเป็นทางการของ Dr.Arty Prime Herb
            <br className="hidden md:block" />
            พร้อมระบบชำระเงินที่สะดวกและเป็นส่วนตัว
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              onClick={scrollToProducts}
              className="bg-gradient-gold text-primary-foreground font-thai font-semibold text-base px-8 hover:opacity-90 transition-opacity shadow-gold animate-pulse-gold"
            >
              สั่งซื้อสินค้า
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={scrollToProducts}
              className="border-gold text-primary font-thai hover:bg-primary/10 transition-colors"
            >
              ดูรายละเอียด
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-12 flex items-center justify-center gap-6 text-muted-foreground text-xs font-thai"
          >
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-primary" /> จัดส่งเป็นส่วนตัว</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-primary" /> ชำระเงินปลอดภัย</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-primary" /> สินค้าของแท้</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
