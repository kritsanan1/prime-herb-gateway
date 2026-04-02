import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Calendar, Youtube, Share2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import { ARTICLES } from '@/data/articles';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

interface DBArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  read_time: number;
  published_at: string;
  youtube_url: string | null;
}

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<DBArticle | null>(null);
  const [related, setRelated] = useState<DBArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug!)
        .eq('is_published', true)
        .maybeSingle();

      if (data) {
        setArticle(data as DBArticle);
        // Fetch related
        const { data: rel } = await supabase
          .from('articles')
          .select('id, slug, title, image, category, read_time, published_at, excerpt, content, youtube_url')
          .eq('is_published', true)
          .neq('id', data.id)
          .limit(3);
        setRelated((rel as DBArticle[]) || []);
      } else {
        // Fallback to static
        const staticArticle = ARTICLES.find(a => a.slug === slug);
        if (staticArticle) {
          setArticle({
            id: staticArticle.id, slug: staticArticle.slug, title: staticArticle.title,
            excerpt: staticArticle.excerpt, content: staticArticle.content, image: staticArticle.image,
            category: staticArticle.category, read_time: staticArticle.readTime,
            published_at: staticArticle.publishedAt, youtube_url: staticArticle.youtubeUrl || null,
          });
          setRelated(ARTICLES.filter(a => a.id !== staticArticle.id).slice(0, 3).map(a => ({
            id: a.id, slug: a.slug, title: a.title, excerpt: a.excerpt, content: a.content,
            image: a.image, category: a.category, read_time: a.readTime,
            published_at: a.publishedAt, youtube_url: a.youtubeUrl || null,
          })));
        } else {
          setNotFound(true);
        }
      }
      setLoading(false);
    };
    fetch();
  }, [slug]);

  if (notFound) return <Navigate to="/articles" replace />;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: article?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <CartDrawer />
        <main className="flex-1 pt-24 pb-20">
          <div className="container max-w-3xl space-y-6">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="aspect-video w-full rounded-2xl" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!article) return <Navigate to="/articles" replace />;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CartDrawer />

      <main className="flex-1 pt-24 pb-20">
        <article className="container max-w-3xl">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Link to="/articles" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition font-thai mb-8">
              <ArrowLeft className="w-4 h-4" /> กลับไปบทความทั้งหมด
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative rounded-2xl overflow-hidden mb-8 aspect-video">
            <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-wrap items-center gap-3 mb-6">
            <Badge className="bg-primary/90 text-primary-foreground font-thai">{article.category}</Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground font-thai">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(article.published_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground font-thai">
              <Clock className="w-3.5 h-3.5" /> อ่าน {article.read_time} นาที
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="text-2xl md:text-4xl font-display font-bold text-foreground mb-8 leading-tight">
            {article.title}
          </motion.h1>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="prose prose-invert prose-gold max-w-none font-thai">
            {article.content.split('\n\n').map((para, i) => (
              <p key={i} className="text-secondary-foreground/80 leading-relaxed mb-4 text-[15px]">{para}</p>
            ))}
          </motion.div>

          {article.youtube_url && (
            <motion.a href={article.youtube_url} target="_blank" rel="noopener noreferrer" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex items-center gap-4 glass border border-border rounded-xl p-5 mt-8 hover:border-primary/30 transition-all group">
              <div className="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center flex-shrink-0">
                <Youtube className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="font-display font-bold text-foreground group-hover:text-primary transition-colors">ดูวิดีโอบน Dr.Arty Talk</p>
                <p className="text-xs text-muted-foreground font-thai">ติดตามเนื้อหาเพิ่มเติมบน YouTube</p>
              </div>
            </motion.a>
          )}

          <div className="flex justify-end mt-8">
            <Button variant="outline" size="sm" onClick={handleShare} className="border-border text-muted-foreground font-thai">
              <Share2 className="w-4 h-4 mr-2" /> แชร์บทความ
            </Button>
          </div>

          {related.length > 0 && (
            <section className="mt-16 border-t border-border pt-12">
              <h2 className="text-xl font-display font-bold text-foreground mb-6">บทความที่เกี่ยวข้อง</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {related.map(a => (
                  <Link key={a.id} to={`/articles/${a.slug}`} className="group glass border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all">
                    <div className="aspect-video overflow-hidden">
                      <img src={a.image} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-display font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">{a.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>

      <Footer />
    </div>
  );
}
