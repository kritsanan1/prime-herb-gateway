import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FAQ_DATA } from '@/data';

export default function FAQSection() {
  return (
    <section id="faq" className="py-20 md:py-32 bg-gradient-dark">
      <div className="container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gradient-gold mb-4">คำถามที่พบบ่อย</h2>
          <p className="text-muted-foreground font-thai">คำตอบสำหรับทุกข้อสงสัย</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {FAQ_DATA.map((item, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-gradient-card border border-border rounded-xl px-6 data-[state=open]:border-gold transition-colors"
              >
                <AccordionTrigger className="text-sm font-thai font-medium text-foreground hover:text-primary py-5 hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground font-thai leading-relaxed pb-5">
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
