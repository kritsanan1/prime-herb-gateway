import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ArticleImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export default function ArticleImageUpload({ value, onChange }: ArticleImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>(value && !value.includes('article-images') ? 'url' : 'upload');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('ขนาดไฟล์ต้องไม่เกิน 5MB');
      return;
    }

    setUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage
      .from('article-images')
      .upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (error) {
      toast.error('อัปโหลดล้มเหลว: ' + error.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('article-images')
      .getPublicUrl(fileName);

    onChange(urlData.publicUrl);
    toast.success('อัปโหลดรูปภาพสำเร็จ');
    setUploading(false);
  };

  const handleRemove = () => {
    onChange('');
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="font-thai text-xs">รูปภาพบทความ</Label>
        <button
          type="button"
          onClick={() => setMode(m => m === 'upload' ? 'url' : 'upload')}
          className="text-[10px] text-primary underline font-thai"
        >
          {mode === 'upload' ? 'ใส่ URL แทน' : 'อัปโหลดไฟล์แทน'}
        </button>
      </div>

      {mode === 'upload' ? (
        <div className="space-y-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full border-dashed border-border font-thai text-xs h-10"
          >
            {uploading ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-1" /> กำลังอัปโหลด...</>
            ) : (
              <><Upload className="w-4 h-4 mr-1" /> เลือกรูปภาพ (สูงสุด 5MB)</>
            )}
          </Button>
        </div>
      ) : (
        <Input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="bg-secondary border-border font-thai text-xs"
        />
      )}

      {value && (
        <div className="relative w-full h-32 rounded-md overflow-hidden border border-border bg-secondary">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-1 right-1 bg-background/80 rounded-full p-1 hover:bg-background"
          >
            <X className="w-3.5 h-3.5 text-destructive" />
          </button>
        </div>
      )}

      {!value && mode === 'upload' && (
        <div className="flex items-center justify-center h-20 rounded-md border border-dashed border-border bg-secondary/50">
          <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
        </div>
      )}
    </div>
  );
}
