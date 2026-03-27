import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, Leaf, Shield, Award, Heart, FlaskConical, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const TIMELINE = [
  {
    year: 'จุดเริ่มต้น',
    title: 'จากความเชื่อสู่แบรนด์',
    description: 'คุณอาทิตย์ ผู้ก่อตั้ง Dr.Arty เชื่อมาตลอดว่าผู้ชายยุคใหม่สมควรได้รับการดูแลตัวเองอย่างมีระดับ — ด้วยผลิตภัณฑ์ที่ออกแบบมาเพื่อเสริมสร้างความมั่นใจอย่างพรีเมียม',
    icon: Heart,
  },
  {
    year: 'การวิจัย',
    title: 'คัดสรรสมุนไพรระดับสากล',
    description: 'กระบวนการคัดเลือกวัตถุดิบจากธรรมชาติ 100% ผ่านมาตรฐาน medical-grade — ไม่มียาชา ไม่มีสารเคมีแฝง ไม่มีทางลัด',
    icon: FlaskConical,
  },
  {
    year: 'มาตรฐาน',
    title: 'ผลิตในโรงงานระดับพรีเมียม',
    description: 'ทุกขวดผ่านกระบวนการผลิตที่ได้มาตรฐานสากล ด้วยความพิถีพิถันในทุกขั้นตอน เพื่อมอบคุณภาพที่ดีที่สุด',
    icon: Award,
  },
  {
    year: 'ปรัชญา',
    title: 'มั่นใจอย่างมีระดับ',
    description: 'ทุกรายละเอียด ตั้งแต่สูตร แพ็กเกจ ไปจนถึงประสบการณ์การใช้งาน ถูกออกแบบเพื่อให้ผู้ใช้รู้สึกมั่นใจและภูมิใจ',
    icon: Crown,
  },
];

const VALUES = [
  { icon: Leaf, title: 'สมุนไพรแท้ 100%', desc: 'ไม่มียาชา ไม่มีสารเคมีรุนแรง ปลอดภัยจากธรรมชาติ' },
  { icon: Shield, title: 'น่าเชื่อถือ', desc: 'ความน่าเชื่อถือจากชื่อแบรนด์ มาตรฐาน และการออกแบบ' },
  { icon: Award, title: 'พรีเมียมเข้าถึงได้', desc: 'หรูหราแต่เข้าถึงได้ ไม่ตัดกลุ่มลูกค้ากลาง-บน' },
];

