import { motion } from 'framer-motion';
import { MessageCircle, Phone, Mail, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CHANNELS = [
  { icon: MessageCircle, label: 'LINE Official', desc: '@drarty', href: '#' },
  { icon: Facebook, label: 'Facebook', desc: 'Dr.Arty Prime Herb', href: '#' },
  { icon: Phone, label: 'โทรศัพท์', desc: '02-XXX-XXXX', href: '#' },
  { icon: Mail, label: 'อีเมล', desc: 'support@drarty.com', href: '#' },
];

export default function ContactSection() {
  return (
    <section id="contact" className="py-20 md:py-32">
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gradient-gold mb-4">ติดต่อเรา</h2>
          <p className="text-muted-foreground font-thai">พร้อมให้บริการทุกวัน สำหรับคำถามหรือปัญหาเกี่ยวกับคำสั่งซื้อ</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CHANNELS.map((ch, i) => (
            <motion.a
              key={i}
              href={ch.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-gradient-card border border-border rounded-xl p-6 text-center hover:border-gold transition-all group shadow-card"
            >
              <ch.icon className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-thai font-medium text-foreground text-sm mb-1">{ch.label}</p>
              <p className="text-xs text-muted-foreground font-thai">{ch.desc}</p>
            </motion.a>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 text-center"
        >
          <p className="text-sm text-muted-foreground font-thai mb-4">
            ชำระเงินไม่สำเร็จ? ต้องการความช่วยเหลือ?
          </p>
          <Button variant="outline" className="border-gold text-primary font-thai hover:bg-primary/10">
            แจ้งปัญหาการชำระเงิน
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
