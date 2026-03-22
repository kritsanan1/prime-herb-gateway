import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Loader2, Tag } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  created_at: string;
}

export default function CouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: 10,
    min_order: 0,
    max_uses: '' as string | number,
    is_active: true,
  });

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (data) setCoupons(data as unknown as Coupon[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const resetForm = () => {
    setForm({ code: '', discount_type: 'percentage', discount_value: 10, min_order: 0, max_uses: '', is_active: true });
    setEditing(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.code) return;
    const payload = {
      code: form.code.toUpperCase(),
      discount_type: form.discount_type,
      discount_value: form.discount_value,
      min_order: form.min_order,
      max_uses: form.max_uses === '' ? null : Number(form.max_uses),
      is_active: form.is_active,
    };

    if (editing) {
      await supabase.from('coupons').update(payload as any).eq('id', editing.id);
    } else {
      await supabase.from('coupons').insert(payload as any);
    }
    resetForm();
    fetchCoupons();
  };

  const handleEdit = (c: Coupon) => {
    setForm({
      code: c.code,
      discount_type: c.discount_type,
      discount_value: c.discount_value,
      min_order: c.min_order,
      max_uses: c.max_uses ?? '',
      is_active: c.is_active,
    });
    setEditing(c);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('coupons').delete().eq('id', id);
    fetchCoupons();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-foreground">จัดการคูปอง</h2>
        <Button
          size="sm"
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="bg-gradient-gold text-primary-foreground font-thai text-xs"
        >
          <Plus className="w-3 h-3 mr-1" /> เพิ่มคูปอง
        </Button>
      </div>

      {showForm && (
        <div className="bg-gradient-card border border-border rounded-xl p-6 shadow-card space-y-4">
          <h3 className="text-sm font-thai font-medium text-foreground">
            {editing ? 'แก้ไขคูปอง' : 'สร้างคูปองใหม่'}
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground font-thai block mb-1">รหัสคูปอง</label>
              <Input
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="เช่น DRARTY20"
                className="bg-secondary border-border font-mono text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-thai block mb-1">ประเภทส่วนลด</label>
              <Select value={form.discount_type} onValueChange={v => setForm(f => ({ ...f, discount_type: v }))}>
                <SelectTrigger className="bg-secondary border-border font-thai text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage" className="font-thai text-xs">เปอร์เซ็นต์ (%)</SelectItem>
                  <SelectItem value="fixed" className="font-thai text-xs">จำนวนเงิน (฿)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-thai block mb-1">
                มูลค่าส่วนลด {form.discount_type === 'percentage' ? '(%)' : '(฿)'}
              </label>
              <Input
                type="number"
                value={form.discount_value}
                onChange={e => setForm(f => ({ ...f, discount_value: Number(e.target.value) }))}
                className="bg-secondary border-border text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-thai block mb-1">ยอดขั้นต่ำ (฿)</label>
              <Input
                type="number"
                value={form.min_order}
                onChange={e => setForm(f => ({ ...f, min_order: Number(e.target.value) }))}
                className="bg-secondary border-border text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-thai block mb-1">จำกัดจำนวนครั้ง (ว่าง = ไม่จำกัด)</label>
              <Input
                type="number"
                value={form.max_uses}
                onChange={e => setForm(f => ({ ...f, max_uses: e.target.value === '' ? '' : Number(e.target.value) }))}
                placeholder="ไม่จำกัด"
                className="bg-secondary border-border text-sm"
              />
            </div>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 text-xs text-muted-foreground font-thai cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                  className="accent-primary"
                />
                เปิดใช้งาน
              </label>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} size="sm" className="bg-gradient-gold text-primary-foreground font-thai text-xs">
              {editing ? 'บันทึก' : 'สร้างคูปอง'}
            </Button>
            <Button onClick={resetForm} size="sm" variant="outline" className="border-border text-muted-foreground font-thai text-xs">
              ยกเลิก
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
      ) : coupons.length === 0 ? (
        <p className="text-muted-foreground font-thai text-sm">ยังไม่มีคูปอง</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-thai text-xs">
                <th className="text-left py-3 px-2">รหัส</th>
                <th className="text-left py-3 px-2">ส่วนลด</th>
                <th className="text-left py-3 px-2">ขั้นต่ำ</th>
                <th className="text-left py-3 px-2">ใช้แล้ว</th>
                <th className="text-left py-3 px-2">สถานะ</th>
                <th className="py-3 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-2 font-mono text-primary flex items-center gap-1.5">
                    <Tag className="w-3 h-3" /> {c.code}
                  </td>
                  <td className="py-3 px-2 font-thai text-foreground">
                    {c.discount_type === 'percentage' ? `${c.discount_value}%` : `฿${c.discount_value}`}
                  </td>
                  <td className="py-3 px-2 font-thai text-muted-foreground">
                    {c.min_order > 0 ? `฿${c.min_order.toLocaleString()}` : '-'}
                  </td>
                  <td className="py-3 px-2 font-thai text-muted-foreground">
                    {c.used_count}{c.max_uses ? `/${c.max_uses}` : ''}
                  </td>
                  <td className="py-3 px-2">
                    <span className={`text-xs px-2 py-0.5 rounded font-thai ${
                      c.is_active ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
                    }`}>
                      {c.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(c)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
