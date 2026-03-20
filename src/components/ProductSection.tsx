import { useState } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag, Zap, Package, Eye, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { PRODUCTS } from '@/data';
import productImg from '@/assets/product-hero.jpg';

const FEATURE_ICONS = [
  { icon: Award, label: 'สมุนไพรคัดสรรคุณภาพสูง' },
  { icon: Package, label: 'แพ็กเกจพรีเมียม พกพาสะดวก' },
  { icon: Eye, label: 'จัดส่งแบบเป็นส่วนตัว' },
  { icon: Zap, label: 'ผลิตในโรงงานมาตรฐาน' },
];

export default function ProductSection() {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const product = PRODUCTS[0];

  const handleAdd = () => {
    addItem(product, quantity);
    setQuantity(1);
  };

  return (
    <section id="products" className="py-20 md:py-32 bg-gradient-dark">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gradient-gold mb-4">สินค้าของเรา</h2>
          <p className="text-muted-foreground font-thai">ผลิตภัณฑ์พรีเมียมสำหรับผู้ชายยุคใหม่</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative group"
          >
            <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-card border border-border glow-gold">
              <img
                src={productImg}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
            </div>
            {product.originalPrice && (
              <div className="absolute top-4 left-4 bg-gradient-gold text-primary-foreground px-3 py-1 rounded-full text-xs font-thai font-bold">
                ลด {Math.round((1 - product.price / product.originalPrice) * 100)}%
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            <div>
              <p className="text-xs text-primary font-thai tracking-wider uppercase mb-2">Premium Collection</p>
              <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">{product.name}</h3>
              <p className="text-muted-foreground font-thai leading-relaxed text-sm">{product.description}</p>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-display font-bold text-primary">฿{product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">฿{product.originalPrice.toLocaleString()}</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {FEATURE_ICONS.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-secondary-foreground/80 font-thai">
                  <f.icon className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>{f.label}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center border border-border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 text-muted-foreground hover:text-primary transition-colors"
                  aria-label="ลดจำนวน"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-thai font-semibold text-foreground">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-3 text-muted-foreground hover:text-primary transition-colors"
                  aria-label="เพิ่มจำนวน"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-muted-foreground font-thai">เหลือ {product.stock} ชิ้น</span>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                size="lg"
                onClick={handleAdd}
                className="flex-1 bg-gradient-gold text-primary-foreground font-thai font-semibold hover:opacity-90 transition-opacity shadow-gold"
              >
                <ShoppingBag className="mr-2 w-4 h-4" />
                เพิ่มลงตะกร้า
              </Button>
            </div>

            <p className="text-[10px] text-muted-foreground/60 font-thai">
              * ผลิตภัณฑ์เสริมอาหาร ผลลัพธ์อาจแตกต่างกันในแต่ละบุคคล
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
