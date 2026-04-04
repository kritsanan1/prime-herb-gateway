import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import ArticleImageUpload from './ArticleImageUpload';
import RichTextEditor from './RichTextEditor';

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  read_time: number;
  published_at: string;
  youtube_url: string | null;
  is_published: boolean;
  created_at: string;
}

const EMPTY: Omit<Article, 'id' | 'created_at'> = {
  slug: '',
  title: '',
  excerpt: '',
  content: '',
  image: '',
  category: 'ทั่วไป',
  read_time: 3,
  published_at: new Date().toISOString().slice(0, 10),
  youtube_url: null,
  is_published: false,
};

function toSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^\u0E00-\u0E7Fa-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

export default function ArticleManager() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchArticles = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false });
    setArticles((data as Article[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchArticles(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY);
    setDialogOpen(true);
  };

  const openEdit = (a: Article) => {
    setEditing(a);
    setForm({
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      content: a.content,
      image: a.image,
      category: a.category,
      read_time: a.read_time,
      published_at: a.published_at?.slice(0, 10) || '',
      youtube_url: a.youtube_url,
      is_published: a.is_published,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.slug) {
      toast.error('กรุณากรอก Title และ Slug');
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      published_at: form.published_at ? new Date(form.published_at).toISOString() : new Date().toISOString(),
    };

    if (editing) {
      const { error } = await supabase.from('articles').update(payload).eq('id', editing.id);
      if (error) toast.error(error.message);
      else toast.success('อัปเดตบทความสำเร็จ');
    } else {
      const { error } = await supabase.from('articles').insert(payload);
      if (error) toast.error(error.message);
      else toast.success('เพิ่มบทความสำเร็จ');
    }
    setSaving(false);
    setDialogOpen(false);
    fetchArticles();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('articles').delete().eq('id', deleteId);
    if (error) toast.error(error.message);
    else toast.success('ลบบทความสำเร็จ');
    setDeleteId(null);
    fetchArticles();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-foreground">จัดการบทความ ({articles.length})</h2>
        <Button onClick={openNew} className="bg-gradient-gold text-primary-foreground font-thai">
          <Plus className="w-4 h-4 mr-1" /> เพิ่มบทความ
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
      ) : articles.length === 0 ? (
        <p className="text-muted-foreground font-thai text-sm">ยังไม่มีบทความ</p>
      ) : (
        <div className="space-y-2">
          {articles.map(a => (
            <div key={a.id} className="flex items-center gap-4 bg-gradient-card border border-border rounded-lg p-4">
              {a.image && (
                <img src={a.image} alt="" className="w-16 h-10 object-cover rounded hidden sm:block" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-foreground text-sm truncate">{a.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[10px] font-thai">{a.category}</Badge>
                  {a.is_published ? (
                    <span className="flex items-center gap-1 text-[10px] text-primary font-thai"><Eye className="w-3 h-3" /> เผยแพร่</span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-thai"><EyeOff className="w-3 h-3" /> ฉบับร่าง</span>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => openEdit(a)} className="h-8 w-8">
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setDeleteId(a.id)} className="h-8 w-8 text-destructive hover:text-destructive">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? 'แก้ไขบทความ' : 'เพิ่มบทความใหม่'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="font-thai text-xs">ชื่อบทความ</Label>
              <Input
                value={form.title}
                onChange={e => {
                  const title = e.target.value;
                  setForm(f => ({ ...f, title, slug: editing ? f.slug : toSlug(title) }));
                }}
                placeholder="ชื่อบทความ"
                className="bg-secondary border-border font-thai"
              />
            </div>
            <div>
              <Label className="font-thai text-xs">Slug (URL)</Label>
              <Input
                value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                placeholder="url-slug"
                className="bg-secondary border-border font-mono text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-thai text-xs">หมวดหมู่</Label>
                <Input
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="bg-secondary border-border font-thai"
                />
              </div>
              <div>
                <Label className="font-thai text-xs">เวลาอ่าน (นาที)</Label>
                <Input
                  type="number"
                  value={form.read_time}
                  onChange={e => setForm(f => ({ ...f, read_time: parseInt(e.target.value) || 3 }))}
                  className="bg-secondary border-border"
                />
              </div>
            </div>
            <ArticleImageUpload
              value={form.image}
              onChange={url => setForm(f => ({ ...f, image: url }))}
            />
            <div>
              <Label className="font-thai text-xs">YouTube URL (ถ้ามี)</Label>
              <Input
                value={form.youtube_url || ''}
                onChange={e => setForm(f => ({ ...f, youtube_url: e.target.value || null }))}
                placeholder="https://www.youtube.com/..."
                className="bg-secondary border-border text-xs"
              />
            </div>
            <div>
              <Label className="font-thai text-xs">วันที่เผยแพร่</Label>
              <Input
                type="date"
                value={form.published_at}
                onChange={e => setForm(f => ({ ...f, published_at: e.target.value }))}
                className="bg-secondary border-border"
              />
            </div>
            <div>
              <Label className="font-thai text-xs">คำอธิบายสั้น</Label>
              <Textarea
                value={form.excerpt}
                onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                rows={2}
                className="bg-secondary border-border font-thai text-sm"
              />
            </div>
            <div>
              <Label className="font-thai text-xs">เนื้อหา</Label>
              <RichTextEditor
                value={form.content}
                onChange={v => setForm(f => ({ ...f, content: v }))}
                placeholder="เขียนเนื้อหาบทความ..."
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.is_published}
                onCheckedChange={v => setForm(f => ({ ...f, is_published: v }))}
              />
              <Label className="font-thai text-sm">เผยแพร่บทความ</Label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="font-thai border-border">ยกเลิก</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-gradient-gold text-primary-foreground font-thai">
                {saving && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                {editing ? 'บันทึก' : 'เพิ่มบทความ'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-thai">ยืนยันการลบ</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground font-thai">คุณต้องการลบบทความนี้หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="font-thai border-border">ยกเลิก</Button>
            <Button variant="destructive" onClick={handleDelete} className="font-thai">ลบบทความ</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
