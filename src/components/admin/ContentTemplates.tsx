import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

export interface ContentTemplate {
  name: string;
  emoji: string;
  caption: string;
  hashtags: string;
}

const TEMPLATES: ContentTemplate[] = [
  {
    name: 'โปรโมชั่น',
    emoji: '🔥',
    caption: '🔥 โปรโมชั่นพิเศษ!\n\n✅ [ชื่อสินค้า]\n💰 ราคาพิเศษเพียง [ราคา] บาท (จากปกติ [ราคาเดิม] บาท)\n📦 จัดส่งฟรีทั่วประเทศ\n\n🛒 สั่งซื้อเลย → [ลิงก์]',
    hashtags: '#DrArty #โปรโมชั่น #สมุนไพร #สุขภาพดี #ส่งฟรี',
  },
  {
    name: 'รีวิวลูกค้า',
    emoji: '⭐',
    caption: '⭐ รีวิวจากลูกค้าจริง!\n\n"[ข้อความรีวิว]"\n— คุณ [ชื่อ]\n\n💚 ขอบคุณที่ไว้วางใจ Dr.Arty ค่ะ\n\n#รีวิวจริง #ลูกค้าพูด',
    hashtags: '#DrArty #รีวิว #ลูกค้าจริง #สมุนไพรไทย',
  },
  {
    name: 'แนะนำสินค้า',
    emoji: '🌿',
    caption: '🌿 รู้จักกับ [ชื่อสินค้า]\n\n✨ จุดเด่น:\n• [จุดเด่น 1]\n• [จุดเด่น 2]\n• [จุดเด่น 3]\n\n🔬 ส่วนผสมจากธรรมชาติ 100%\n📋 ได้รับมาตรฐาน อย.',
    hashtags: '#DrArty #สมุนไพร #ธรรมชาติ #สุขภาพ #อย',
  },
  {
    name: 'เคล็ดลับสุขภาพ',
    emoji: '💡',
    caption: '💡 เคล็ดลับสุขภาพวันนี้\n\n📌 [หัวข้อ]\n\n1️⃣ [เคล็ดลับ 1]\n2️⃣ [เคล็ดลับ 2]\n3️⃣ [เคล็ดลับ 3]\n\n🌿 ดูแลสุขภาพง่ายๆ กับ Dr.Arty',
    hashtags: '#DrArty #เคล็ดลับสุขภาพ #สุขภาพดี #HealthTips',
  },
];

interface Props {
  onSelect: (t: ContentTemplate) => void;
}

export default function ContentTemplates({ onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {TEMPLATES.map(t => (
        <Button
          key={t.name}
          type="button"
          variant="outline"
          className="h-auto py-3 px-3 flex flex-col items-start gap-1 border-border text-left"
          onClick={() => onSelect(t)}
        >
          <span className="text-lg">{t.emoji}</span>
          <span className="text-xs font-thai font-medium text-foreground">{t.name}</span>
          <span className="text-[10px] text-muted-foreground font-thai line-clamp-2">{t.caption.slice(0, 50)}...</span>
        </Button>
      ))}
    </div>
  );
}
