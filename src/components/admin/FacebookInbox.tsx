import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Send, RefreshCw, AlertCircle, ChevronLeft, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Participant {
  name: string;
  id: string;
}
interface Conversation {
  id: string;
  snippet: string;
  unread_count: number;
  updated_time: string;
  participants: { data: Participant[] };
}
interface Message {
  id: string;
  message: string;
  from: { name: string; id: string };
  created_time: string;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'เพิ่งส่ง';
  if (m < 60) return `${m} นาทีที่แล้ว`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ชม.ที่แล้ว`;
  return `${Math.floor(h / 24)} วันที่แล้ว`;
}

export default function FacebookInbox() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [reply, setReply] = useState('');

  const { data: convData, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/facebook/conversations'],
    queryFn: () => fetch('/api/facebook/conversations').then(r => r.json()),
  });

  const { data: msgData, isLoading: msgLoading } = useQuery({
    queryKey: ['/api/facebook/conversations', selected?.id, 'messages'],
    queryFn: () => fetch(`/api/facebook/conversations/${selected!.id}/messages`).then(r => r.json()),
    enabled: !!selected,
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/facebook/conversations/${selected!.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: reply }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'ส่งไม่สำเร็จ');
      return data;
    },
    onSuccess: () => {
      setReply('');
      toast.success('ส่งข้อความสำเร็จ');
      qc.invalidateQueries({ queryKey: ['/api/facebook/conversations', selected?.id, 'messages'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const conversations: Conversation[] = convData?.data || [];
  const messages: Message[] = msgData?.data ? [...msgData.data].reverse() : [];

  const PAGE_ID = '1090477170805304';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
          <span className="text-2xl">💬</span> Facebook Inbox
        </h2>
        <Button size="sm" variant="outline" onClick={() => refetch()} className="border-border">
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm font-thai bg-destructive/10 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          ไม่สามารถโหลด Inbox ได้ — ต้องขอสิทธิ์ pages_messaging จาก Meta App Review
        </div>
      )}

      <div className="bg-gradient-card border border-border rounded-xl overflow-hidden">
        {selected ? (
          <div className="flex flex-col h-[600px]">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-secondary/50">
              <Button size="sm" variant="ghost" onClick={() => setSelected(null)} className="p-1 h-auto">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold font-thai text-foreground">
                {selected.participants.data.find(p => p.id !== PAGE_ID)?.name || 'ผู้ใช้'}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {msgLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                      <div className="h-10 w-48 bg-secondary animate-pulse rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : messages.map(msg => {
                const isPage = msg.from?.id === PAGE_ID;
                return (
                  <div key={msg.id} className={`flex ${isPage ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-3 py-2 rounded-xl text-sm font-thai ${
                      isPage
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground'
                    }`}>
                      <p>{msg.message}</p>
                      <p className={`text-[10px] mt-1 ${isPage ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                        {timeAgo(msg.created_time)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 border-t border-border flex gap-2">
              <Textarea
                value={reply}
                onChange={e => setReply(e.target.value)}
                placeholder="พิมพ์ข้อความตอบกลับ..."
                rows={2}
                className="bg-secondary border-border font-thai text-sm resize-none flex-1"
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (reply.trim()) sendMutation.mutate();
                  }
                }}
              />
              <Button
                onClick={() => sendMutation.mutate()}
                disabled={!reply.trim() || sendMutation.isPending}
                className="bg-gradient-gold text-primary-foreground self-end"
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {isLoading ? (
              <div className="space-y-0 divide-y divide-border">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="px-4 py-4 flex gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-secondary shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-32 bg-secondary rounded" />
                      <div className="h-3 w-48 bg-secondary rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <MessageCircle className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground font-thai">ไม่มีข้อความใน Inbox</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {conversations.map(conv => {
                  const sender = conv.participants.data.find(p => p.id !== PAGE_ID);
                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelected(conv)}
                      className="w-full flex items-start gap-3 px-4 py-4 hover:bg-secondary/50 transition-colors text-left"
                    >
                      <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-sm font-semibold text-foreground font-thai truncate">
                            {sender?.name || 'ผู้ใช้'}
                          </span>
                          <span className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {timeAgo(conv.updated_time)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground font-thai truncate">{conv.snippet}</p>
                      </div>
                      {conv.unread_count > 0 && (
                        <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                          {conv.unread_count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
