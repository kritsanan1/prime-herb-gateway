import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash2, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

interface ContentItem {
  id: string;
  platform: string;
  caption: string;
  hashtags: string;
  image_url: string;
  scheduled_at: string | null;
  status: string;
  author: string;
  notes: string;
  approval_sent_at: string | null;
  created_at: string;
}

const COLUMNS: { key: string; label: string; color: string }[] = [
  { key: 'draft', label: 'แบบร่าง', color: 'border-muted-foreground/30' },
  { key: 'pending_approval', label: 'รออนุมัติ', color: 'border-amber-500/50' },
  { key: 'approved', label: 'อนุมัติแล้ว', color: 'border-primary/50' },
  { key: 'published', label: 'โพสต์แล้ว', color: 'border-emerald-500/50' },
  { key: 'rejected', label: 'ถูกปฏิเสธ', color: 'border-destructive/50' },
];

const PLATFORM_EMOJI: Record<string, string> = {
  facebook: '📘', instagram: '📸', tiktok: '🎵', youtube: '▶️', line: '💬', twitter: '🐦',
};

interface Props {
  items: ContentItem[];
  onEdit: (item: ContentItem) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export default function ContentKanban({ items, onEdit, onDelete, onRefresh }: Props) {
  const [movingId, setMovingId] = useState<string | null>(null);

  const changeStatus = async (id: string, newStatus: string) => {
    setMovingId(id);
    const { error } = await supabase
      .from('content_calendar')
      .update({ status: newStatus as any })
      .eq('id', id);
    if (error) toast.error(error.message);
    else toast.success('เปลี่ยนสถานะสำเร็จ');
    setMovingId(null);
    onRefresh();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 overflow-x-auto">
      {COLUMNS.map(col => {
        const colItems = items.filter(i => i.status === col.key);
        return (
          <div key={col.key} className={`border-t-2 ${col.color} bg-secondary/30 rounded-lg p-2 min-h-[200px]`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-thai font-semibold text-foreground">{col.label}</span>
              <Badge variant="outline" className="text-[10px]">{colItems.length}</Badge>
            </div>
            <div className="space-y-2">
              {colItems.map(item => (
                <div key={item.id} className="bg-background border border-border rounded-md p-2 space-y-1">
                  <div className="flex items-center gap-1">
                    <span className="text-sm">{PLATFORM_EMOJI[item.platform] || '📱'}</span>
                    <span className="text-[10px] text-muted-foreground font-thai truncate flex-1">{item.platform}</span>
                  </div>
                  <p className="text-xs font-thai text-foreground line-clamp-2">{item.caption || 'ไม่มี caption'}</p>
                  {item.image_url && (
                    <img src={item.image_url} alt="" className="w-full h-16 object-cover rounded" />
                  )}
                  {item.scheduled_at && (
                    <p className="text-[9px] text-muted-foreground font-thai">
                      📅 {new Date(item.scheduled_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                  )}
                  <div className="flex items-center gap-1 pt-1">
                    <Select
                      value={item.status}
                      onValueChange={v => changeStatus(item.id, v)}
                      disabled={movingId === item.id}
                    >
                      <SelectTrigger className="h-6 text-[10px] font-thai flex-1 border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COLUMNS.map(c => (
                          <SelectItem key={c.key} value={c.key} className="text-[10px] font-thai">{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="icon" variant="ghost" onClick={() => onEdit(item)} className="h-6 w-6">
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => onDelete(item.id)} className="h-6 w-6 text-destructive">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {colItems.length === 0 && (
                <p className="text-[10px] text-muted-foreground/50 text-center py-4 font-thai">ว่าง</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
