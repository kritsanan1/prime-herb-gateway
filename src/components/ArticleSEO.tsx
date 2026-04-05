import { useEffect } from 'react';

interface ArticleSEOProps {
  title: string;
  excerpt: string;
  image: string;
  slug: string;
  category: string;
  publishedAt: string;
  readTime: number;
}

const SITE_URL = 'https://prime-herb-gateway.lovable.app';
const SITE_NAME = 'Dr. Arty Prime Herb Intimate Care';

export default function ArticleSEO({ title, excerpt, image, slug, category, publishedAt, readTime }: ArticleSEOProps) {
  const url = `${SITE_URL}/articles/${slug}`;
  const fullTitle = `${title} | ${SITE_NAME}`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper to set/create meta tags
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Standard meta
    setMeta('name', 'description', excerpt);

    // Open Graph
    setMeta('property', 'og:type', 'article');
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', excerpt);
    setMeta('property', 'og:image', image);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('property', 'article:published_time', publishedAt);
    setMeta('property', 'article:section', category);

    // Twitter Card
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', excerpt);
    setMeta('name', 'twitter:image', image);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    // JSON-LD
    const jsonLdId = 'article-jsonld';
    let script = document.getElementById(jsonLdId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = jsonLdId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description: excerpt,
      image,
      url,
      datePublished: publishedAt,
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/placeholder.svg` },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      articleSection: category,
      wordCount: readTime * 200,
    });

    // Cleanup on unmount
    return () => {
      document.title = `${SITE_NAME} | เว็บไซต์อย่างเป็นทางการ`;
      const jsonLd = document.getElementById(jsonLdId);
      if (jsonLd) jsonLd.remove();
      const canonicalEl = document.querySelector('link[rel="canonical"]');
      if (canonicalEl) canonicalEl.remove();
    };
  }, [title, excerpt, image, slug, category, publishedAt, readTime, url, fullTitle]);

  return null;
}
