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
      <div className="space-y-3">
        <div
          className="aspect-square rounded-2xl overflow-hidden bg-gradient-card border border-border glow-gold relative group cursor-pointer"
          onClick={() => setLightboxOpen(true)}
        >
          <img
            src={images[selectedImg].src}
            alt={images[selectedImg].alt}
            className="w-full h-full object-cover transition-all duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors flex items-center justify-center">
            <ZoomIn className="w-8 h-8 text-foreground opacity-0 group-hover:opacity-80 transition-opacity" />
          </div>
        </div>
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedImg(i)}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                selectedImg === i ? 'border-primary' : 'border-border hover:border-muted-foreground'
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
            className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors z-10"
              aria-label="ปิด"
            >
              <X className="w-6 h-6" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); navigate(-1); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground transition-colors z-10"
              aria-label="ภาพก่อนหน้า"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); navigate(1); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground transition-colors z-10"
              aria-label="ภาพถัดไป"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            <motion.img
              key={selectedImg}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              src={images[selectedImg].src}
              alt={images[selectedImg].alt}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setSelectedImg(i); }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    selectedImg === i ? 'bg-primary' : 'bg-muted-foreground/40'
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