export default function BrandStory() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '-20%']);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.5, 0.85]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main>
        {/* Hero */}
        <section ref={heroRef} className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-cover bg-center scale-110"
            style={{ backgroundImage: `url(/images/hero-bg.png)`, y: bgY }}
          />
          <motion.div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background" style={{ opacity: overlayOpacity }} />
          <div className="absolute inset-0 noise-overlay pointer-events-none" />

          <div className="container relative z-10 py-32 text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
              <Link to="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground font-thai hover:text-primary transition-colors mb-8">
                <ArrowLeft className="w-3 h-3" /> กลับหน้าหลัก
              </Link>
              <p className="text-xs text-primary font-thai tracking-[0.3em] uppercase mb-6">Our Story</p>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-gradient-gold leading-[1.1] mb-6">
                เบื้องหลังทุกขวด
              </h1>
              <p className="text-lg text-muted-foreground font-thai max-w-lg mx-auto leading-relaxed">
                คือปรัชญาของคนที่เชื่อว่า ผู้ชายก็สมควรได้รับสิ่งที่ดีที่สุด
              </p>
            </motion.div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </section>

        {/* Founder Quote */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 noise-overlay pointer-events-none" />
          <div className="container relative z-10 max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="w-16 h-px bg-gradient-gold mx-auto mb-10" />
              <blockquote className="text-xl md:text-2xl font-display font-medium text-foreground leading-relaxed italic mb-8">
                "Dr.Arty คือแบรนด์ดูแลตัวเองระดับพรีเมียมสำหรับผู้ชายยุคใหม่ ที่ผสานสมุนไพรธรรมชาติ 100% เข้ากับมาตรฐาน medical-grade เพื่อมอบประสบการณ์ความมั่นใจอย่างมีระดับ"
              </blockquote>
              <p className="text-sm text-primary font-thai font-semibold">— คุณอาทิตย์</p>
              <p className="text-xs text-muted-foreground font-thai mt-1">ผู้ก่อตั้ง Dr.Arty</p>
              <div className="w-16 h-px bg-gradient-gold mx-auto mt-10" />
            </motion.div>
          </div>
        </section>

        {/* Product Showcase Gallery */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 noise-overlay pointer-events-none" />
          <div className="container relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
              {[
                { src: '/images/gallery/product-display.jpg', alt: 'Dr.Arty Premium Package', span: 'row-span-2' },
                { src: '/images/gallery/brand-confidence.jpg', alt: 'Confidence', span: '' },
                { src: '/images/gallery/product-launch.jpg', alt: 'Product Launch', span: '' },
                { src: '/images/gallery/lifestyle-man.jpg', alt: 'Lifestyle', span: 'md:col-span-2' },
                { src: '/images/gallery/brand-story.jpg', alt: 'Brand Story', span: 'col-span-2 md:col-span-1' },
              ].map((img, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className={`rounded-2xl overflow-hidden border border-border/40 group ${img.span}`}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>


        <section className="relative py-20 md:py-28 bg-gradient-dark overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-radial-gold opacity-30 pointer-events-none" />
          <div className="absolute inset-0 noise-overlay pointer-events-none" />

          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-xs text-primary font-thai tracking-[0.3em] uppercase mb-4">Journey</p>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-gradient-gold gold-divider">
                เส้นทางการพัฒนา
              </h2>
            </motion.div>

            <div className="max-w-3xl mx-auto space-y-0">
              {TIMELINE.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="relative flex gap-6 pb-12 last:pb-0"
                >
                  {/* Vertical line */}
                  <div className="flex flex-col items-center">
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className="w-12 h-12 rounded-full bg-primary/10 border border-gold/30 flex items-center justify-center shrink-0"
                    >
                      <item.icon className="w-5 h-5 text-primary" />
                    </motion.div>
                    {i < TIMELINE.length - 1 && (
                      <motion.div
                        initial={{ height: 0 }}
                        whileInView={{ height: '100%' }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.15, duration: 0.8 }}
                        className="w-px bg-gradient-to-b from-gold/30 to-transparent flex-1 mt-2"
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pt-2 pb-4">
                    <span className="text-[10px] text-primary font-thai tracking-[0.2em] uppercase">{item.year}</span>
                    <h3 className="text-xl font-display font-bold text-foreground mt-1 mb-3">{item.title}</h3>
                    <p className="text-sm text-muted-foreground font-thai leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 noise-overlay pointer-events-none" />
          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-xs text-primary font-thai tracking-[0.3em] uppercase mb-4">Core Values</p>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-gradient-gold gold-divider">
                คุณค่าที่เรายึดมั่น
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {VALUES.map((val, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.7 }}
                  className="text-center group"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    className="w-16 h-16 rounded-2xl bg-primary/10 border border-gold/20 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/20 transition-colors duration-500"
                  >
                    <val.icon className="w-7 h-7 text-primary" />
                  </motion.div>
                  <h3 className="font-display font-bold text-lg text-foreground mb-2">{val.title}</h3>
                  <p className="text-sm text-muted-foreground font-thai leading-relaxed">{val.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative py-20 bg-gradient-dark overflow-hidden">
          <div className="absolute inset-0 noise-overlay pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-radial-gold opacity-20 pointer-events-none" />
          <div className="container relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-4xl font-display font-bold text-gradient-gold mb-6">
                พร้อมสัมผัสความมั่นใจอย่างมีระดับ?
              </h2>
              <Link
                to="/#products"
                className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-gold text-primary-foreground font-thai font-semibold rounded-xl hover:opacity-90 transition-all duration-500 shadow-gold-intense"
              >
                ดูสินค้าของเรา
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
