import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Heart,
  MessageSquare,
  RefreshCw,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  FacebookAdminApiError,
  FacebookFeedComment,
  FacebookFeedData,
  FacebookFeedPost,
  FacebookMutationData,
  fetchFacebookAdmin,
  getFacebookAdminErrorMessage,
  postFacebookAdmin,
} from '@/lib/facebookAdmin';

function timeAgo(iso: string | null) {
  if (!iso) return 'Unknown time';

  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
}

function CommentsErrorState({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) {
  const message = getFacebookAdminErrorMessage(error);
  const details = error instanceof FacebookAdminApiError ? error.details : undefined;

  return (
    <Alert className="border-destructive/30 bg-destructive/10">
      <AlertCircle className="h-4 w-4 text-destructive" />
      <AlertDescription className="flex items-center justify-between gap-4 text-sm text-destructive">
        <div className="space-y-1">
          <p>{message}</p>
          {details ? (
            <p className="text-xs text-destructive/80">{JSON.stringify(details)}</p>
          ) : null}
        </div>
        <Button size="sm" variant="outline" onClick={onRetry} className="border-destructive/40">
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
}

function CommentsEmptyState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-xl border border-border bg-gradient-card p-8 text-center">
      <MessageSquare className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">No Facebook comments are available right now.</p>
      <Button size="sm" variant="outline" onClick={onRetry} className="mt-4 border-border">
        <RefreshCw className="mr-2 h-3.5 w-3.5" />
        Reload feed
      </Button>
    </div>
  );
}

function PostCommentsEmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-border/70 p-4 text-center text-sm text-muted-foreground">
      No comments on this post yet.
    </div>
  );
}

function PostCard({ post }: { post: FacebookFeedPost }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const comments = post.comments ?? [];

  const replyMutation = useMutation({
    mutationFn: (commentId: string) =>
      postFacebookAdmin<FacebookMutationData>(`/api/facebook/comments/${commentId}/reply`, {
        message: replies[commentId],
      }),
    onSuccess: (_, commentId) => {
      setReplies((current) => ({ ...current, [commentId]: '' }));
      setReplyingTo(null);
      toast.success('Comment reply sent.');
      queryClient.invalidateQueries({ queryKey: ['/api/facebook/feed'] });
    },
    onError: (error) => {
      toast.error(getFacebookAdminErrorMessage(error));
    },
  });

  const renderComment = (comment: FacebookFeedComment) => {
    const replyValue = replies[comment.id] ?? '';
    const isReplying = replyingTo === comment.id;

    return (
      <div key={comment.id} className="rounded-lg border border-border/70 bg-secondary/30 p-3">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">{comment.fromName ?? 'Facebook user'}</p>
              <span className="text-xs text-muted-foreground">{timeAgo(comment.createdTime)}</span>
            </div>
            <p className="mt-1 whitespace-pre-wrap text-sm text-foreground/90">{comment.message || '(No text)'}</p>
          </div>
          {comment.likeCount > 0 ? (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Heart className="h-3 w-3 text-rose-400" />
              {comment.likeCount}
            </div>
          ) : null}
        </div>

        {isReplying ? (
          <div className="space-y-2">
            <Textarea
              placeholder="Write a reply..."
              value={replyValue}
              onChange={(event) =>
                setReplies((current) => ({ ...current, [comment.id]: event.target.value }))
              }
              className="min-h-[72px] resize-none border-border bg-background text-sm"
              disabled={replyMutation.isPending}
            />
            <div className="flex items-center justify-end gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setReplyingTo(null)}
                disabled={replyMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => replyMutation.mutate(comment.id)}
                disabled={replyMutation.isPending || !replyValue.trim()}
              >
                {replyMutation.isPending ? (
                  <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="mr-2 h-3.5 w-3.5" />
                )}
                Reply
              </Button>
            </div>
          </div>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => setReplyingTo(comment.id)}>
            <MessageSquare className="mr-2 h-3.5 w-3.5" />
            Reply
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-gradient-card">
      <div className="flex gap-3 p-4">
        {post.fullPicture ? (
          <img src={post.fullPicture} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm text-foreground">
            {post.message || post.story || '(No message on this post)'}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>{timeAgo(post.createdTime)}</span>
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5 text-rose-400" />
              {post.likeCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5 text-primary" />
              {comments.length}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-start gap-2">
          {post.permalinkUrl ? (
            <a href={post.permalinkUrl} target="_blank" rel="noopener noreferrer">
              <Button size="icon" variant="ghost">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          ) : null}
          <Button size="icon" variant="ghost" onClick={() => setExpanded((current) => !current)}>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {expanded ? (
        <div className="space-y-3 border-t border-border/70 bg-background/40 p-4">
          {comments.length ? comments.map(renderComment) : <PostCommentsEmptyState />}
        </div>
      ) : null}
    </div>
  );
}

export default function FacebookComments() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/facebook/feed'],
    queryFn: () => fetchFacebookAdmin<FacebookFeedData>('/api/facebook/feed'),
  });

  const posts = data?.posts ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <span className="text-2xl">Facebook</span> Comments
          </h2>
          <p className="text-xs text-muted-foreground">Review recent post comments and reply from one place.</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => refetch()} className="border-border">
          <RefreshCw className="mr-2 h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {error ? <CommentsErrorState error={error} onRetry={() => refetch()} /> : null}

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="rounded-xl border border-border bg-gradient-card p-5 animate-pulse">
              <div className="mb-3 h-4 w-1/3 rounded bg-secondary" />
              <div className="h-4 w-3/4 rounded bg-secondary" />
            </div>
          ))}
        </div>
      ) : !error && posts.length === 0 ? (
        <CommentsEmptyState onRetry={() => refetch()} />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
