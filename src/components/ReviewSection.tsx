import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { REVIEWS } from '@/data';

export default function ReviewSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '-12%']);

  return (
    <section id="reviews" ref={sectionRef} className="relative py-24 md:py-36 overflow-hidden">
      {/* Parallax background image */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ y: bgY }}
      >
        <img
          src="/images/gallery/brand-confidence.jpg"
          alt=""
          className="w-full h-full object-cover opacity-[0.05] blur-sm scale-110"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background pointer-events-none" />

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-radial-gold opacity-30 pointer-events-none" />

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <p className="text-xs text-primary font-thai tracking-[0.3em] uppercase mb-4">Testimonials</p>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-gradient-gold mb-4 gold-divider">
            เสียงจากลูกค้า
          </h2>
          <p className="text-muted-foreground font-thai mt-8">ประสบการณ์จริงจากผู้ใช้สินค้า</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {REVIEWS.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="group relative bg-gradient-card border border-border/60 rounded-2xl p-6 hover:border-gold/40 transition-all duration-500 shadow-card hover-lift"
            >
              <Quote className="absolute top-4 right-4 w-6 h-6 text-primary/10 group-hover:text-primary/20 transition-colors duration-500" />

              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star
                    key={si}
                    className={`w-3.5 h-3.5 transition-colors duration-300 ${
                      si < review.rating ? 'text-primary fill-primary' : 'text-muted/40'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-secondary-foreground/70 font-thai mb-5 leading-relaxed">
                "{review.comment}"
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-border/40">
                <span className="text-xs text-primary font-thai font-medium">{review.name}</span>
                {review.verified && (
                  <span className="text-[10px] text-muted-foreground/60 font-thai flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                    ซื้อจริง
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-[10px] text-muted-foreground/40 font-thai mt-10"
        >
          * รีวิวจากประสบการณ์ส่วนบุคคล ผลลัพธ์อาจแตกต่างกันในแต่ละบุคคล
        </motion.p>
      </div>
    </section>
  );
}
