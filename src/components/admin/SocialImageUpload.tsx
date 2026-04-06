import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface SocialImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export default function SocialImageUpload({ value, onChange }: SocialImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('กรุณาเลือกไฟล์รูปภาพ');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('ไฟล์ต้องไม่เกิน 5MB');
      return;
    }
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `social/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('social-images').upload(path, file);
    if (error) {
      toast.error('อัปโหลดไม่สำเร็จ: ' + error.message);
      setUploading(false);
      return;
    }
    const { data: pub } = supabase.storage.from('social-images').getPublicUrl(path);
    onChange(pub.publicUrl);
    toast.success('อัปโหลดรูปสำเร็จ');
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative rounded-lg overflow-hidden border border-border">
          <img src={value} alt="preview" className="w-full h-32 object-cover" />
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute top-1 right-1 h-6 w-6"
            onClick={() => onChange('')}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`flex flex-col items-center justify-center h-28 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
            dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          }`}
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          ) : (
            <>
              <ImageIcon className="w-6 h-6 text-muted-foreground mb-1" />
              <span className="text-[10px] text-muted-foreground font-thai">ลากรูปมาวาง หรือคลิกเลือก</span>
            </>
          )}
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); }} />
    </div>
  );
}
