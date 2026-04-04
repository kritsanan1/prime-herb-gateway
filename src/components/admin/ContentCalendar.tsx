import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Loader2, Send, Calendar } from 'lucide-react';
import { toast } from 'sonner';

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

const PLATFORMS = [
  { value: 'facebook', label: '📘 Facebook', emoji: '📘' },
  { value: 'instagram', label: '📸 Instagram', emoji: '📸' },
  { value: 'tiktok', label: '🎵 TikTok', emoji: '🎵' },
  { value: 'youtube', label: '▶️ YouTube', emoji: '▶️' },
  { value: 'line', label: '💬 LINE', emoji: '💬' },
  { value: 'twitter', label: '🐦 X/Twitter', emoji: '🐦' },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft: { label: 'แบบร่าง', color: 'bg-secondary text-muted-foreground' },
  pending_approval: { label: 'รออนุมัติ', color: 'bg-amber-500/20 text-amber-400' },
  approved: { label: 'อนุมัติแล้ว', color: 'bg-primary/20 text-primary' },
  published: { label: 'โพสต์แล้ว', color: 'bg-emerald-500/20 text-emerald-400' },
  rejected: { label: 'ถูกปฏิเสธ', color: 'bg-destructive/20 text-destructive' },
};

const EMPTY = {
  platform: 'facebook',
  caption: '',
  hashtags: '',
  image_url: '',
  scheduled_at: '',
  status: 'draft',
  author: 'ทีมงาน',
  notes: '',
};

