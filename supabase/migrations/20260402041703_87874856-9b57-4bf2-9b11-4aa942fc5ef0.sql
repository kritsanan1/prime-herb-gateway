
-- Create articles table
CREATE TABLE public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  image text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'ทั่วไป',
  read_time integer NOT NULL DEFAULT 3,
  published_at timestamp with time zone DEFAULT now(),
  youtube_url text,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Public can read published articles
CREATE POLICY "Anyone can view published articles"
  ON public.articles FOR SELECT
  TO public
  USING (is_published = true);

-- Admin full access
CREATE POLICY "Admins can manage articles"
  ON public.articles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.articles;

-- Trigger for updated_at
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed data
INSERT INTO public.articles (slug, title, excerpt, content, image, category, read_time, published_at, youtube_url, is_published) VALUES
('mai-tong-payayam', 'ไม่ต้องพยายาม — เมื่อความมั่นใจมาจากข้างใน', 'ความมั่นใจที่แท้จริงไม่ได้มาจากการแสดงออก แต่มาจากการดูแลตัวเองอย่างถูกวิธี', 'ผู้ชายหลายคนพยายามสร้างความมั่นใจด้วยสิ่งภายนอก ไม่ว่าจะเป็นเสื้อผ้าแบรนด์เนม นาฬิกาหรู หรือรถยนต์ราคาแพง แต่ความจริงแล้ว ความมั่นใจที่ยั่งยืนนั้นเริ่มต้นจากการดูแลตัวเอง

เมื่อคุณใส่ใจในทุกรายละเอียดของร่างกาย ตั้งแต่ผิวพรรณ สุขภาพ ไปจนถึงการดูแลส่วนตัว คุณจะรู้สึกถึงความแตกต่างอย่างชัดเจน

Dr.Arty Prime Herb ถูกออกแบบมาเพื่อผู้ชายที่เข้าใจว่า "ความมั่นใจที่แท้จริง ไม่ต้องพยายาม"', '/images/articles/article-01.jpg', 'ความมั่นใจ', 3, '2025-03-28', NULL, true),
('ya-tham-baeb-nee', 'อย่าทำแบบนี้ — 5 ข้อผิดพลาดที่ผู้ชายมักทำในการดูแลตัวเอง', 'หลายคนทำผิดพลาดซ้ำๆ โดยไม่รู้ตัว บทความนี้จะเปิดเผย 5 ข้อผิดพลาดที่พบบ่อยที่สุด', 'ข้อผิดพลาดที่ 1: ละเลยการดูแลสุขอนามัยส่วนตัว

ข้อผิดพลาดที่ 2: ใช้ผลิตภัณฑ์ที่ไม่เหมาะสม

ข้อผิดพลาดที่ 3: ไม่สม่ำเสมอ

ข้อผิดพลาดที่ 4: เลือกสินค้าโดยดูแค่ราคา

ข้อผิดพลาดที่ 5: ไม่กล้าลงทุนกับตัวเอง', '/images/articles/article-02.jpg', 'เคล็ดลับ', 4, '2025-03-25', NULL, true),
('plian-thun-thee', 'เปลี่ยนทันที — ทำไมการเริ่มต้นวันนี้ถึงสำคัญ', 'การรอคอยจังหวะที่เหมาะสมคือกับดักที่ทำให้คุณไม่ได้เริ่มต้นสักที', 'ผู้ชายส่วนใหญ่มักบอกตัวเองว่า "ไว้ค่อยทำ" แต่ความจริงคือ ไม่มีเวลาไหนที่เหมาะสมกว่า "ตอนนี้"

การดูแลตัวเองไม่ใช่เรื่องใหญ่โต มันเริ่มต้นจากสิ่งเล็กๆ ง่ายๆ', '/images/articles/article-03.jpg', 'แรงบันดาลใจ', 3, '2025-03-22', NULL, true),
('na-chuea-o-thun-thee', 'น่าเชื่อถืออทันที — สร้างภาพลักษณ์ที่น่าจดจำ', 'ค้นพบเคล็ดลับการสร้างความน่าเชื่อถือตั้งแต่วินาทีแรกที่พบกัน', 'ความน่าเชื่อถือเป็นสิ่งที่สร้างได้ แต่ต้องเริ่มจากรากฐานที่ถูกต้อง

การดูแลตัวเองอย่างครบวงจร สิ่งเหล่านี้รวมกันสร้างเป็นภาพลักษณ์ที่ทรงพลัง', '/images/articles/article-04.jpg', 'ไลฟ์สไตล์', 4, '2025-03-20', NULL, true),
('khao-doo-yoo', 'เขาดูอยู่ — เมื่อรายละเอียดเล็กๆ สร้างความแตกต่าง', 'คนรอบข้างสังเกตมากกว่าที่คุณคิด', 'คุณอาจไม่รู้ แต่คนรอบข้างสังเกตรายละเอียดเล็กๆ ของคุณมากกว่าที่คิด

ในโลกธุรกิจ First Impression มีค่ามหาศาล', '/images/articles/article-05.jpg', 'ความมั่นใจ', 3, '2025-03-18', NULL, true),
('mai-mee-khrai-phoot', 'ไม่มีใครพูด — เรื่องที่ผู้ชายไม่กล้าถามใคร', 'มีหลายเรื่องที่ผู้ชายอยากรู้แต่ไม่กล้าถาม', 'มีหลายเรื่องที่ผู้ชายรู้สึกอาย ไม่กล้าถามเพื่อน

Dr.Arty Talk เกิดมาเพื่อตอบคำถามเหล่านี้', '/images/articles/article-06.jpg', 'สุขภาพ', 5, '2025-03-15', 'https://www.youtube.com/@ArtyTalk-s6w', true),
('mai-hai-na-ta', 'ไม่ให้หน้าตา — ก้าวข้ามอุปสรรคด้วยความมั่นใจ', 'บางครั้งคนอื่นอาจไม่ให้โอกาส แต่ความมั่นใจที่แท้จริงจะพาคุณผ่านทุกอุปสรรค', 'ในชีวิตจริง ไม่ใช่ทุกคนจะให้โอกาสคุณตั้งแต่แรกพบ

ความมั่นใจไม่ได้หมายถึงความหยิ่ง แต่หมายถึงการรู้คุณค่าของตัวเอง', '/images/articles/article-07.jpg', 'แรงบันดาลใจ', 4, '2025-03-12', NULL, true),
('phu-chai-mee-class', 'ผู้ชายมีคลาส — Dr.Arty Talk สร้างคอนเทนต์เพื่อผู้ชายยุคใหม่', 'รู้จักกับ Dr.Arty Talk ช่องทางให้ความรู้สำหรับผู้ชายที่ต้องการพัฒนาตัวเอง', 'Dr.Arty Talk ไม่ได้เป็นแค่ช่องขายสินค้า แต่เป็นแพลตฟอร์มให้ความรู้

เราเชื่อว่า "ผู้ชายมีคลาส" ไม่ได้วัดจากเงินในกระเป๋า', '/images/articles/article-08.jpg', 'ไลฟ์สไตล์', 3, '2025-03-10', 'https://www.youtube.com/@ArtyTalk-s6w', true),
('mun-jai-jing', 'มั่นใจจริง? — ทดสอบความมั่นใจของคุณ', 'คุณมั่นใจจริงหรือแค่แสร้งทำ?', 'มีเส้นบางๆ ระหว่าง "ความมั่นใจ" กับ "การแสร้งมั่นใจ"

ความมั่นใจที่แท้จริงมาจากการดูแลตัวเองในทุกมิติ', '/images/articles/article-09.jpg', 'ความมั่นใจ', 4, '2025-03-08', NULL, true),
('plad-doi-mai-roo-tua', 'พลาดโดยไม่รู้ตัว — สิ่งที่ทำลายความมั่นใจของคุณทุกวัน', 'มีหลายสิ่งในชีวิตประจำวันที่กัดกร่อนความมั่นใจของคุณโดยไม่รู้ตัว', 'ทุกวัน มีสิ่งเล็กๆ น้อยๆ ที่กัดกร่อนความมั่นใจของคุณ

เริ่มต้นง่ายๆ ด้วยการดูแลตัวเองให้ดีขึ้นทุกวัน', '/images/articles/article-10.jpg', 'เคล็ดลับ', 5, '2025-03-05', NULL, true);
