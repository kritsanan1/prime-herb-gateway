import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function HeroSection() {
  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image with parallax-like depth */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: `url(/images/hero-bg.png)` }}
      />
      {/* Multi-layer overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background/90" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-background/40" />

      {/* Radial gold ambient light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-radial-gold opacity-60 pointer-events-none" />

      {/* Gold banner overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <img src="/images/hero-banner.png" alt="" className="max-w-3xl w-full object-contain animate-float" />
      </div>

      {/* Noise texture */}
      <div className="absolute inset-0 noise-overlay pointer-events-none" />

      <div className="container relative z-10 py-32 md:py-40">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-2 px-5 py-2 mb-8 text-xs font-thai font-medium tracking-[0.2em] uppercase border border-gold/40 rounded-full text-primary glass">
              <Sparkles className="w-3 h-3" />
              Official Store
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-8 text-gradient-gold leading-[1.1] tracking-wide"
          >
            มั่นใจอย่างมีระดับ
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-base md:text-lg text-muted-foreground font-thai mb-12 leading-relaxed max-w-md mx-auto"
          >
            ช่องทางสั่งซื้ออย่างเป็นทางการของ Dr.Arty Prime Herb
            <br className="hidden md:block" />
            พร้อมระบบชำระเงินที่สะดวกและเป็นส่วนตัว
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              onClick={scrollToProducts}
              className="group bg-gradient-gold text-primary-foreground font-thai font-semibold text-base px-10 py-6 hover:opacity-90 transition-all duration-500 shadow-gold-intense animate-pulse-gold rounded-xl"
            >
              สั่งซื้อสินค้า
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={scrollToProducts}
              className="border-gold/40 text-primary font-thai hover:bg-primary/10 transition-all duration-500 px-10 py-6 rounded-xl glass"
            >
              ดูรายละเอียด
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="mt-16 flex items-center justify-center gap-8 text-muted-foreground text-xs font-thai"
          >
            {[
              { label: 'จัดส่งเป็นส่วนตัว' },
              { label: 'ชำระเงินปลอดภัย' },
              { label: 'สินค้าของแท้' },
            ].map((item, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.15 }}
                className="flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-primary" />
                {item.label}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom fade to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
