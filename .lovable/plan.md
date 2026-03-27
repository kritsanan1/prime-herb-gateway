

## แผนงาน: Push Notification + Price Update + Brand Copy + Site Name

---

### สรุปงานทั้งหมด

1. **อัปเดตราคาสินค้า** — เปลี่ยนราคาเต็มเป็น 349 บาท ลดเหลือ 249 บาท
2. **แก้ไขข้อความผู้ก่อตั้ง** — ลบการอ้างอิง "จุดซ่อนเร้น" ออก ใช้ข้อความที่เน้น "การดูแลตัวเองอย่างมีระดับ" แทน
3. **เปลี่ยนชื่อเว็บไซต์** — เป็น "Dr. Arty Prime Herb Intimate Care" ทุกที่ (title, meta, header, footer, schema)
4. **ระบบ Push Notification** — แจ้งเตือนลูกค้าบนเว็บเมื่อสถานะออเดอร์เปลี่ยน

---

### 1. อัปเดตราคาสินค้าในฐานข้อมูล

- ใช้ insert tool เพื่อ UPDATE ตาราง `products` — ตั้ง `price = 249`, `original_price = 349`
- อัปเดต `src/data/index.ts` ให้ตรงกัน (fallback data)

### 2. แก้ไขข้อความผู้ก่อตั้งใน Brand Story

**ไฟล์:** `src/pages/BrandStory.tsx`
- เปลี่ยน blockquote จาก "แบรนด์ดูแลจุดซ่อนเร้นชาย..." เป็นข้อความใหม่:
  > "Dr.Arty คือแบรนด์ดูแลตัวเองระดับพรีเมียมสำหรับผู้ชายยุคใหม่ ที่ผสานสมุนไพรธรรมชาติ 100% เข้ากับมาตรฐาน medical-grade เพื่อมอบประสบการณ์ความมั่นใจอย่างมีระดับ"
- อัปเดต Timeline item แรก ลบ "ไม่ใช่สินค้าที่ต้องซ่อน" → เปลี่ยนเป็นข้อความเกี่ยวกับการดูแลตัวเองอย่างพรีเมียม

### 3. เปลี่ยนชื่อเว็บไซต์

**ไฟล์ที่แก้ไข:**
- `index.html` — title, og:title, twitter:title, schema.org name
- `src/components/Header.tsx` — แสดง "Dr. Arty" + "Prime Herb Intimate Care"
- `src/components/Footer.tsx` — ชื่อแบรนด์

### 4. ระบบ Push Notification สำหรับลูกค้า

ใช้ **Browser Notifications API** (ไม่ต้องใช้ service worker ที่ซับซ้อน) ร่วมกับ Supabase Realtime:

**ไฟล์ใหม่:** `src/hooks/useOrderNotification.ts`
- รับ `orderNumber` เป็น parameter
- Subscribe ไปที่ `orders` table ผ่าน Supabase Realtime โดยฟิลเตอร์ `order_number`
- เมื่อตรวจพบ UPDATE event → ขอ permission และส่ง browser notification
- แสดง toast notification ในเว็บด้วย

**ไฟล์ที่แก้ไข:**
- `src/pages/OrderTracking.tsx` — เรียกใช้ `useOrderNotification` เมื่อลูกค้าเข้ามาติดตามออเดอร์
- `src/pages/OrderSuccess.tsx` — เรียกใช้หลังสั่งซื้อสำเร็จ ถามขอ permission notification

**Flow:**
1. ลูกค้าสั่งซื้อสำเร็จ → หน้า OrderSuccess ขอ permission notification
2. ลูกค้าเปิดหน้า OrderTracking → subscribe realtime updates
3. Admin เปลี่ยนสถานะ → ลูกค้าได้รับ browser notification + toast ทันที

---

### ไฟล์ที่จะแก้ไข/สร้าง

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| DB: `products` table | UPDATE price=249, original_price=349 |
| `src/data/index.ts` | อัปเดตราคา fallback |
| `src/pages/BrandStory.tsx` | แก้ข้อความผู้ก่อตั้ง + timeline |
| `index.html` | เปลี่ยน title/meta เป็นชื่อเต็ม |
| `src/components/Header.tsx` | อัปเดตชื่อแบรนด์ |
| `src/components/Footer.tsx` | อัปเดตชื่อแบรนด์ |
| `src/hooks/useOrderNotification.ts` | **ใหม่** — hook สำหรับ realtime notification |
| `src/pages/OrderTracking.tsx` | เพิ่ม notification hook |
| `src/pages/OrderSuccess.tsx` | เพิ่ม notification permission request |

