import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';

const NAV_ITEMS = [
  { label: 'หน้าแรก', href: '/' },
  { label: 'สินค้า', href: '/#products' },
  { label: 'รีวิว', href: '/#reviews' },
  { label: 'คำถามพบบ่อย', href: '/#faq' },
  { label: 'ติดตามคำสั่งซื้อ', href: '/tracking' },
  { label: 'ติดต่อ', href: '/#contact' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems, setIsOpen } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const handleNavClick = (href: string) => {
    if (href.startsWith('/#')) {
      const id = href.slice(2);
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(href);
    }
    setMobileOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'glass border-b border-border/50 shadow-card'
          : 'bg-transparent'
      }`}
    >
      <div className="container flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center gap-3 group">
          <span className="text-lg md:text-xl font-display font-bold text-gradient-gold tracking-wide group-hover:opacity-80 transition-opacity duration-300">
            Dr.Arty
          </span>
          <span className="text-[10px] md:text-xs text-muted-foreground font-thai hidden sm:block tracking-[0.15em] uppercase">
            Prime Herb Intimate Care
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.href}
              onClick={() => handleNavClick(item.href)}
              className="relative px-4 py-2 text-sm text-secondary-foreground/70 hover:text-primary transition-colors duration-300 font-thai group"
            >
              {item.label}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-primary group-hover:w-3/4 transition-all duration-300" />
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="relative p-2.5 text-secondary-foreground/70 hover:text-primary transition-all duration-300 rounded-xl hover:bg-primary/5"
            aria-label="ตะกร้าสินค้า"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-gradient-gold text-primary-foreground text-[10px] flex items-center justify-center font-bold shadow-gold"
              >
                {totalItems}
              </motion.span>
            )}
          </button>

          <Button
            onClick={() => handleNavClick('/#products')}
            size="sm"
            className="hidden md:inline-flex bg-gradient-gold text-primary-foreground font-thai font-semibold hover:opacity-90 transition-all duration-300 shadow-gold rounded-lg"
          >
            สั่งซื้อเลย
          </Button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-secondary-foreground/70 hover:text-primary transition-colors"
            aria-label="เมนู"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden glass border-b border-border/50 overflow-hidden"
          >
            <nav className="container py-6 flex flex-col gap-1">
              {NAV_ITEMS.map((item, i) => (
                <motion.button
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleNavClick(item.href)}
                  className="text-left text-sm text-secondary-foreground/70 hover:text-primary transition-colors py-3 px-4 font-thai rounded-lg hover:bg-primary/5"
                >
                  {item.label}
                </motion.button>
              ))}
              <Button
                onClick={() => handleNavClick('/#products')}
                className="bg-gradient-gold text-primary-foreground font-thai font-semibold mt-3 shadow-gold"
              >
                สั่งซื้อเลย
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
