# Prime Herb Gateway 🌿

A modern e-commerce platform for local herb and wellness products, built with React, TypeScript, and Cloudflare Pages.

## 🎯 Project Overview

**Prime Herb Gateway** is a comprehensive e-commerce solution designed for selling local herbs, wellness products, and natural supplements. The platform combines modern web technologies with a user-friendly interface to create an engaging shopping experience.

### ✨ Key Features

- **🛍️ E-commerce Platform**: Complete shopping cart and checkout system
- **📱 Responsive Design**: Mobile-first design that works on all devices  
- **🔐 User Authentication**: Secure user registration and login system
- **📦 Order Management**: Order tracking and history
- **📝 Content Management**: Blog/articles section for content marketing
- **⭐ Product Reviews**: Customer review and rating system
- **🛡️ Admin Dashboard**: Backend management for products and orders
- **📊 Analytics**: Sales and performance tracking

### 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui with Radix UI components
- **Styling**: Tailwind CSS with custom animations
- **State Management**: React Context API, TanStack Query
- **Backend**: Supabase (Database + Authentication)
- **Deployment**: Cloudflare Pages
- **Build Tool**: Vite

### 🚀 URLs & Deployment

- **GitHub Repository**: https://github.com/kritsanan1/prime-herb-gateway
- **Production**: *(To be deployed to Cloudflare Pages)*
- **Development**: Local development server

### 📁 Project Structure

```
webapp/
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React context providers
│   ├── pages/          # Page components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   └── types/          # TypeScript type definitions
├── public/             # Static assets
├── dist/               # Build output
└── wrangler.jsonc      # Cloudflare configuration
```

### 🛍️ E-commerce Features

#### Product Management
- Product catalog with categories
- Product details with images and descriptions
- Inventory tracking
- Price management
- Product reviews and ratings

#### Shopping Experience
- Add to cart functionality
- Shopping cart with quantity management
- Wishlist/favorites
- Product search and filtering
- Related product recommendations

#### Checkout Process
- Multi-step checkout flow
- Guest checkout option
- Multiple payment methods
- Order confirmation
- Email notifications

#### Order Management
- Order tracking
- Order history
- Order status updates
- Return/refund processing

### 🔧 Development Setup

#### Prerequisites
- Node.js 18+
- npm or yarn
- Cloudflare account (for deployment)

#### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

#### Deployment to Cloudflare Pages
```bash
# Build the project
npm run build

# Deploy to Cloudflare Pages
npm run deploy
```

### 🔐 Environment Variables

Create a `.env` file with:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

### 🌟 Key Pages

- **Homepage**: Hero section, featured products, content pillars
- **Product Catalog**: Browse and search products
- **Product Detail**: Individual product pages with reviews
- **Shopping Cart**: Cart management and checkout
- **Checkout**: Order processing and payment
- **Order Success**: Order confirmation page
- **Order Tracking**: Track order status
- **Articles/Blog**: Content marketing section
- **Brand Story**: About the brand and mission
- **Admin Dashboard**: Product and order management

### 📊 Performance & SEO

- Optimized for Core Web Vitals
- Server-side rendering ready
- SEO-friendly URLs and meta tags
- Image optimization
- Code splitting and lazy loading

### 🔒 Security Features

- HTTPS by default (Cloudflare SSL)
- Input validation and sanitization
- Rate limiting
- XSS protection
- CSRF protection

### 📱 Mobile Optimization

- Responsive design
- Touch-friendly interface
- Optimized images for mobile
- Fast loading on mobile networks
- Progressive Web App (PWA) ready

### 🚀 Deployment Status

- **Development**: ✅ Complete
- **Build**: ✅ Successful
- **GitHub**: ✅ Repository configured
- **Cloudflare**: 🔄 Ready for deployment

### 🎯 Next Steps

1. Configure Cloudflare API key
2. Deploy to Cloudflare Pages
3. Set up custom domain (optional)
4. Configure environment variables in Cloudflare
5. Set up analytics and monitoring

---

**Built with ❤️ for local businesses and communities**

*Empowering local entrepreneurs to reach global markets through modern e-commerce solutions.*