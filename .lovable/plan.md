

## แผนงาน: Swipe/Pinch Gallery + Hero/Review Backgrounds + Visual QA

---

### 1. Product Gallery — Swipe Gesture + Pinch-to-Zoom

**ไฟล์:** `src/components/ProductGallery.tsx`

**Swipe Gesture (Main Image):**
- ใช้ `useDrag` จาก Framer Motion (`drag="x"` + `onDragEnd`) บน main image container
- ตรวจจับ swipe direction จาก `velocity.x` หรือ `offset.x` threshold (>50px)
- Swipe ซ้าย → ภาพถัดไป, Swipe ขวา → ภาพก่อนหน้า
- เพิ่ม `dragConstraints={{ left: 0, right: 0 }}` เพื่อให้ snap กลับ
- ซ่อนปุ่ม chevron บนมือถือ แสดง swipe indicator dot แทน

**Pinch-to-Zoom (Lightbox):**
- Track touch events ด้วย `onTouchStart`, `onTouchMove`, `onTouchEnd` สำหรับ 2-finger pinch
- คำนวณ distance ระหว่าง 2 touches → แปลงเป็น scale factor (1x–3x)
- ใช้ `transform: scale()` + `transform-origin` ตาม pinch center
- Double-tap toggle zoom (1x ↔ 2x)
- เมื่อ zoomed in → สามารถ pan ด้วย 1 finger
- Reset zoom เมื่อเปลี่ยนภาพ

**ไม่ต้องติดตั้ง library เพิ่ม** — ใช้ Framer Motion drag + native touch events

---

### 2. Hero Background + Review Section Background

**ไฟล์:** `src/components/HeroSection.tsx`
- เปลี่ยน `hero-bg.png` เป็นรูปจาก gallery ที่มีอยู่แล้ว เช่น `product-lifestyle.png` หรือ `product-desk.png` ที่เหมาะกับ Hero
- เพิ่ม subtle product image floating layer (เช่น `product-white.png`) เป็น parallax layer เพิ่มเติม

**ไฟล์:** `src/components/ReviewSection.tsx`
- เพิ่ม background image layer ด้วย `brand-confidence.jpg` หรือ `lifestyle-man.jpg`
- ใช้ `opacity-[0.05]` + blur + gradient overlay เพื่อสร้าง subtle depth โดยไม่รบกวนการอ่าน
- เพิ่ม parallax effect ด้วย `useScroll` + `useTransform` เหมือน sections อื่น

---

### 3. Visual QA — ทดสอบบนมือถือและเดสก์ท็อป

- ใช้ browser tool ตรวจสอบ:
  - หน้าหลัก (Hero, Product Gallery, Content Pillars, Reviews)
  - หน้า Brand Story
  - ทดสอบทั้ง desktop (1280px) และ mobile (390px)
  - ตรวจสอบว่ารูปภาพ load ถูกต้องและไม่ broken

---

### ไฟล์ที่จะแก้ไข

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `src/components/ProductGallery.tsx` | Swipe gesture + pinch-to-zoom |
| `src/components/HeroSection.tsx` | เพิ่ม product image parallax layer |
| `src/components/ReviewSection.tsx` | เพิ่ม background image + parallax |

