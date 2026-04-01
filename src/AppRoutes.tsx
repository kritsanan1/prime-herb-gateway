import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// Lazy load pages to reduce initial bundle size
const Index = lazy(() => import('./pages/Index'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const OrderTracking = lazy(() => import('./pages/OrderTracking'));
const Admin = lazy(() => import('./pages/Admin'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const BrandStory = lazy(() => import('./pages/BrandStory'));
const Articles = lazy(() => import('./pages/Articles'));
const ArticleDetail = lazy(() => import('./pages/ArticleDetail'));
const NotFound = lazy(() => import('./pages/NotFound'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success/:orderNumber" element={<OrderSuccess />} />
        <Route path="/tracking" element={<OrderTracking />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/brand-story" element={<BrandStory />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/articles/:slug" element={<ArticleDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;