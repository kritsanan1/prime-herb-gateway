

## แผนงาน: ระบบจัดการคอนเทนต์โซเชียลมีเดีย End-to-End Workflows

เพิ่มเครื่องมือจัดการ workflow แบบครบวงจร ตั้งแต่สร้าง → รีวิว → อนุมัติ → เผยแพร่ พร้อม Kanban board, ปฏิทินรายเดือน, อัปโหลดรูป และ template

---

### 1. Kanban Workflow Board

สร้าง view แบบ Kanban แสดงโพสต์แยกตามสถานะ (draft → pending → approved → published) ลาก-วาง (drag) เปลี่ยนสถานะได้

- คอลัมน์: แบบร่าง | รออนุมัติ | อนุมัติแล้ว | โพสต์แล้ว | ถูกปฏิเสธ
- แต่ละการ์ดแสดง: emoji แพลตฟอร์ม, caption ย่อ, วันเวลา, ผู้เขียน
- คลิกการ์ดเพื่อแก้ไข, เปลี่ยนสถานะด้วยปุ่มหรือ dropdown

### 2. Calendar View (ปฏิทินรายเดือน)

แสดงโพสต์ที่กำหนดเวลาไว้ในรูปแบบปฏิทินรายเดือน

- Grid 7 คอลัมน์ (อา-ส) แสดงวันในเดือน
- แต่ละวันแสดงโพสต์เป็น badge เล็กๆ พร้อม emoji แพลตฟอร์ม
- คลิกวันเพื่อสร้างโพสต์ใหม่ในวันนั้น
- ปุ่มเลื่อนเดือน ← →

### 3. อัปโหลดรูปภาพสำหรับโพสต์

ใช้ Storage bucket เดียวกับบทความ (article-images) หรือสร้าง bucket ใหม่ `social-images`

- เพิ่ม image upload ในฟอร์มสร้าง/แก้ไขโพสต์
- แสดง preview รูปในการ์ด
- รองรับ drag & drop

### 4. Content Templates

ระบบ template สำเร็จรูปสำหรับโพสต์ประเภทต่างๆ

- Template ฝัง client-side: โปรโมชั่น, รีวิวลูกค้า, แนะนำสินค้า, เคล็ดลับสุขภาพ
- เลือก template แล้วกรอกข้อมูลลงช่องว่าง
- Auto-fill hashtags ตามประเภท

### 5. Tab Switcher ใน Content Calendar

เพิ่มปุ่มสลับ view: **List** | **Kanban** | **Calendar**

- ใช้ข้อมูลจาก content_calendar table เดิม
- ไม่ต้องเปลี่ยน schema

---

### ไฟล์ที่จะสร้าง/แก้ไข

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| DB Migration | สร้าง storage bucket `social-images` |
| `src/components/admin/ContentCalendar.tsx` | เพิ่ม tab switcher (List/Kanban/Calendar), image upload |
| `src/components/admin/ContentKanban.tsx` | **ใหม่** — Kanban board แบ่งตามสถานะ |
| `src/components/admin/ContentMonthCalendar.tsx` | **ใหม่** — ปฏิทินรายเดือน |
| `src/components/admin/ContentTemplates.tsx` | **ใหม่** — Template picker สำหรับโพสต์ |
| `src/components/admin/SocialImageUpload.tsx` | **ใหม่** — Component อัปโหลดรูปโซเชียล |

