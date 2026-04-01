import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ProductSection from '@/components/ProductSection';
import ContentPillars from '@/components/ContentPillars';
import ReviewSection from '@/components/ReviewSection';
import ArticlesPreview from '@/components/ArticlesPreview';
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
        <ContentPillars />
        <ReviewSection />
        <FAQSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
