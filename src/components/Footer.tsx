import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="relative border-t border-border/40 bg-card py-14">
      <div className="absolute inset-0 noise-overlay pointer-events-none" />

      <div className="container relative z-10">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          <div>
            <h3 className="font-display font-bold text-xl text-gradient-gold mb-4 tracking-wide">Dr.Arty Prime Herb</h3>
            <p className="text-xs text-muted-foreground/60 font-thai leading-relaxed">
              ผลิตภัณฑ์เสริมอาหารพรีเมียมสำหรับผู้ชายยุคใหม่ ที่ใส่ใจในการดูแลตัวเองอย่างมีระดับ
            </p>
          </div>
          <div>
            <h4 className="font-thai font-semibold text-sm text-foreground mb-4 tracking-wide">ลิงก์สำคัญ</h4>
            <ul className="space-y-3">
              {[
                { to: '/privacy', label: 'นโยบายความเป็นส่วนตัว' },
                { to: '/terms', label: 'เงื่อนไขการสั่งซื้อ' },
                { to: '/tracking', label: 'ติดตามคำสั่งซื้อ' },
              ].map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-xs text-muted-foreground/60 hover:text-primary font-thai transition-colors duration-300 relative group inline-block"
                  >
                    {link.label}
                    <span className="absolute bottom-0 left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-thai font-semibold text-sm text-foreground mb-4 tracking-wide">ช่องทางติดต่อ</h4>
            <ul className="space-y-3 text-xs text-muted-foreground/60 font-thai">
              <li>LINE: @drarty</li>
              <li>Email: support@drarty.com</li>
              <li>โทร: 02-XXX-XXXX</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/30 pt-8 space-y-2">
          <p className="text-center text-[10px] text-muted-foreground/50 font-thai">
            ⚠️ เว็บไซต์นี้สำหรับผู้ที่มีอายุ 18 ปีขึ้นไปเท่านั้น
          </p>
          <p className="text-center text-[10px] text-muted-foreground/30 font-thai">
            เนื้อหาบนเว็บไซต์นี้เป็นข้อมูลผลิตภัณฑ์ทั่วไป ไม่ใช่คำแนะนำทางการแพทย์ ผลลัพธ์อาจแตกต่างกันในแต่ละบุคคล
          </p>
          <p className="text-center text-[10px] text-muted-foreground/30 font-thai">
            © {new Date().getFullYear()} Dr.Arty Prime Herb. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
