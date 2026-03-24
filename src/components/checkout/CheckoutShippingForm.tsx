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

const fields = [
  { row: true, items: [
    { key: 'name' as const, label: 'ชื่อ-นามสกุล *', placeholder: 'ชื่อ นามสกุล', type: 'input' },
    { key: 'phone' as const, label: 'เบอร์โทรศัพท์ *', placeholder: '08X-XXX-XXXX', type: 'input' },
  ]},
  { row: false, items: [
    { key: 'email' as const, label: 'อีเมล *', placeholder: 'email@example.com', type: 'email' },
  ]},
  { row: false, items: [
    { key: 'address' as const, label: 'ที่อยู่จัดส่ง *', placeholder: 'บ้านเลขที่ ซอย ถนน แขวง/ตำบล เขต/อำเภอ', type: 'textarea' },
  ]},
  { row: true, items: [
    { key: 'province' as const, label: 'จังหวัด *', placeholder: 'กรุงเทพมหานคร', type: 'input' },
    { key: 'postalCode' as const, label: 'รหัสไปรษณีย์ *', placeholder: '10XXX', type: 'input' },
  ]},
  { row: false, items: [
    { key: 'note' as const, label: 'หมายเหตุ (ถ้ามี)', placeholder: 'ข้อความถึงทีมงาน', type: 'input' },
  ]},
];

export default function CheckoutShippingForm({ form, updateField, isFormValid, onNext }: Props) {
  let fieldIndex = 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass border border-border rounded-2xl p-6 md:p-8 shadow-card space-y-5"
    >
      <h2 className="text-xl font-display font-bold text-foreground gold-divider pb-4">ข้อมูลการจัดส่ง</h2>
      {fields.map((group, gi) => {
        const content = group.row ? (
          <div key={gi} className="grid sm:grid-cols-2 gap-4">
            {group.items.map(item => {
              const idx = fieldIndex++;
              return (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * idx, duration: 0.3 }}
                  className="space-y-2"
                >
                  <Label className="text-xs font-thai text-muted-foreground">{item.label}</Label>
                  <Input
                    value={form[item.key]}
                    onChange={e => updateField(item.key, e.target.value)}
                    placeholder={item.placeholder}
                    type={item.type === 'email' ? 'email' : 'text'}
                    className="bg-secondary/50 border-border font-thai focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                  />
                </motion.div>
              );
            })}
          </div>
        ) : (
          group.items.map(item => {
            const idx = fieldIndex++;
            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * idx, duration: 0.3 }}
                className="space-y-2"
              >
                <Label className="text-xs font-thai text-muted-foreground">{item.label}</Label>
                {item.type === 'textarea' ? (
                  <Textarea
                    value={form[item.key]}
                    onChange={e => updateField(item.key, e.target.value)}
                    placeholder={item.placeholder}
                    className="bg-secondary/50 border-border font-thai focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                    rows={3}
                  />
                ) : (
                  <Input
                    value={form[item.key]}
                    onChange={e => updateField(item.key, e.target.value)}
                    placeholder={item.placeholder}
                    type={item.type === 'email' ? 'email' : 'text'}
                    className="bg-secondary/50 border-border font-thai focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                  />
                )}
              </motion.div>
            );
          })
        );
        return content;
      })}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        <Button
          onClick={onNext}
          disabled={!isFormValid}
          className="w-full bg-gradient-gold text-primary-foreground font-thai font-semibold hover:opacity-90 mt-2 shadow-gold rounded-xl"
          size="lg"
        >
          ถัดไป: เลือกวิธีชำระเงิน
        </Button>
      </motion.div>
    </motion.div>
  );
}
