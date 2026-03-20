import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card py-12">
      <div className="container">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-display font-bold text-lg text-gradient-gold mb-3">Dr.Arty Prime Herb</h3>
            <p className="text-xs text-muted-foreground font-thai leading-relaxed">
              ผลิตภัณฑ์เสริมอาหารพรีเมียมสำหรับผู้ชายยุคใหม่ ที่ใส่ใจในการดูแลตัวเองอย่างมีระดับ
            </p>
          </div>
          <div>
            <h4 className="font-thai font-semibold text-sm text-foreground mb-3">ลิงก์สำคัญ</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-xs text-muted-foreground hover:text-primary font-thai transition-colors">นโยบายความเป็นส่วนตัว</Link></li>
              <li><Link to="/terms" className="text-xs text-muted-foreground hover:text-primary font-thai transition-colors">เงื่อนไขการสั่งซื้อ</Link></li>
              <li><Link to="/tracking" className="text-xs text-muted-foreground hover:text-primary font-thai transition-colors">ติดตามคำสั่งซื้อ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-thai font-semibold text-sm text-foreground mb-3">ช่องทางติดต่อ</h4>
            <ul className="space-y-2 text-xs text-muted-foreground font-thai">
              <li>LINE: @drarty</li>
              <li>Email: support@drarty.com</li>
              <li>โทร: 02-XXX-XXXX</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 space-y-2">
          <p className="text-center text-[10px] text-muted-foreground/60 font-thai">
            ⚠️ เว็บไซต์นี้สำหรับผู้ที่มีอายุ 18 ปีขึ้นไปเท่านั้น
          </p>
          <p className="text-center text-[10px] text-muted-foreground/40 font-thai">
            เนื้อหาบนเว็บไซต์นี้เป็นข้อมูลผลิตภัณฑ์ทั่วไป ไม่ใช่คำแนะนำทางการแพทย์ ผลลัพธ์อาจแตกต่างกันในแต่ละบุคคล
          </p>
          <p className="text-center text-[10px] text-muted-foreground/40 font-thai">
            © {new Date().getFullYear()} Dr.Arty Prime Herb. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
