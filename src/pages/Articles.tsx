import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, Youtube } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import { ARTICLES } from '@/data/articles';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface DBArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  read_time: number;
  published_at: string;
}

export default function Articles() {
  const [articles, setArticles] = useState<DBArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'บทความ Dr.Arty Talk | Dr. Arty Prime Herb Intimate Care';
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    setMeta('name', 'description', 'บทความและเนื้อหาสำหรับผู้ชายยุคใหม่ที่ใส่ใจในการดูแลตัวเอง โดย Dr.Arty Talk');
    setMeta('property', 'og:title', 'บทความ Dr.Arty Talk');
    setMeta('property', 'og:description', 'บทความและเนื้อหาสำหรับผู้ชายยุคใหม่ที่ใส่ใจในการดูแลตัวเอง');
    setMeta('property', 'og:type', 'website');
    return () => { document.title = 'Dr. Arty Prime Herb Intimate Care | เว็บไซต์อย่างเป็นทางการ'; };
  }, []);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('articles')
        .select('id, slug, title, excerpt, image, category, read_time, published_at')
        .eq('is_published', true)
        .order('published_at', { ascending: false });
      if (data && data.length > 0) {
        setArticles(data);
      } else {
        // Fallback to static
        setArticles(ARTICLES.map(a => ({
          id: a.id, slug: a.slug, title: a.title, excerpt: a.excerpt,
          image: a.image, category: a.category, read_time: a.readTime,
          published_at: a.publishedAt,
        })));
      }
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CartDrawer />

      <section className="pt-28 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-radial-gold opacity-10" />
          <div className="absolute inset-0 noise-overlay" />
        </div>
        <div className="container relative z-10 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-display font-bold text-gradient-gold mb-4">
            Dr.Arty Talk
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-muted-foreground font-thai max-w-xl mx-auto">
            บทความและเนื้อหาสำหรับผู้ชายยุคใหม่ที่ใส่ใจในการดูแลตัวเอง
          </motion.p>
          <motion.a href="https://www.youtube.com/@ArtyTalk-s6w" target="_blank" rel="noopener noreferrer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 mt-4 text-sm text-primary hover:opacity-80 transition font-thai">
            <Youtube className="w-5 h-5" /> ติดตามบน YouTube
          </motion.a>
        </div>
      </section>

      <main className="flex-1 pb-20">
        <div className="container">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-border overflow-hidden">
                  <Skeleton className="aspect-video w-full" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article, i) => (
                <motion.div key={article.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.4 }}>
                  <Link to={`/articles/${article.slug}`} className="group block glass border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-500 hover:shadow-gold/10 hover:shadow-lg">
                    <div className="relative aspect-video overflow-hidden">
                      <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                      <Badge className="absolute top-3 left-3 bg-primary/90 text-primary-foreground font-thai text-xs">{article.category}</Badge>
                    </div>
                    <div className="p-5 space-y-3">
                      <h2 className="font-display font-bold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">{article.title}</h2>
                      <p className="text-sm text-muted-foreground font-thai line-clamp-2">{article.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 font-thai"><Clock className="w-3.5 h-3.5" /> อ่าน {article.read_time} นาที</span>
                        <span className="flex items-center gap-1 text-primary group-hover:gap-2 transition-all duration-300 font-thai">อ่านต่อ <ArrowRight className="w-3.5 h-3.5" /></span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
