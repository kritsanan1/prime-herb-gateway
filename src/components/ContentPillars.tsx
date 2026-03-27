import { motion } from 'framer-motion';
import { BookOpen, Microscope, Star, Crown } from 'lucide-react';

const PILLARS = [
  {
    icon: BookOpen,
    title: 'Brand Story',
    subtitle: 'เรื่องราวของแบรนด์',
    description: 'จากปรัชญาของผู้ก่อตั้งสู่แบรนด์ที่ผู้ชายไว้วางใจ — เบื้องหลังทุกขวดคือความตั้งใจที่จะมอบสิ่งที่ดีที่สุด',
    tone: 'Warm · Inspirational · Authentic',
    percentage: 25,
    image: '/images/gallery/brand-story.jpg',
  },
  {
    icon: Microscope,
    title: 'Product Differentiation',
    subtitle: 'จุดต่างที่พิสูจน์ได้',
    description: 'สมุนไพรแท้ 100% ผ่านกระบวนการคัดเลือกมาตรฐานสากล — ไม่มีทางลัด ไม่มียาชา ไม่มีสารเคมีแฝง',
    tone: 'Authoritative · Clean · Educational',
    percentage: 30,
    image: '/images/gallery/product-premium.jpg',
  },
  {
    icon: Star,
    title: 'Reviews & Social Proof',
    subtitle: 'เสียงจากผู้ใช้จริง',
    description: 'ประสบการณ์จริงจากผู้ที่ไว้วางใจ — ความรู้สึกมั่นใจ ความภูมิใจ และความพอใจที่สัมผัสได้',
    tone: 'Genuine · Relatable · Subtle Pride',
    percentage: 25,
    image: '/images/gallery/before-after.jpg',
  },
  {
    icon: Crown,
    title: 'Lifestyle Premium',
    subtitle: 'วิถีสุภาพบุรุษ',
    description: 'การดูแลตัวเองอย่างมีระดับคือจุดเริ่มต้นของความมั่นใจ — ทุกเช้าที่เริ่มต้นดี คือวันที่ดีกว่า',
    tone: 'Aspirational · Cinematic · Elegant',
    percentage: 20,
    image: '/images/gallery/lifestyle-man.jpg',
  },
];

export default function ContentPillars() {
  return (
    <section className="relative py-24 md:py-36 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-radial-gold opacity-25 pointer-events-none" />
      <div className="absolute inset-0 noise-overlay pointer-events-none" />

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <p className="text-xs text-primary font-thai tracking-[0.3em] uppercase mb-4">Content Strategy</p>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-gradient-gold mb-4 gold-divider">
            4 เสาหลักของแบรนด์
          </h2>
          <p className="text-muted-foreground font-thai mt-8 max-w-lg mx-auto">
            กลยุทธ์การสื่อสารที่ออกแบบมาเพื่อสร้างความมั่นใจอย่างมีระดับในทุกจุดสัมผัส
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {PILLARS.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="group relative bg-gradient-card border border-border/60 rounded-2xl hover:border-gold/40 transition-all duration-500 shadow-card hover-lift overflow-hidden"
            >
              {/* Image */}
              <div className="h-36 overflow-hidden">
                <img
                  src={pillar.image}
                  alt={pillar.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-transparent to-card/90" />
              </div>

              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-radial-gold opacity-40" />
              </div>

              {/* Percentage badge */}
              <div className="absolute top-4 right-4 text-[10px] text-primary/40 font-display font-bold z-10">
                {pillar.percentage}%
              </div>

              <div className="relative z-10">
                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors duration-500"
                >
                  <pillar.icon className="w-5 h-5 text-primary" />
                </motion.div>

                {/* Title */}
                <h3 className="font-display font-bold text-lg text-foreground mb-1 tracking-wide">
                  {pillar.title}
                </h3>
                <p className="text-xs text-primary font-thai mb-4">{pillar.subtitle}</p>

                {/* Description */}
                <p className="text-sm text-muted-foreground font-thai leading-relaxed mb-5">
                  {pillar.description}
                </p>

                {/* Tone tag */}
                <div className="pt-4 border-t border-border/40">
                  <p className="text-[10px] text-muted-foreground/50 font-thai tracking-wider">
                    {pillar.tone}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-0.5 bg-border/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pillar.percentage}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.15, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full bg-gradient-gold rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
