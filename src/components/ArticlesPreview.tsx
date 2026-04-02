import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Youtube } from 'lucide-react';
import { ARTICLES } from '@/data/articles';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

const featured = ARTICLES.slice(0, 4);

export default function ArticlesPreview() {
  return (
    <section id="articles" className="py-20 md:py-28 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 noise-overlay" />
      </div>

      <div className="container relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-xs tracking-[0.3em] uppercase text-primary font-thai mb-3 block">Content</span>
          <h2 className="text-2xl md:text-4xl font-display font-bold text-foreground mb-4">
            Dr.Arty <span className="text-gradient-gold">Talk</span>
          </h2>
          <p className="text-sm text-muted-foreground font-thai max-w-lg mx-auto">
            บทความและเนื้อหาสำหรับผู้ชายยุคใหม่ที่ใส่ใจในการดูแลตัวเอง
          </p>
          <a
            href="https://www.youtube.com/@ArtyTalk-s6w"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-3 text-xs text-red-500 hover:text-red-400 transition font-thai"
          >
            <Youtube className="w-4 h-4" />
            ติดตามบน YouTube
          </a>
        </motion.div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {featured.map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                to={`/articles/${article.slug}`}
                className="group block glass border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-500 hover:shadow-gold/10 hover:shadow-lg h-full"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                  <Badge className="absolute top-2 left-2 bg-primary/90 text-primary-foreground font-thai text-[10px]">
                    {article.category}
                  </Badge>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-display font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {article.title}
                  </h3>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1 font-thai">
                      <Clock className="w-3 h-3" />
                      {article.readTime} นาที
                    </span>
                    <span className="flex items-center gap-1 text-primary font-thai">
                      อ่านต่อ <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link
            to="/articles"
            className="inline-flex items-center gap-2 text-sm text-primary hover:opacity-80 transition font-thai group"
          >
            ดูบทความทั้งหมด
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
