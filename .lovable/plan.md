

## แผนงาน: อีเมลแจ้งเตือน + Stripe Payment + ภาพสินค้า + ทดสอบมือถือ

---

### 1. ภาพสินค้า — รอการอัปโหลด

ลิงก์ genspark.ai ทั้ง 50 ลิงก์ไม่สามารถเข้าถึงได้ (Access Denied) กรุณาอัปโหลดภาพโดยตรงผ่านแชท (กดปุ่ม + แล้วเลือก Attach) ได้สูงสุด 10 ภาพต่อข้อความ ส่งได้หลายข้อความจนครบ

หลังได้รับภาพ จะนำไปใช้ใน:
- Hero section background/banner
- Product gallery (4 ภาพ)
- Review/brand sections
- เก็บใน `public/images/` เป็น static assets

---

### 2. เชื่อมต่อ Stripe Payment Gateway

Lovable มี Stripe integration พร้อมใช้ รองรับบัตรเครดิต/เดบิต และ PromptPay ในไทย

**ขั้นตอน:**
1. เปิดใช้งาน Stripe ผ่าน `stripe--enable_stripe` (ระบบจะขอ Secret Key จากคุณ)
2. สร้าง Edge Function `create-checkout` สำหรับสร้าง Stripe Checkout Session
3. สร้าง Edge Function `stripe-webhook` สำหรับรับ payment confirmation จาก Stripe
4. อัปเดต `Checkout.tsx` ให้ redirect ไป Stripe Checkout แทน mock payment
5. อัปเดต `OrderContext` ให้เปลี่ยนสถานะอัตโนมัติเมื่อ webhook ยืนยัน

**ไฟล์ที่สร้าง/แก้ไข:**
- `supabase/functions/create-checkout/index.ts` — สร้าง Stripe session
- `supabase/functions/stripe-webhook/index.ts` — รับ webhook events
- `src/pages/Checkout.tsx` — เปลี่ยนจาก mock เป็น Stripe
- `src/contexts/OrderContext.tsx` — ลบ `simulatePayment`, เพิ่ม Stripe flow

---

### 3. ระบบแจ้งเตือนทางอีเมล

สร้างระบบส่งอีเมลแจ้งเตือนเมื่อมีออเดอร์ใหม่หรือสถานะเปลี่ยน

**ขั้นตอน:**
1. ตั้งค่า email domain ผ่าน email setup dialog
2. ตั้งค่า email infrastructure (tables, queues, Edge Function)
3. Scaffold transactional email templates:
   - **ออเดอร์ใหม่** — ส่งให้ admin เมื่อมีคำสั่งซื้อเข้า
   - **ยืนยันคำสั่งซื้อ** — ส่งให้ลูกค้าหลังชำระเงินสำเร็จ
   - **อัปเดตสถานะ** — ส่งให้ลูกค้าเมื่อสถานะเปลี่ยน (จัดส่ง/จัดส่งสำเร็จ)
4. เรียกใช้จาก `stripe-webhook` และ `updateOrderStatus`

**ไฟล์ที่สร้าง:**
- `supabase/functions/send-order-email/index.ts`
- Email templates (React Email)

---

### 4. ทดสอบ Responsive บนมือถือ

ใช้ browser tools ทดสอบทุกหน้าที่ viewport 390x844 (iPhone):
- หน้าแรก (Hero, Product, Review, FAQ, Contact, Footer)
- Checkout flow
- Order Success / Tracking
- Privacy / Terms
- Admin Dashboard

---

### ลำดับการทำงาน

1. **Stripe** — enable + สร้าง Edge Functions + แก้ checkout flow
2. **Email** — ตั้งค่า domain + infrastructure + templates
3. **ภาพ** — รอรับภาพจากคุณ แล้วนำไปใส่
4. **ทดสอบมือถือ** — ทดสอบ responsive ทุกหน้า

