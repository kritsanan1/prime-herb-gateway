import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, subtotal, totalItems } = useCart();
  const navigate = useNavigate();

  const goToCheckout = () => {
    setIsOpen(false);
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h2 className="font-display font-bold text-lg text-foreground">ตะกร้าสินค้า</h2>
                <span className="text-xs text-muted-foreground font-thai">({totalItems})</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground font-thai">ยังไม่มีสินค้าในตะกร้า</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map(item => (
                    <div key={item.product.id} className="flex gap-4 bg-secondary/50 rounded-xl p-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-thai font-medium text-foreground truncate">{item.product.name}</h3>
                        <p className="text-sm text-primary font-display font-bold mt-1">฿{item.product.price.toLocaleString()}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-border rounded">
                            <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1.5 text-muted-foreground hover:text-primary">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-thai">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product.id, Math.min(item.product.stock, item.quantity + 1))} className="p-1.5 text-muted-foreground hover:text-primary">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button onClick={() => removeItem(item.product.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-border p-6 space-y-4">
                <div className="flex justify-between text-sm font-thai">
                  <span className="text-muted-foreground">ยอดรวม</span>
                  <span className="text-foreground font-bold">฿{subtotal.toLocaleString()}</span>
                </div>
                <Button
                  onClick={goToCheckout}
                  className="w-full bg-gradient-gold text-primary-foreground font-thai font-semibold hover:opacity-90 shadow-gold"
                  size="lg"
                >
                  ดำเนินการสั่งซื้อ
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
