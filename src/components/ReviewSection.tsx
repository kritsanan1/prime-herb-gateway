import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { REVIEWS } from '@/data';

export default function ReviewSection() {
  return (
    <section id="reviews" className="py-20 md:py-32">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gradient-gold mb-4">เสียงจากลูกค้า</h2>
          <p className="text-muted-foreground font-thai">ประสบการณ์จริงจากผู้ใช้สินค้า</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {REVIEWS.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-gradient-card border border-border rounded-xl p-6 hover:border-gold transition-colors shadow-card"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star
                    key={si}
                    className={`w-4 h-4 ${si < review.rating ? 'text-primary fill-primary' : 'text-muted'}`}
                  />
                ))}
              </div>
              <p className="text-sm text-secondary-foreground/80 font-thai mb-4 leading-relaxed">"{review.comment}"</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-primary font-thai font-medium">{review.name}</span>
                {review.verified && (
                  <span className="text-[10px] text-muted-foreground font-thai">✓ ซื้อจริง</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-[10px] text-muted-foreground/50 font-thai mt-8">
          * รีวิวจากประสบการณ์ส่วนบุคคล ผลลัพธ์อาจแตกต่างกันในแต่ละบุคคล
        </p>
      </div>
    </section>
  );
}
