

## Plan: อัปเกรดระบบ Dr.Arty Prime Herb

คำขอของคุณมี 4 ส่วนหลัก ขอนำเสนอแผนทั้งหมดดังนี้:

---

### ส่วนที่ 1: เปิดใช้ Lovable Cloud + สร้างฐานข้อมูลจริง

เปิดใช้ Lovable Cloud เพื่อสร้างระบบ Supabase backend ให้กับโปรเจกต์

**Database Schema:**
- **products** - id, name, description, short_desc, price, original_price, image_url, stock, features (jsonb), category
- **orders** - id, order_number, items (jsonb), customer_name, customer_phone, customer_email, customer_address, province, postal_code, note, coupon_code, subtotal, shipping, discount, total, status, payment_method, payment_status, tracking_number, created_at, updated_at
- **profiles** - id (FK auth.users), display_name, avatar_url, created_at
- **user_roles** - id, user_id (FK auth.users), role (enum: admin, user), unique(user_id, role)

**RLS Policies:**
- products: ทุกคนอ่านได้, admin เท่านั้นที่แก้ไขได้
- orders: admin อ่านและแก้ไขได้ทั้งหมด, ลูกค้าค้นหาผ่าน order_number + contact
- profiles/user_roles: ใช้ `has_role()` security definer function ป้องกัน infinite recursion

**Code Changes:**
- สร้าง `src/integrations/supabase/` client config
- แก้ไข `OrderContext` ให้ insert/query จาก Supabase แทน localStorage
- แก้ไข `ProductSection` ให้ดึงข้อมูลจาก products table
- Seed ข้อมูลสินค้าเริ่มต้นผ่าน migration

---

### ส่วนที่ 2: ระบบ Authentication จริงสำหรับ Admin

**สิ่งที่จะสร้าง:**
- หน้า `/admin/login` ที่ใช้ Supabase Auth (email + password)
- Trigger สร้าง profile อัตโนมัติเมื่อสมัครสมาชิก
- `has_role()` function สำหรับตรวจสอบสิทธิ์ admin
- Protected route: ตรวจสอบ session + role ก่อนเข้าหน้า admin
- ปุ่ม Logout ใน admin dashboard
- ลบระบบ mock password เดิมออกทั้งหมด

**การตั้งค่า Admin คนแรก:**
- หลัง deploy จะต้องสมัครบัญชีผ่านหน้า login แล้ว insert role `admin` ผ่าน Supabase Dashboard หรือ seed migration

---

### ส่วนที่ 3: ใส่ภาพสินค้าจริง

จากภาพ 6 รูปที่ให้มา จะนำไปใช้ดังนี้:

| ภาพ | การใช้งาน |
|-----|----------|
| ภาพ dark/smoke background (d8012hm2c) | Hero section background |
| ภาพ gold swirls + tagline (gyjlp8z05) | Hero section banner overlay |
| ภาพ white background (gjiy49hsz) | Product section - รูปสินค้าหลัก |
| ภาพ product + box (rne32mtfi) | Product detail / gallery |
| ภาพ lifestyle desk (nklvudbri) | Product section secondary image |
| ภาพ luxury bathroom (vae2ipthm) | About/brand section หรือ gallery |

**วิธีการ:**
- ดาวน์โหลดภาพจาก postimg.cc URLs ที่ให้มา
- เก็บเป็น static assets ใน `public/images/` 
- อัปเดต `HeroSection`, `ProductSection` และ `data/index.ts` ให้ชี้ไปที่ภาพจริง
- เพิ่ม product image gallery ใน ProductSection

---

### ส่วนที่ 4: ทดสอบ Flow การสั่งซื้อ

หลังจากทำส่วนที่ 1-3 เสร็จ จะทดสอบ flow ครบวงจร:
1. เพิ่มสินค้าลงตะกร้า
2. ไปหน้า checkout กรอกข้อมูล
3. ชำระเงิน (mock)
4. เห็นหน้า order success
5. ติดตามออเดอร์ผ่านหน้า tracking

---

### ลำดับการทำงาน

เนื่องจากงานมีขอบเขตกว้าง จะแบ่งเป็น 2 รอบ:

**รอบที่ 1 (ครั้งนี้):** ใส่ภาพจริง + เปิด Lovable Cloud + สร้าง database schema + authentication + protected admin route

**รอบที่ 2:** ย้าย orders/cart logic ไปใช้ Supabase จริง + ทดสอบ end-to-end

