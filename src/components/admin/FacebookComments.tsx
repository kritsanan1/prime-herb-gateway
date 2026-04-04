import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Heart, Send, RefreshCw, AlertCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Comment {
  id: string;
  message: string;
  from: { name: string; id: string };
  created_time: string;
  like_count?: number;
}
interface Post {
  id: string;
  message?: string;
  story?: string;
  created_time: string;
  full_picture?: string;
  permalink_url?: string;
  likes: { summary: { total_count: number } };
  comments?: { data: Comment[] };
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'เพิ่งโพสต์';
  if (m < 60) return `${m} นาทีที่แล้ว`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ชม.ที่แล้ว`;
  return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
}

function PostCard({ post }: { post: Post }) {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const comments = post.comments?.data || [];

  const replyMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const res = await fetch(`/api/facebook/comments/${commentId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replies[commentId] }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'ตอบกลับไม่สำเร็จ');
      return data;
    },
    onSuccess: (_, commentId) => {
      setReplies(r => ({ ...r, [commentId]: '' }));
      setReplyingTo(null);
      toast.success('ตอบกลับ Comment สำเร็จ');
      qc.invalidateQueries({ queryKey: ['/api/facebook/feed'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <div className="bg-gradient-card border border-border rounded-xl overflow-hidden">
      <div className="flex gap-3 p-4">
        {post.full_picture && (
          <img src={post.full_picture} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground font-thai line-clamp-2">
            {post.message || post.story || '(ไม่มีข้อความ)'}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[11px] text-muted-foreground">{timeAgo(post.created_time)}</span>
            <span className="flex items-center gap-1 text-[11px] text-rose-400">
              <Heart className="w-3 h-3" /> {post.likes?.summary?.total_count || 0}
            </span>
            <button
              onClick={() => setExpanded(e => !e)}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageSquare className="w-3 h-3" />
              {comments.length} ความคิดเห็น
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {post.permalink_url && (
              <a href={post.permalink_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors ml-auto">
                <ExternalLink className="w-3 h-3" /> ดูโพสต์
              </a>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border divide-y divide-border">
          {comments.length === 0 ? (
            <p className="text-xs text-muted-foreground font-thai px-4 py-3">ยังไม่มี Comment</p>
          ) : comments.map(c => (
            <div key={c.id} className="px-4 py-3 space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-[10px] font-bold text-primary">
                  {c.from?.name?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-foreground font-thai">{c.from?.name}</span>
                  <p className="text-xs text-muted-foreground font-thai mt-0.5">{c.message}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-muted-foreground">{timeAgo(c.created_time)}</span>
                    {(c.like_count ?? 0) > 0 && (
                      <span className="text-[10px] text-rose-400 flex items-center gap-0.5">
                        <Heart className="w-2.5 h-2.5" /> {c.like_count}
                      </span>
                    )}
                    <button
                      onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}
                      className="text-[10px] text-primary hover:underline font-thai"
                    >
                      ตอบกลับ
                    </button>
                  </div>
                </div>
              </div>

              {replyingTo === c.id && (
                <div className="flex gap-2 pl-9">
                  <Textarea
                    value={replies[c.id] || ''}
                    onChange={e => setReplies(r => ({ ...r, [c.id]: e.target.value }))}
                    placeholder={`ตอบกลับ ${c.from?.name}...`}
                    rows={2}
                    className="bg-secondary border-border text-xs font-thai resize-none flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={() => replyMutation.mutate(c.id)}
                    disabled={!replies[c.id]?.trim() || replyMutation.isPending}
                    className="bg-gradient-gold text-primary-foreground self-end"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FacebookComments() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/facebook/feed'],
    queryFn: () => fetch('/api/facebook/feed').then(r => r.json()),
  });

  const posts: Post[] = data?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
          <span className="text-2xl">📝</span> โพสต์ & Comments
        </h2>
        <Button size="sm" variant="outline" onClick={() => refetch()} className="border-border">
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm font-thai bg-destructive/10 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          ไม่สามารถโหลดโพสต์ได้: ตรวจสอบสิทธิ์ pages_read_engagement
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gradient-card border border-border rounded-xl p-4 animate-pulse">
              <div className="h-4 w-3/4 bg-secondary rounded mb-2" />
              <div className="h-3 w-1/2 bg-secondary rounded" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <MessageSquare className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground font-thai">ยังไม่มีโพสต์</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => <PostCard key={post.id} post={post} />)}
        </div>
      )}
    </div>
  );
}
