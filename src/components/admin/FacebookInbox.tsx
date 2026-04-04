import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Send, RefreshCw, AlertCircle, ChevronLeft, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  FacebookAdminApiError,
  FacebookConversation,
  FacebookConversationsData,
  FacebookMessagesData,
  FacebookMutationData,
  fetchFacebookAdmin,
  getFacebookAdminErrorMessage,
  postFacebookAdmin,
} from '@/lib/facebookAdmin';

function timeAgo(iso: string | null) {
  if (!iso) return '-';

  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'เน€เธเธดเนเธเธชเนเธ';
  if (m < 60) return `${m} เธเธฒเธ—เธตเธ—เธตเนเนเธฅเนเธง`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} เธเธก.เธ—เธตเนเนเธฅเนเธง`;
  return `${Math.floor(h / 24)} เธงเธฑเธเธ—เธตเนเนเธฅเนเธง`;
}

function InboxErrorState({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const message = getFacebookAdminErrorMessage(error);
  const typedError = error instanceof FacebookAdminApiError ? error : null;
  const detailText = typedError?.details ? JSON.stringify(typedError.details) : null;

  return (
    <Alert className="border-destructive/30 bg-destructive/10">
      <AlertCircle className="h-4 w-4 text-destructive" />
      <AlertDescription className="flex items-center justify-between gap-4 text-sm font-thai text-destructive">
        <div className="space-y-1">
          <p>{message}</p>
          {detailText ? <p className="text-xs text-destructive/80">{detailText}</p> : null}
        </div>
        <Button size="sm" variant="outline" onClick={onRetry} className="border-destructive/40">
          เธฅเธญเธเนเธซเธกเน
        </Button>
      </AlertDescription>
    </Alert>
  );
}

function EmptyConversationState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <MessageCircle className="mb-3 h-10 w-10 text-muted-foreground" />
      <p className="text-sm text-muted-foreground font-thai">เนเธกเนเธกเธตเธเนเธญเธเธงเธฒเธกเนเธ Inbox</p>
      <Button size="sm" variant="outline" onClick={onRetry} className="mt-4 border-border">
        <RefreshCw className="mr-2 h-3.5 w-3.5" />
        เนเธซเธฅเธ”เธญเธตเธเธเธฃเธฑเนเธ
      </Button>
    </div>
  );
}

function ThreadEmptyState() {
  return (
    <div className="flex h-full items-center justify-center px-6 text-center">
      <div>
        <MessageCircle className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-thai text-muted-foreground">เนเธกเนเธกเธตเธเนเธญเธเธงเธฒเธกเนเธเธเธ—เธชเธเธ—เธเธฒเธเธตเน</p>
      </div>
    </div>
  );
}

export default function FacebookInbox() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<FacebookConversation | null>(null);
  const [reply, setReply] = useState('');

  const {
    data: conversationsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['/api/facebook/conversations'],
    queryFn: () => fetchFacebookAdmin<FacebookConversationsData>('/api/facebook/conversations'),
  });

  const {
    data: messagesData,
    isLoading: messagesLoading,
    error: messagesError,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: ['/api/facebook/conversations', selected?.id, 'messages'],
    queryFn: () => fetchFacebookAdmin<FacebookMessagesData>(`/api/facebook/conversations/${selected!.id}/messages`),
    enabled: !!selected,
  });

  const sendMutation = useMutation({
    mutationFn: () =>
      postFacebookAdmin<FacebookMutationData>(`/api/facebook/conversations/${selected!.id}/reply`, {
        message: reply,
      }),
    onSuccess: () => {
      setReply('');
      toast.success('เธชเนเธเธเนเธญเธเธงเธฒเธกเธชเธณเน€เธฃเนเธ');
      qc.invalidateQueries({ queryKey: ['/api/facebook/conversations'] });
      qc.invalidateQueries({ queryKey: ['/api/facebook/conversations', selected?.id, 'messages'] });
    },
    onError: (mutationError) => {
      toast.error(getFacebookAdminErrorMessage(mutationError));
    },
  });

  const conversations = conversationsData?.conversations ?? [];
  const pageId = conversationsData?.pageId ?? messagesData?.pageId ?? '';
  const messages = useMemo(
    () => [...(messagesData?.messages ?? [])].reverse(),
    [messagesData?.messages],
  );

  const selectedCustomerName =
    selected?.customerName ||
    selected?.participants.find((participant) => participant.id && participant.id !== pageId)?.name ||
    'เธเธนเนเนเธเน';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
          <span className="text-2xl">๐’ฌ</span> Facebook Inbox
        </h2>
        <Button size="sm" variant="outline" onClick={() => refetch()} className="border-border">
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
      </div>

      {error ? <InboxErrorState error={error} onRetry={() => refetch()} /> : null}

      <div className="bg-gradient-card border border-border rounded-xl overflow-hidden">
        {selected ? (
          <div className="flex h-[600px] flex-col">
            <div className="flex items-center gap-3 border-b border-border bg-secondary/50 px-4 py-3">
              <Button size="sm" variant="ghost" onClick={() => setSelected(null)} className="h-auto p-1">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold font-thai text-foreground">{selectedCustomerName}</span>
            </div>

            {messagesError ? (
              <div className="p-4">
                <InboxErrorState error={messagesError} onRetry={() => refetchMessages()} />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messagesLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                        <div className="h-10 w-48 animate-pulse rounded-xl bg-secondary" />
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <ThreadEmptyState />
                ) : (
                  messages.map((message) => {
                    const isPage = message.isFromPage || (!!pageId && message.fromId === pageId);
                    return (
                      <div key={message.id} className={`flex ${isPage ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[75%] rounded-xl px-3 py-2 text-sm font-thai ${
                            isPage ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
                          }`}
                        >
                          <p>{message.message || '(เนเธกเนเธกเธตเธเนเธญเธเธงเธฒเธก)'}</p>
                          <p
                            className={`mt-1 text-[10px] ${
                              isPage ? 'text-primary-foreground/60' : 'text-muted-foreground'
                            }`}
                          >
                            {timeAgo(message.createdTime)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            <div className="flex gap-2 border-t border-border p-3">
              <Textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="เธเธดเธกเธเนเธเนเธญเธเธงเธฒเธกเธ•เธญเธเธเธฅเธฑเธ..."
                rows={2}
                disabled={sendMutation.isPending || !!messagesError}
                className="flex-1 resize-none bg-secondary border-border font-thai text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (reply.trim() && !sendMutation.isPending) {
                      sendMutation.mutate();
                    }
                  }
                }}
              />
              <Button
                onClick={() => sendMutation.mutate()}
                disabled={!reply.trim() || sendMutation.isPending || !!messagesError}
                className="self-end bg-gradient-gold text-primary-foreground"
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
                  <div key={i} className="flex gap-3 animate-pulse px-4 py-4">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-secondary" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-32 rounded bg-secondary" />
                      <div className="h-3 w-48 rounded bg-secondary" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <EmptyConversationState onRetry={() => refetch()} />
            ) : (
              <div className="divide-y divide-border">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelected(conversation)}
                    className="w-full flex items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-secondary/50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex items-center justify-between gap-3">
                        <span className="truncate text-sm font-semibold text-foreground font-thai">
                          {conversation.customerName}
                        </span>
                        <span className="flex shrink-0 items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="w-3 h-3" /> {timeAgo(conversation.updatedTime)}
                        </span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground font-thai">{conversation.snippet}</p>
                    </div>
                    {conversation.unreadCount > 0 ? (
                      <span className="flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                        {conversation.unreadCount}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
