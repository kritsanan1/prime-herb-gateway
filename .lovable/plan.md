

## แผนงาน: ระบบจัดการบทความ Admin + ทดสอบ LINE & Articles

---

### 1. สร้างตาราง `articles` ในฐานข้อมูล

**Migration SQL:**
- สร้างตาราง `articles` พร้อมคอลัมน์: `id`, `slug` (unique), `title`, `excerpt`, `content`, `image`, `category`, `read_time`, `published_at`, `youtube_url`, `is_published`, `created_at`, `updated_at`
- RLS: Admin สามารถ CRUD ทั้งหมด, Public สามารถ SELECT เฉพาะ `is_published = true`
- Seed ข้อมูล 10 บทความเดิมจาก `src/data/articles.ts` เข้าตาราง
- เปิด realtime สำหรับตาราง articles

### 2. สร้าง ArticleManager component ใน Admin

**ไฟล์ใหม่:** `src/components/admin/ArticleManager.tsx`
- แสดงรายการบทความทั้งหมดจาก DB (title, category, published status, date)
- ปุ่ม "เพิ่มบทความ" เปิด dialog/form สำหรับสร้างบทความใหม่
- ปุ่ม "แก้ไข" เปิด form พร้อมข้อมูลเดิม
- ปุ่ม "ลบ" พร้อม confirm dialog
- Form fields: title, slug (auto-generate จาก title), excerpt, content (textarea), image URL, category, read_time, youtube_url, is_published toggle
- ใช้ Supabase client query ตรง

### 3. อัปเดต Admin page เพิ่ม tab "บทความ"

**ไฟล์:** `src/pages/Admin.tsx`
- เพิ่ม tab `articles` ใน TABS array พร้อม icon `FileText`
- เพิ่ม type `'articles'` ใน Tab union
- Render `<ArticleManager />` เมื่อ tab === 'articles'

### 4. อัปเดต Articles pages ให้ดึงจาก DB

**ไฟล์:** `src/pages/Articles.tsx` + `src/pages/ArticleDetail.tsx` + `src/components/ArticlesPreview.tsx`
- เปลี่ยนจากใช้ static `ARTICLES` array เป็น fetch จาก Supabase `articles` table
- Fallback ใช้ static data ถ้า DB ว่าง
- Filter เฉพาะ `is_published = true` สำหรับ public pages

### 5. ทดสอบ LINE Flex Message + หน้า Articles

- ใช้ browser tool ทดสอบ:
  - เปิดหน้า `/articles` ตรวจรูปภาพและลิงก์ (desktop + mobile)
  - เปิดหน้า `/articles/:slug` ตรวจเนื้อหาและ YouTube link
  - ทดสอบส่ง LINE Flex Message ผ่าน edge function (progress_update + social_approval)

---

### ไฟล์ที่จะแก้ไข/สร้าง

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| DB Migration | สร้างตาราง `articles` + RLS + seed data |
| `src/components/admin/ArticleManager.tsx` | **ใหม่** — CRUD UI สำหรับบทความ |
| `src/pages/Admin.tsx` | เพิ่ม tab "บทความ" |
| `src/pages/Articles.tsx` | ดึงข้อมูลจาก DB แทน static |
| `src/pages/ArticleDetail.tsx` | ดึงข้อมูลจาก DB แทน static |
| `src/components/ArticlesPreview.tsx` | ดึงข้อมูลจาก DB แทน static |

