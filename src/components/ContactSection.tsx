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
    <section id="contact" className="relative py-24 md:py-36 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-radial-gold opacity-20 pointer-events-none" />

      <div className="container max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <p className="text-xs text-primary font-thai tracking-[0.3em] uppercase mb-4">Contact</p>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-gradient-gold mb-4 gold-divider">
            ติดต่อเรา
          </h2>
          <p className="text-muted-foreground font-thai mt-8">พร้อมให้บริการทุกวัน สำหรับคำถามหรือปัญหาเกี่ยวกับคำสั่งซื้อ</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CHANNELS.map((ch, i) => (
            <motion.a
              key={i}
              href={ch.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="bg-gradient-card border border-border/60 rounded-2xl p-7 text-center hover:border-gold/40 transition-all duration-500 group hover-lift"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 group-hover:bg-primary/15 flex items-center justify-center mx-auto mb-4 transition-all duration-500 group-hover:shadow-gold">
                <ch.icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <p className="font-thai font-medium text-foreground text-sm mb-1">{ch.label}</p>
              <p className="text-xs text-muted-foreground/60 font-thai">{ch.desc}</p>
            </motion.a>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-muted-foreground/60 font-thai mb-5">
            ชำระเงินไม่สำเร็จ? ต้องการความช่วยเหลือ?
          </p>
          <Button
            variant="outline"
            className="border-gold/40 text-primary font-thai hover:bg-primary/10 transition-all duration-300 rounded-xl glass"
          >
            แจ้งปัญหาการชำระเงิน
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