export default function ContentCalendar() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [sendingApproval, setSendingApproval] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('content_calendar')
      .select('*')
      .order('scheduled_at', { ascending: true, nullsFirst: false });
    setItems((data as ContentItem[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };

  const openEdit = (item: ContentItem) => {
    setEditing(item);
    setForm({
      platform: item.platform,
      caption: item.caption,
      hashtags: item.hashtags || '',
      image_url: item.image_url || '',
      scheduled_at: item.scheduled_at ? new Date(item.scheduled_at).toISOString().slice(0, 16) : '',
      status: item.status,
      author: item.author,
      notes: item.notes || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.caption) { toast.error('กรุณากรอก Caption'); return; }
    setSaving(true);
    const payload = {
      ...form,
      scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null,
    };

    if (editing) {
      const { error } = await supabase.from('content_calendar').update(payload).eq('id', editing.id);
      if (error) toast.error(error.message); else toast.success('อัปเดตสำเร็จ');
    } else {
      const { error } = await supabase.from('content_calendar').insert(payload);
      if (error) toast.error(error.message); else toast.success('เพิ่มโพสต์สำเร็จ');
    }
    setSaving(false);
    setDialogOpen(false);
    fetchItems();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('content_calendar').delete().eq('id', deleteId);
    if (error) toast.error(error.message); else toast.success('ลบสำเร็จ');
    setDeleteId(null);
    fetchItems();
  };

  const sendApproval = async (item: ContentItem) => {
    setSendingApproval(item.id);
    try {
      const { data, error } = await supabase.functions.invoke('line-notify', {
        body: {
          type: 'social_approval',
          data: {
            platform: item.platform,
            caption: item.caption,
            hashtags: item.hashtags,
            image_url: item.image_url,
            scheduled_at: item.scheduled_at ? new Date(item.scheduled_at).toLocaleString('th-TH') : 'ยังไม่กำหนด',
            author: item.author,
            approve_url: `https://prime-herb-gateway.lovable.app/admin`,
            edit_url: `https://prime-herb-gateway.lovable.app/admin`,
          },
        },
      });

      if (error) throw error;
      if (data?.success) {
        await supabase.from('content_calendar').update({ status: 'pending_approval', approval_sent_at: new Date().toISOString() }).eq('id', item.id);
        toast.success('ส่งขออนุมัติผ่าน LINE สำเร็จ');
        fetchItems();
      } else {
        toast.error('ส่ง LINE ไม่สำเร็จ: ' + JSON.stringify(data));
      }
    } catch (err: any) {
      toast.error('เกิดข้อผิดพลาด: ' + err.message);
    }
    setSendingApproval(null);
  };

  const getPlatformEmoji = (p: string) => PLATFORMS.find(pl => pl.value === p)?.emoji || '📱';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <Calendar className="w-6 h-6 text-primary" /> Content Calendar ({items.length})
        </h2>
        <Button onClick={openNew} className="bg-gradient-gold text-primary-foreground font-thai">
          <Plus className="w-4 h-4 mr-1" /> เพิ่มโพสต์
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 bg-gradient-card border border-border rounded-xl">
          <Calendar className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground font-thai text-sm">ยังไม่มีโพสต์ใน Content Calendar</p>
          <Button onClick={openNew} variant="outline" className="mt-4 font-thai border-border text-xs">
            <Plus className="w-3 h-3 mr-1" /> เพิ่มโพสต์แรก
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map(item => {
            const st = STATUS_MAP[item.status] || STATUS_MAP.draft;
            return (
              <div key={item.id} className="bg-gradient-card border border-border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getPlatformEmoji(item.platform)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-thai text-sm text-foreground line-clamp-2">{item.caption || 'ไม่มี caption'}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-[10px] font-thai">{item.platform}</Badge>
                      <Badge className={`text-[10px] font-thai ${st.color} border-0`}>{st.label}</Badge>
                      {item.scheduled_at && (
                        <span className="text-[10px] text-muted-foreground font-thai">
                          📅 {new Date(item.scheduled_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground font-thai">โดย {item.author}</span>
                    </div>
                    {item.hashtags && (
                      <p className="text-[10px] text-primary/70 mt-1 truncate">{item.hashtags}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {item.status === 'draft' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendApproval(item)}
                        disabled={sendingApproval === item.id}
                        className="text-[10px] font-thai border-primary/30 text-primary h-7 px-2"
                      >
                        {sendingApproval === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3 mr-1" />}
                        ส่งอนุมัติ
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" onClick={() => openEdit(item)} className="h-7 w-7">
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setDeleteId(item.id)} className="h-7 w-7 text-destructive hover:text-destructive">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? 'แก้ไขโพสต์' : 'เพิ่มโพสต์ใหม่'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-thai text-xs">แพลตฟอร์ม</Label>
                <Select value={form.platform} onValueChange={v => setForm(f => ({ ...f, platform: v }))}>
                  <SelectTrigger className="bg-secondary border-border font-thai"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map(p => <SelectItem key={p.value} value={p.value} className="font-thai">{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-thai text-xs">สถานะ</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger className="bg-secondary border-border font-thai"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_MAP).map(([k, v]) => <SelectItem key={k} value={k} className="font-thai">{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="font-thai text-xs">Caption</Label>
              <Textarea value={form.caption} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))} rows={4} className="bg-secondary border-border font-thai text-sm" placeholder="เขียน caption..." />
            </div>
            <div>
              <Label className="font-thai text-xs">Hashtags</Label>
              <Input value={form.hashtags} onChange={e => setForm(f => ({ ...f, hashtags: e.target.value }))} placeholder="#DrArty #PrimeHerb" className="bg-secondary border-border text-xs" />
            </div>
            <div>
              <Label className="font-thai text-xs">รูปภาพ (URL)</Label>
              <Input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://..." className="bg-secondary border-border text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-thai text-xs">กำหนดโพสต์</Label>
                <Input type="datetime-local" value={form.scheduled_at} onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))} className="bg-secondary border-border text-xs" />
              </div>
              <div>
                <Label className="font-thai text-xs">ผู้เขียน</Label>
                <Input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} className="bg-secondary border-border font-thai text-xs" />
              </div>
            </div>
            <div>
              <Label className="font-thai text-xs">หมายเหตุ</Label>
              <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="bg-secondary border-border font-thai text-xs" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="font-thai border-border">ยกเลิก</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-gradient-gold text-primary-foreground font-thai">
                {saving && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                {editing ? 'บันทึก' : 'เพิ่มโพสต์'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-thai">ยืนยันการลบ</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground font-thai">คุณต้องการลบโพสต์นี้หรือไม่?</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="font-thai border-border">ยกเลิก</Button>
            <Button variant="destructive" onClick={handleDelete} className="font-thai">ลบโพสต์</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
