import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CustomerInfo } from '@/types';

interface Props {
  form: CustomerInfo;
  updateField: (field: keyof CustomerInfo, value: string) => void;
  isFormValid: boolean;
  onNext: () => void;
}

export default function CheckoutShippingForm({ form, updateField, isFormValid, onNext }: Props) {
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <h2 className="text-xl font-display font-bold text-foreground">ข้อมูลการจัดส่ง</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-thai text-muted-foreground">ชื่อ-นามสกุล *</Label>
          <Input value={form.name} onChange={e => updateField('name', e.target.value)} placeholder="ชื่อ นามสกุล" className="bg-secondary border-border font-thai" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-thai text-muted-foreground">เบอร์โทรศัพท์ *</Label>
          <Input value={form.phone} onChange={e => updateField('phone', e.target.value)} placeholder="08X-XXX-XXXX" className="bg-secondary border-border font-thai" />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-thai text-muted-foreground">อีเมล *</Label>
        <Input value={form.email} onChange={e => updateField('email', e.target.value)} type="email" placeholder="email@example.com" className="bg-secondary border-border font-thai" />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-thai text-muted-foreground">ที่อยู่จัดส่ง *</Label>
        <Textarea value={form.address} onChange={e => updateField('address', e.target.value)} placeholder="บ้านเลขที่ ซอย ถนน แขวง/ตำบล เขต/อำเภอ" className="bg-secondary border-border font-thai" rows={3} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-thai text-muted-foreground">จังหวัด *</Label>
          <Input value={form.province} onChange={e => updateField('province', e.target.value)} placeholder="กรุงเทพมหานคร" className="bg-secondary border-border font-thai" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-thai text-muted-foreground">รหัสไปรษณีย์ *</Label>
          <Input value={form.postalCode} onChange={e => updateField('postalCode', e.target.value)} placeholder="10XXX" className="bg-secondary border-border font-thai" />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-thai text-muted-foreground">หมายเหตุ (ถ้ามี)</Label>
        <Input value={form.note} onChange={e => updateField('note', e.target.value)} placeholder="ข้อความถึงทีมงาน" className="bg-secondary border-border font-thai" />
      </div>
      <Button
        onClick={onNext}
        disabled={!isFormValid}
        className="w-full bg-gradient-gold text-primary-foreground font-thai font-semibold hover:opacity-90 mt-4"
        size="lg"
      >
        ถัดไป: เลือกวิธีชำระเงิน
      </Button>
    </motion.div>
  );
}
