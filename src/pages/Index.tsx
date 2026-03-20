import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ProductSection from '@/components/ProductSection';
import ReviewSection from '@/components/ReviewSection';
import FAQSection from '@/components/FAQSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CartDrawer />
      <main>
        <HeroSection />
        <ProductSection />
        <ReviewSection />
        <FAQSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
