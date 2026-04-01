import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface ProductGalleryProps {
  images: { src: string; alt: string }[];
}

function getDistance(t1: React.Touch, t2: React.Touch) {
  return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [selectedImg, setSelectedImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [direction, setDirection] = useState(0);

  // Pinch-to-zoom state
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const pinchRef = useRef({ startDist: 0, startScale: 1 });
  const panRef = useRef({ startX: 0, startY: 0, startTx: 0, startTy: 0 });
  const lastTapRef = useRef(0);

  const navigate = useCallback((dir: 1 | -1) => {
    setDirection(dir);
    setSelectedImg(prev => (prev + dir + images.length) % images.length);
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, [images.length]);

  // Swipe handler for main image
  const handleDragEnd = useCallback((_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    const threshold = 50;
    const velocityThreshold = 300;
    if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
      navigate(1);
    } else if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
      navigate(-1);
    }
  }, [navigate]);

  // Lightbox touch handlers for pinch-to-zoom
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      pinchRef.current = {
        startDist: getDistance(e.touches[0], e.touches[1]),
        startScale: scale,
      };
    } else if (e.touches.length === 1 && scale > 1) {
      panRef.current = {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        startTx: translate.x,
        startTy: translate.y,
      };
    }
  }, [scale, translate]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = getDistance(e.touches[0], e.touches[1]);
      const newScale = Math.min(3, Math.max(1, pinchRef.current.startScale * (dist / pinchRef.current.startDist)));
      setScale(newScale);
      if (newScale <= 1) setTranslate({ x: 0, y: 0 });
    } else if (e.touches.length === 1 && scale > 1) {
      const dx = e.touches[0].clientX - panRef.current.startX;
      const dy = e.touches[0].clientY - panRef.current.startY;
      setTranslate({ x: panRef.current.startTx + dx, y: panRef.current.startTy + dy });
    }
  }, [scale]);

  const handleTouchEnd = useCallback(() => {
    if (scale <= 1.05) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    }
  }, [scale]);

  // Double-tap to toggle zoom
  const handleDoubleTap = useCallback((e: React.TouchEvent) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      e.preventDefault();
      if (scale > 1) {
        setScale(1);
        setTranslate({ x: 0, y: 0 });
      } else {
        setScale(2);
      }
    }
    lastTapRef.current = now;
  }, [scale]);

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <>
      <div className="space-y-4">
        {/* Main image with swipe */}
        <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-card border border-border/60 glow-gold relative group cursor-pointer">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.img
              key={selectedImg}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={handleDragEnd}
              src={images[selectedImg].src}
              alt={images[selectedImg].alt}
              className="w-full h-full object-cover touch-pan-y"
              loading="lazy"
              onClick={() => setLightboxOpen(true)}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
              <ZoomIn className="w-5 h-5 text-foreground" />
            </div>
          </div>

          {/* Chevron buttons — hidden on mobile */}
          <button
            onClick={(e) => { e.stopPropagation(); navigate(-1); }}
            className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full glass items-center justify-center text-muted-foreground hover:text-foreground transition-all opacity-0 group-hover:opacity-100"
            aria-label="ภาพก่อนหน้า"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(1); }}
            className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full glass items-center justify-center text-muted-foreground hover:text-foreground transition-all opacity-0 group-hover:opacity-100"
            aria-label="ภาพถัดไป"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Swipe indicator dots — visible on mobile */}
          <div className="flex md:hidden absolute bottom-3 left-1/2 -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                className={`block rounded-full transition-all duration-300 ${
                  selectedImg === i ? 'w-5 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-muted-foreground/40'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Thumbnails */}
        <div className="flex gap-3">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > selectedImg ? 1 : -1); setSelectedImg(i); }}
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

      {/* Lightbox with pinch-to-zoom */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-background/98 backdrop-blur-xl flex items-center justify-center"
            onClick={() => { setLightboxOpen(false); setScale(1); setTranslate({ x: 0, y: 0 }); }}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); setScale(1); setTranslate({ x: 0, y: 0 }); }}
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

            <motion.div
              key={selectedImg}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-[90vw] max-h-[85vh] overflow-hidden touch-none"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => { handleDoubleTap(e); handleTouchStart(e); }}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={images[selectedImg].src}
                alt={images[selectedImg].alt}
                className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl transition-transform duration-100"
                style={{
                  transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
                }}
                draggable={false}
              />
            </motion.div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setDirection(i > selectedImg ? 1 : -1); setSelectedImg(i); setScale(1); setTranslate({ x: 0, y: 0 }); }}
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
