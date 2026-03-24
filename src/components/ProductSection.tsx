import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Minus, Plus, ShoppingBag, Zap, Package, Eye, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import ProductGallery from '@/components/ProductGallery';

const FEATURE_ICONS = [
  { icon: Award, label: 'สมุนไพรคัดสรรคุณภาพสูง' },
  { icon: Package, label: 'แพ็กเกจพรีเมียม พกพาสะดวก' },
  { icon: Eye, label: 'จัดส่งแบบเป็นส่วนตัว' },
  { icon: Zap, label: 'ผลิตในโรงงานมาตรฐาน' },
];

const PRODUCT_IMAGES = [
  { src: '/images/hero-bg.png', alt: 'Dr.Arty Prime Herb - สูตรพรีเมี่ยมจากธรรมชาติ' },
  { src: '/images/product-gallery5.png', alt: 'Dr.Arty Prime Herb - สงกรานต์มั่นใจใหม่' },
  { src: '/images/product-gallery11.png', alt: 'Dr.Arty Prime Herb - Limited Edition' },
  { src: '/images/product-launch.png', alt: 'Dr.Arty Prime Herb - เปิดตัวแล้ว' },
];

interface ProductData {
  id: string;
  name: string;
  description: string;
  short_desc: string;
  price: number;
  original_price: number | null;
  image_url: string;
  stock: number;
  features: string[];
  category: string;
}

export default function ProductSection() {
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<ProductData | null>(null);
  const { addItem } = useCart();

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const glowY = useTransform(scrollYProgress, [0, 1], ['0%', '-20%']);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.2, 0.5, 0.5, 0.2]);

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) {
          setProduct({
            ...data,
            features: Array.isArray(data.features) ? data.features as string[] : [],
          });
        }
      });
  }, []);

  if (!product) return null;

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      description: product.description,
      shortDesc: product.short_desc,
      price: product.price,
      originalPrice: product.original_price ?? undefined,
      image: product.image_url,
      stock: product.stock,
      features: product.features,
      category: product.category,
    }, quantity);
    setQuantity(1);
  };

  return (
    <section ref={sectionRef} id="products" className="relative py-24 md:py-36 bg-gradient-dark overflow-hidden">
      {/* Parallax ambient glow */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-radial-gold pointer-events-none"
        style={{ y: glowY, opacity: glowOpacity }}
      />
      <div className="absolute inset-0 noise-overlay pointer-events-none" />

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <p className="text-xs text-primary font-thai tracking-[0.3em] uppercase mb-4">Premium Collection</p>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-gradient-gold mb-4 gold-divider">
            สินค้าของเรา
          </h2>
          <p className="text-muted-foreground font-thai mt-8">ผลิตภัณฑ์พรีเมียมสำหรับผู้ชายยุคใหม่</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            {product.original_price && (
              <motion.div
                initial={{ scale: 0, rotate: -12 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="absolute top-4 left-4 z-10 bg-gradient-gold text-primary-foreground px-4 py-1.5 rounded-full text-xs font-thai font-bold shadow-gold"
              >
                ลด {Math.round((1 - product.price / product.original_price) * 100)}%
              </motion.div>
            )}
            <ProductGallery images={PRODUCT_IMAGES} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-7"
          >
            <div>
              <h3 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4 tracking-wide">
                {product.name}
              </h3>
              <p className="text-muted-foreground font-thai leading-relaxed text-sm">{product.description}</p>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-display font-bold text-gradient-gold">฿{product.price.toLocaleString()}</span>
              {product.original_price && (
                <span className="text-lg text-muted-foreground/60 line-through">฿{product.original_price.toLocaleString()}</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 py-2">
              {FEATURE_ICONS.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-center gap-3 text-sm text-secondary-foreground/70 font-thai group"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                    <f.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span>{f.label}</span>
                </motion.div>
              ))}
            </div>

            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-300"
                  aria-label="ลดจำนวน"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-14 text-center font-thai font-semibold text-foreground">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-3 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-300"
                  aria-label="เพิ่มจำนวน"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-muted-foreground/60 font-thai">เหลือ {product.stock} ชิ้น</span>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                size="lg"
                onClick={handleAdd}
                className="flex-1 bg-gradient-gold text-primary-foreground font-thai font-semibold hover:opacity-90 transition-all duration-500 shadow-gold-intense rounded-xl py-6 group"
              >
                <ShoppingBag className="mr-2 w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                เพิ่มลงตะกร้า
              </Button>
            </div>

            <p className="text-[10px] text-muted-foreground/40 font-thai">
              * ผลิตภัณฑ์เสริมอาหาร ผลลัพธ์อาจแตกต่างกันในแต่ละบุคคล
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
