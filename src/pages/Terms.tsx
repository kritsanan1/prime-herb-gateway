import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Terms() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient-gold mb-8">
            เงื่อนไขการสั่งซื้อ
          </h1>

          <div className="space-y-8 text-sm text-muted-foreground font-thai leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">1. การสั่งซื้อสินค้า</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>เลือกสินค้าและจำนวนที่ต้องการ แล้วเพิ่มลงตะกร้า</li>
                <li>กรอกข้อมูลจัดส่งให้ครบถ้วนและถูกต้อง</li>
                <li>ตรวจสอบรายการสั่งซื้อก่อนยืนยัน</li>
                <li>คำสั่งซื้อที่ยืนยันแล้วจะได้รับหมายเลขออเดอร์สำหรับติดตามสถานะ</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">2. การชำระเงิน</h2>
              <p>เรารองรับช่องทางชำระเงินดังนี้:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>QR Payment / PromptPay</li>
                <li>บัตรเครดิต / เดบิต</li>
                <li>โอนเงินผ่านธนาคาร</li>
              </ul>
              <p className="mt-2">
                กรุณาชำระเงินภายใน 24 ชั่วโมงหลังสั่งซื้อ มิฉะนั้นคำสั่งซื้ออาจถูกยกเลิกโดยอัตโนมัติ
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">3. การจัดส่ง</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>จัดส่งทั่วประเทศไทย ภายใน 2-5 วันทำการ</li>
                <li>ค่าจัดส่งคำนวณตามน้ำหนักและปลายทาง</li>
                <li>สินค้าจะถูกบรรจุในบรรจุภัณฑ์ที่ไม่ระบุรายละเอียดสินค้าภายนอก</li>
                <li>หมายเลขพัสดุจะแจ้งผ่านอีเมลหรือ SMS เมื่อจัดส่ง</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">4. นโยบายคืน/เปลี่ยนสินค้า</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>รับคืน/เปลี่ยนสินค้าภายใน 7 วันหลังได้รับสินค้า</li>
                <li>สินค้าต้องอยู่ในสภาพสมบูรณ์ ไม่ถูกเปิดใช้งาน</li>
                <li>ค่าจัดส่งคืนเป็นความรับผิดชอบของลูกค้า ยกเว้นกรณีสินค้าชำรุด</li>
                <li>การคืนเงินจะดำเนินการภายใน 7-14 วันทำการหลังได้รับสินค้าคืน</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">5. ข้อจำกัดความรับผิดชอบ</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>ผลิตภัณฑ์เป็นอาหารเสริม ไม่ใช่ยารักษาโรค</li>
                <li>ผลลัพธ์อาจแตกต่างกันในแต่ละบุคคล</li>
                <li>เนื้อหาบนเว็บไซต์เป็นข้อมูลผลิตภัณฑ์ทั่วไป ไม่ใช่คำแนะนำทางการแพทย์</li>
                <li>สำหรับผู้ที่มีอายุ 18 ปีขึ้นไปเท่านั้น</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">6. การเปลี่ยนแปลงเงื่อนไข</h2>
              <p>
                เราขอสงวนสิทธิ์ในการเปลี่ยนแปลงเงื่อนไขการสั่งซื้อได้ตลอดเวลา
                การเปลี่ยนแปลงจะมีผลบังคับใช้ทันทีที่เผยแพร่บนเว็บไซต์
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">7. ติดต่อเรา</h2>
              <p>หากมีข้อสงสัยเกี่ยวกับเงื่อนไขการสั่งซื้อ สามารถติดต่อได้ที่:</p>
              <ul className="mt-2 space-y-1">
                <li>อีเมล: support@drarty.com</li>
                <li>LINE: @drarty</li>
                <li>โทร: 02-XXX-XXXX</li>
              </ul>
            </section>

            <p className="text-xs text-muted-foreground/50 pt-4 border-t border-border">
              เงื่อนไขนี้มีผลบังคับใช้ตั้งแต่วันที่เผยแพร่ และอาจมีการปรับปรุงเป็นระยะ
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
