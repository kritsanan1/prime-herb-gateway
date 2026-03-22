import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient-gold mb-8">
            นโยบายความเป็นส่วนตัว
          </h1>

          <div className="space-y-8 text-sm text-muted-foreground font-thai leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">1. ข้อมูลที่เราเก็บรวบรวม</h2>
              <p>เมื่อคุณสั่งซื้อสินค้าผ่านเว็บไซต์ของเรา เราจะเก็บรวบรวมข้อมูลดังต่อไปนี้:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>ชื่อ-นามสกุล</li>
                <li>หมายเลขโทรศัพท์</li>
                <li>อีเมล</li>
                <li>ที่อยู่สำหรับจัดส่งสินค้า</li>
                <li>ข้อมูลการชำระเงิน (ไม่รวมหมายเลขบัตรเครดิตแบบเต็ม)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">2. วัตถุประสงค์ในการใช้ข้อมูล</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>ดำเนินการสั่งซื้อและจัดส่งสินค้า</li>
                <li>ติดต่อสื่อสารเกี่ยวกับคำสั่งซื้อ</li>
                <li>ปรับปรุงบริการและประสบการณ์การใช้งาน</li>
                <li>ปฏิบัติตามกฎหมายที่เกี่ยวข้อง</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">3. การปกป้องข้อมูล</h2>
              <p>
                เราใช้มาตรการรักษาความปลอดภัยที่เหมาะสมเพื่อป้องกันการเข้าถึง การเปิดเผย
                การเปลี่ยนแปลง หรือการทำลายข้อมูลส่วนบุคคลของคุณโดยไม่ได้รับอนุญาต
                ข้อมูลการชำระเงินจะถูกเข้ารหัสและดำเนินการผ่านช่องทางที่ปลอดภัย
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">4. การแบ่งปันข้อมูล</h2>
              <p>เราจะไม่ขาย แลกเปลี่ยน หรือโอนข้อมูลส่วนบุคคลของคุณให้กับบุคคลภายนอก ยกเว้น:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>บริษัทขนส่งเพื่อจัดส่งสินค้า</li>
                <li>ผู้ให้บริการชำระเงินเพื่อดำเนินธุรกรรม</li>
                <li>เมื่อกฎหมายกำหนด</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">5. ความเป็นส่วนตัวในการจัดส่ง</h2>
              <p>
                เราให้ความสำคัญกับความเป็นส่วนตัวของลูกค้า สินค้าทุกชิ้นจะถูกบรรจุใน
                บรรจุภัณฑ์ที่ไม่ระบุรายละเอียดสินค้าภายนอก เพื่อรักษาความเป็นส่วนตัวอย่างสูงสุด
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">6. สิทธิ์ของคุณ</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>ขอเข้าถึงข้อมูลส่วนบุคคลที่เราเก็บรวบรวม</li>
                <li>ขอแก้ไขข้อมูลที่ไม่ถูกต้อง</li>
                <li>ขอลบข้อมูลส่วนบุคคล (ภายใต้ข้อกำหนดทางกฎหมาย)</li>
                <li>ปฏิเสธการรับข่าวสารส่งเสริมการขาย</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">7. ช่องทางติดต่อ</h2>
              <p>หากคุณมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัว สามารถติดต่อเราได้ที่:</p>
              <ul className="mt-2 space-y-1">
                <li>อีเมล: support@drarty.com</li>
                <li>LINE: @drarty</li>
                <li>โทร: 02-XXX-XXXX</li>
              </ul>
            </section>

            <p className="text-xs text-muted-foreground/50 pt-4 border-t border-border">
              นโยบายนี้มีผลบังคับใช้ตั้งแต่วันที่เผยแพร่ และอาจมีการปรับปรุงเป็นระยะ
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
