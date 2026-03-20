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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/95 backdrop-blur-md border-b border-border' : 'bg-transparent'}`}>
      <div className="container flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-lg md:text-xl font-display font-bold text-gradient-gold">Dr.Arty</span>
          <span className="text-xs md:text-sm text-muted-foreground font-thai hidden sm:block">Prime Herb</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6">
          {NAV_ITEMS.map(item => (
            <button
              key={item.href}
              onClick={() => handleNavClick(item.href)}
              className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors font-thai"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="relative p-2 text-secondary-foreground/80 hover:text-primary transition-colors"
            aria-label="ตะกร้าสินค้า"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-gold text-primary-foreground text-xs flex items-center justify-center font-bold"
              >
                {totalItems}
              </motion.span>
            )}
          </button>

          <Button
            onClick={() => handleNavClick('/#products')}
            size="sm"
            className="hidden md:inline-flex bg-gradient-gold text-primary-foreground font-thai font-semibold hover:opacity-90 transition-opacity"
          >
            สั่งซื้อเลย
          </Button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-secondary-foreground/80"
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
            className="lg:hidden bg-background/98 backdrop-blur-md border-b border-border overflow-hidden"
          >
            <nav className="container py-4 flex flex-col gap-3">
              {NAV_ITEMS.map(item => (
                <button
                  key={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className="text-left text-sm text-secondary-foreground/80 hover:text-primary transition-colors py-2 font-thai"
                >
                  {item.label}
                </button>
              ))}
              <Button
                onClick={() => handleNavClick('/#products')}
                className="bg-gradient-gold text-primary-foreground font-thai font-semibold mt-2"
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
