import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, Youtube } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import { ARTICLES } from '@/data/articles';
import { Badge } from '@/components/ui/badge';

export default function Articles() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CartDrawer />

      {/* Hero */}
      <section className="pt-28 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-radial-gold opacity-10" />
          <div className="absolute inset-0 noise-overlay" />
        </div>
        <div className="container relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-display font-bold text-gradient-gold mb-4"
          >
            Dr.Arty Talk
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground font-thai max-w-xl mx-auto"
          >
            บทความและเนื้อหาสำหรับผู้ชายยุคใหม่ที่ใส่ใจในการดูแลตัวเอง
          </motion.p>
          <motion.a
            href="https://www.youtube.com/@ArtyTalk-s6w"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 mt-4 text-sm text-primary hover:opacity-80 transition font-thai"
          >
            <Youtube className="w-5 h-5" />
            ติดตามบน YouTube
          </motion.a>
        </div>
      </section>

      {/* Articles Grid */}
      <main className="flex-1 pb-20">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ARTICLES.map((article, i) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <Link
                  to={`/articles/${article.slug}`}
                  className="group block glass border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-500 hover:shadow-gold/10 hover:shadow-lg"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                    <Badge className="absolute top-3 left-3 bg-primary/90 text-primary-foreground font-thai text-xs">
                      {article.category}
                    </Badge>
                  </div>
                  <div className="p-5 space-y-3">
                    <h2 className="font-display font-bold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                      {article.title}
                    </h2>
                    <p className="text-sm text-muted-foreground font-thai line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-thai">
                        <Clock className="w-3.5 h-3.5" />
                        อ่าน {article.readTime} นาที
                      </span>
                      <span className="flex items-center gap-1 text-primary group-hover:gap-2 transition-all duration-300 font-thai">
                        อ่านต่อ <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
