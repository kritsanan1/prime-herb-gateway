

## แผนงาน: ทดสอบระบบบทความ + LINE Flex Message

ระบบจัดการบทความผ่าน Admin, ตาราง articles ในฐานข้อมูล, และ LINE Flex Message แบบ progress_update/social_approval ถูกสร้างไว้แล้วทั้งหมด — งานที่เหลือคือ **การทดสอบ** เท่านั้น

---

### 1. ทดสอบหน้า Articles (Desktop + Mobile)

- เปิด `/articles` ตรวจสอบว่าบทความแสดงจาก DB (มี loading skeleton แล้ว fallback static data)
- เปิด `/articles/:slug` ตรวจเนื้อหา, รูปภาพ, YouTube embed
- ทดสอบ responsive ที่ 390px (mobile) และ 1280px (desktop)
- ตรวจสอบว่าลิงก์ YouTube channel ทำงานถูกต้อง

### 2. ทดสอบ Admin Article Manager

- เข้า `/admin` → login → tab "บทความ"
- ตรวจสอบว่าบทความ 10 รายการแสดงจาก DB
- ทดสอบ CRUD: สร้างบทความใหม่, แก้ไข, toggle is_published, ลบ

### 3. ทดสอบ LINE Flex Message

- ส่ง request ไปที่ edge function `line-notify` ด้วย type `progress_update` และ `social_approval`
- ตรวจสอบว่า Flex Message ส่งถึง LINE สำเร็จ (HTTP 200)

---

### ไม่มีไฟล์ที่ต้องแก้ไข — เป็นงานทดสอบล้วน

ทุกอย่างถูก implement ไว้แล้ว จะทำการทดสอบผ่าน browser tool และ edge function testing tool ทันที

