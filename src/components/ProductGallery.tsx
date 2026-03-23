import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface ProductGalleryProps {
  images: { src: string; alt: string }[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [selectedImg, setSelectedImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const navigate = useCallback((dir: 1 | -1) => {
    setSelectedImg(prev => (prev + dir + images.length) % images.length);
  }, [images.length]);

  return (
    <>
      <div className="space-y-4">
        {/* Main image */}
        <div
          className="aspect-square rounded-2xl overflow-hidden bg-gradient-card border border-border/60 glow-gold relative group cursor-pointer"
          onClick={() => setLightboxOpen(true)}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={selectedImg}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              src={images[selectedImg].src}
              alt={images[selectedImg].alt}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
              <ZoomIn className="w-5 h-5 text-foreground" />
            </div>
          </div>
        </div>

        {/* Thumbnails */}
        <div className="flex gap-3">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedImg(i)}
              className={`relative w-18 h-18 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                selectedImg === i
                  ? 'border-primary shadow-gold scale-105'
                  : 'border-border/40 hover:border-muted-foreground/40 opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-background/98 backdrop-blur-xl flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
              className="absolute top-6 right-6 p-3 text-muted-foreground hover:text-foreground transition-colors z-10 rounded-full glass"
              aria-label="ปิด"
            >
              <X className="w-5 h-5" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); navigate(-1); }}
              className="absolute left-6 top-1/2 -translate-y-1/2 p-3 text-muted-foreground hover:text-foreground transition-colors z-10 rounded-full glass"
              aria-label="ภาพก่อนหน้า"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); navigate(1); }}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-3 text-muted-foreground hover:text-foreground transition-colors z-10 rounded-full glass"
              aria-label="ภาพถัดไป"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <motion.img
              key={selectedImg}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              src={images[selectedImg].src}
              alt={images[selectedImg].alt}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setSelectedImg(i); }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    selectedImg === i ? 'bg-primary w-6' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
