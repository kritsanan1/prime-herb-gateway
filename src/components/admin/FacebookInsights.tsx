import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Users, Eye, Heart, TrendingUp, TrendingDown, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FacebookAdminApiError,
  FacebookInsightsData,
  FacebookPageData,
  fetchFacebookAdmin,
  getFacebookAdminErrorMessage,
} from '@/lib/facebookAdmin';

function InsightsErrorState({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const message = getFacebookAdminErrorMessage(error);
  const typedError = error instanceof FacebookAdminApiError ? error : null;

  return (
    <Alert className="border-destructive/30 bg-destructive/10">
      <AlertCircle className="h-4 w-4 text-destructive" />
      <AlertDescription className="flex items-center justify-between gap-4 text-sm font-thai text-destructive">
        <div className="space-y-1">
          <p>{message}</p>
          {typedError?.details && (
            <p className="text-xs text-destructive/80">
              {JSON.stringify(typedError.details)}
            </p>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={onRetry} className="border-destructive/40">
          ลองใหม่
        </Button>
      </AlertDescription>
    </Alert>
  );
}

function InsightsEmptyState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-xl border border-border bg-gradient-card p-8 text-center">
      <Eye className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
      <p className="text-sm font-thai text-muted-foreground">ยังไม่มีข้อมูล Insights สำหรับช่วงเวลานี้</p>
      <Button size="sm" variant="outline" onClick={onRetry} className="mt-4 border-border">
        <RefreshCw className="mr-2 h-3.5 w-3.5" />
        โหลดอีกครั้ง
      </Button>
    </div>
  );
}

export default function FacebookInsights() {
  const [period, setPeriod] = useState<'day' | 'week' | 'days_28'>('day');

  const {
    data: page,
  } = useQuery({
    queryKey: ['/api/facebook/page'],
    queryFn: () => fetchFacebookAdmin<FacebookPageData>('/api/facebook/page'),
  });

  const {
    data: insights,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['/api/facebook/insights', period],
    queryFn: () => fetchFacebookAdmin<FacebookInsightsData>(`/api/facebook/insights?period=${period}`),
  });

  const PERIOD_LABELS: Record<string, string> = {
    day: 'รายวัน',
    week: 'รายสัปดาห์',
    days_28: '28 วัน',
  };

  const stats = insights ? [
    { label: 'Page Views', value: insights.summary.pageViews.toLocaleString(), icon: Eye, color: 'text-blue-400' },
    { label: 'Post Engagements', value: insights.summary.postEngagements.toLocaleString(), icon: Heart, color: 'text-rose-400' },
    { label: 'New Followers', value: insights.summary.newFollowers.toLocaleString(), icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Unfollows', value: insights.summary.unfollows.toLocaleString(), icon: TrendingDown, color: 'text-amber-400' },
  ] : [];

  const hasSeriesData = (insights?.series ?? []).some(
    (point) => point.pageViews > 0 || point.postEngagements > 0 || point.newFollowers > 0 || point.unfollows > 0,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
            <span className="text-2xl">Facebook</span> Facebook Insights
          </h2>
          {page && (
            <p className="text-xs text-muted-foreground font-thai mt-0.5">
              {page.name} · {page.fanCount.toLocaleString()} ผู้ติดตาม
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={(value) => setPeriod(value as typeof period)}>
            <SelectTrigger className="w-36 bg-secondary border-border text-xs font-thai">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PERIOD_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value} className="font-thai text-xs">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => refetch()} className="border-border">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
          {page?.pageUrl && (
            <a href={page.pageUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="border-border text-xs font-thai gap-1">
                <ExternalLink className="w-3.5 h-3.5" /> ดูเพจ
              </Button>
            </a>
          )}
        </div>
      </div>

      {error && <InsightsErrorState error={error} onRetry={() => refetch()} />}

      {insights?.unavailableMetrics.length ? (
        <Alert className="border-amber-500/30 bg-amber-500/10">
          <AlertCircle className="h-4 w-4 text-amber-400" />
          <AlertDescription className="text-sm font-thai text-amber-200">
            Metrics บางตัวไม่พร้อมใช้งานใน Graph API เวอร์ชันนี้:
            {' '}
            {insights.unavailableMetrics.join(', ')}
          </AlertDescription>
        </Alert>
      ) : null}

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gradient-card border border-border rounded-xl p-5 animate-pulse">
              <div className="h-4 w-24 bg-secondary rounded mb-3" />
              <div className="h-8 w-16 bg-secondary rounded" />
            </div>
          ))}
        </div>
      ) : !error && insights && !hasSeriesData ? (
        <InsightsEmptyState onRetry={() => refetch()} />
      ) : !error && insights ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-gradient-card border border-border rounded-xl p-5">
                <stat.icon className={`w-5 h-5 mb-2 ${stat.color}`} />
                <p className="text-xs text-muted-foreground font-thai mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-card border border-border rounded-xl p-5 col-span-2 sm:col-span-1">
              <p className="text-sm font-semibold text-foreground mb-1 font-thai flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary" /> Page Views รายวัน
              </p>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1 text-xs text-emerald-400 font-thai">
                  <TrendingUp className="w-3 h-3" />
                  +{insights.summary.newFollowers.toLocaleString()} ผู้ติดตามใหม่
                </div>
                {insights.summary.unfollows > 0 && (
                  <div className="flex items-center gap-1 text-xs text-destructive font-thai">
                    <TrendingDown className="w-3 h-3" />
                    -{insights.summary.unfollows.toLocaleString()} ยกเลิกติดตาม
                  </div>
                )}
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={insights.series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#888' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#888' }} width={40} />
                  <Tooltip
                    contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }}
                    labelStyle={{ color: '#fff', fontSize: 11 }}
                    itemStyle={{ color: '#D4AF37', fontSize: 11 }}
                  />
                  <Bar dataKey="pageViews" fill="#D4AF37" radius={[3, 3, 0, 0]} name="Page Views" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gradient-card border border-border rounded-xl p-5 col-span-2 sm:col-span-1">
              <p className="text-sm font-semibold text-foreground mb-5 font-thai flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-400" /> Post Engagements รายวัน
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={insights.series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#888' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#888' }} width={40} />
                  <Tooltip
                    contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }}
                    labelStyle={{ color: '#fff', fontSize: 11 }}
                    itemStyle={{ color: '#f87171', fontSize: 11 }}
                  />
                  <Bar dataKey="postEngagements" fill="#f87171" radius={[3, 3, 0, 0]} name="Post Engagements" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
