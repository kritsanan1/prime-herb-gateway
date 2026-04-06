import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ContentItem {
  id: string;
  platform: string;
  caption: string;
  scheduled_at: string | null;
  status: string;
  image_url: string;
  hashtags: string;
  author: string;
  notes: string;
  approval_sent_at: string | null;
  created_at: string;
}

const PLATFORM_EMOJI: Record<string, string> = {
  facebook: '📘', instagram: '📸', tiktok: '🎵', youtube: '▶️', line: '💬', twitter: '🐦',
};

const DAY_NAMES = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

interface Props {
  items: ContentItem[];
  onEdit: (item: ContentItem) => void;
  onNewOnDate: (date: Date) => void;
}

export default function ContentMonthCalendar({ items, onEdit, onNewOnDate }: Props) {
  const [current, setCurrent] = useState(new Date());
  const year = current.getFullYear();
  const month = current.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const prev = () => setCurrent(new Date(year, month - 1, 1));
  const next = () => setCurrent(new Date(year, month + 1, 1));

  const getItemsForDay = (day: number) => {
    return items.filter(i => {
      if (!i.scheduled_at) return false;
      const d = new Date(i.scheduled_at);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Button size="icon" variant="ghost" onClick={prev} className="h-8 w-8">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-thai font-semibold text-foreground">
          {current.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
        </span>
        <Button size="icon" variant="ghost" onClick={next} className="h-8 w-8">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
        {DAY_NAMES.map(d => (
          <div key={d} className="bg-secondary p-1.5 text-center">
            <span className="text-[10px] font-thai text-muted-foreground font-medium">{d}</span>
          </div>
        ))}
        {cells.map((day, i) => {
          const dayItems = day ? getItemsForDay(day) : [];
          return (
            <div
              key={i}
              className={`bg-background min-h-[70px] p-1 ${
                day ? 'cursor-pointer hover:bg-secondary/50 transition-colors' : ''
              } ${day && isToday(day) ? 'ring-1 ring-inset ring-primary/50' : ''}`}
              onClick={() => day && onNewOnDate(new Date(year, month, day))}
            >
              {day && (
                <>
                  <span className={`text-[10px] font-thai ${isToday(day) ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                    {day}
                  </span>
                  <div className="space-y-0.5 mt-0.5">
                    {dayItems.slice(0, 3).map(item => (
                      <div
                        key={item.id}
                        onClick={e => { e.stopPropagation(); onEdit(item); }}
                        className="flex items-center gap-0.5 rounded px-0.5 py-px bg-primary/10 hover:bg-primary/20 cursor-pointer transition-colors"
                      >
                        <span className="text-[9px]">{PLATFORM_EMOJI[item.platform] || '📱'}</span>
                        <span className="text-[8px] font-thai text-foreground truncate">{item.caption.slice(0, 12)}</span>
                      </div>
                    ))}
                    {dayItems.length > 3 && (
                      <span className="text-[8px] text-muted-foreground font-thai">+{dayItems.length - 3} อื่นๆ</span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Unscheduled posts */}
      {items.filter(i => !i.scheduled_at).length > 0 && (
        <div className="bg-secondary/30 rounded-lg p-3">
          <p className="text-xs font-thai text-muted-foreground mb-2">📌 ยังไม่กำหนดวัน ({items.filter(i => !i.scheduled_at).length})</p>
          <div className="flex flex-wrap gap-1">
            {items.filter(i => !i.scheduled_at).map(item => (
              <Badge
                key={item.id}
                variant="outline"
                className="text-[10px] font-thai cursor-pointer hover:bg-primary/10"
                onClick={() => onEdit(item)}
              >
                {PLATFORM_EMOJI[item.platform] || '📱'} {item.caption.slice(0, 15)}...
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
