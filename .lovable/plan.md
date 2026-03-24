

## แผนงาน: Parallax Effects + Checkout/Tracking UI Upgrade + Mobile QA

---

### 1. Scroll-Triggered Parallax — Hero & Product Sections

**HeroSection.tsx:**
- ใช้ `useScroll` + `useTransform` จาก Framer Motion สร้าง parallax layers:
  - Background image เลื่อนช้ากว่า scroll (translateY 0→-15%)
  - Gold ambient glow ขยับตาม scroll
  - Content text เลื่อนเร็วขึ้นเล็กน้อย (0→-5%) สร้างมิติ
  - Banner overlay เลื่อนทิศตรงข้าม
- เพิ่ม `ref` ให้ section สำหรับ `useScroll({ target })`

**ProductSection.tsx:**
- Background glow เคลื่อนไหวตาม scroll position
- Gallery slide-in จากซ้าย, product info จากขวา ด้วย `whileInView` ที่มีอยู่แล้ว (เสริม parallax offset เล็กน้อย)

---

### 2. Checkout Pages — Visual Depth & Micro-interactions

**CheckoutShippingForm.tsx:**
- เพิ่ม glassmorphism card wrapper (`glass` class + `bg-gradient-card`)
- Staggered animation ให้แต่ละ field เลื่อนเข้ามาทีละตัว
- Input focus states: border glow สีทอง, subtle scale
- Progress bar animated ระหว่าง step 1↔2

**CheckoutPaymentForm.tsx:**
- Payment method cards: hover-lift effect, gold border glow เมื่อเลือก
- Animated checkmark เมื่อเลือก payment method
- Coupon input: success animation (shimmer) เมื่อใช้สำเร็จ

**CheckoutSummary.tsx:**
- เพิ่ม noise overlay + radial gold glow เหมือน main sections
- Animated total counter (count-up effect)
- Separator ใช้ `gold-divider` class

**Checkout.tsx (parent):**
- เพิ่ม background layer: noise texture + subtle radial glow
- Step indicator: animated connecting line, pulse บน active step
- Page transition: AnimatePresence สำหรับสลับ step

**OrderSuccess.tsx:**
- เพิ่ม confetti-like particle animation หลังจาก success
- Background: noise + radial gold ambient
- Card: glass effect + stronger shadow

**OrderTracking.tsx:**
- เพิ่ม background layers (noise + gradient) เหมือนหน้าหลัก
- Search card: glass morphism
- Status timeline: animated progress bar เชื่อมระหว่าง steps, gold glow บน active step
- Result card: staggered entry animation

---

### 3. Mobile Responsive QA

ใช้ browser tools ทดสอบที่ viewport 390x844:
- หน้าแรก (Hero parallax, Product, Review, FAQ, Contact, Footer)
- Checkout flow ทั้ง shipping form และ payment
- Order Success page
- Order Tracking page
- Privacy / Terms pages

รายงานปัญหาที่พบและแก้ไข

---

### ไฟล์ที่แก้ไข

| ไฟล์ | การเปลี่ยนแปลง |
|------|---------------|
| `src/components/HeroSection.tsx` | Parallax layers ด้วย useScroll/useTransform |
| `src/components/ProductSection.tsx` | Subtle parallax on ambient glow |
| `src/components/checkout/CheckoutShippingForm.tsx` | Glass card, staggered fields, focus glow |
| `src/components/checkout/CheckoutPaymentForm.tsx` | Hover-lift cards, selection animation |
| `src/components/checkout/CheckoutSummary.tsx` | Noise overlay, gold divider, glass |
| `src/pages/Checkout.tsx` | Background layers, animated step indicator |
| `src/pages/OrderSuccess.tsx` | Background depth, enhanced animations |
| `src/pages/OrderTracking.tsx` | Glass cards, animated timeline, background layers |

