import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FAQ_DATA } from '@/data';

export default function FAQSection() {
  return (
    <section id="faq" className="relative py-24 md:py-36 bg-gradient-dark overflow-hidden">
      <div className="absolute inset-0 noise-overlay pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-radial-gold opacity-30 pointer-events-none" />

      <div className="container max-w-3xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <p className="text-xs text-primary font-thai tracking-[0.3em] uppercase mb-4">FAQ</p>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-gradient-gold mb-4 gold-divider">
            คำถามที่พบบ่อย
          </h2>
          <p className="text-muted-foreground font-thai mt-8">คำตอบสำหรับทุกข้อสงสัย</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {FAQ_DATA.map((item, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-gradient-card border border-border/60 rounded-2xl px-6 data-[state=open]:border-gold/40 transition-all duration-500 hover-lift data-[state=open]:shadow-gold"
              >
                <AccordionTrigger className="text-sm font-thai font-medium text-foreground hover:text-primary py-5 hover:no-underline transition-colors duration-300">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground/80 font-thai leading-relaxed pb-5">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
