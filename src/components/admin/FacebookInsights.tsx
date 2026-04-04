import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Users, Eye, Heart, TrendingUp, TrendingDown, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface InsightValue {
  end_time: string;
  value: number;
}
interface InsightMetric {
  name: string;
  period: string;
  values: InsightValue[];
  title: string;
}

function metricTotal(metrics: InsightMetric[], name: string): number {
  const m = metrics.find(x => x.name === name);
  if (!m) return 0;
  return m.values.reduce((s, v) => s + (v.value || 0), 0);
}

function metricSeries(metrics: InsightMetric[], name: string) {
  const m = metrics.find(x => x.name === name);
  if (!m) return [];
  return m.values.map(v => ({
    date: new Date(v.end_time).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
    value: v.value || 0,
  }));
}

export default function FacebookInsights() {
  const [period, setPeriod] = useState<'day' | 'week' | 'days_28'>('day');

  const { data: pageData } = useQuery({
    queryKey: ['/api/facebook/page'],
  });

  const { data: insightsData, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/facebook/insights', period],
    queryFn: () => fetch(`/api/facebook/insights?period=${period}`).then(r => r.json()),
  });

  const page = pageData as any;
  const metrics: InsightMetric[] = insightsData?.data || [];

  const impressions = metricTotal(metrics, 'page_impressions');
  const reach = metricTotal(metrics, 'page_impressions_unique');
  const engaged = metricTotal(metrics, 'page_engaged_users');
  const engagement = metricTotal(metrics, 'page_post_engagements');
  const fanAdds = metricTotal(metrics, 'page_fan_adds');
  const fanRemoves = metricTotal(metrics, 'page_fan_removes');

  const reachSeries = metricSeries(metrics, 'page_impressions_unique');
  const engagedSeries = metricSeries(metrics, 'page_engaged_users');

  const PERIOD_LABELS: Record<string, string> = {
    day: 'รายวัน',
    week: 'รายสัปดาห์',
    days_28: '28 วัน',
  };

  const stats = [
    { label: 'Impressions', value: impressions.toLocaleString(), icon: Eye, color: 'text-blue-400' },
    { label: 'Reach (Unique)', value: reach.toLocaleString(), icon: Users, color: 'text-primary' },
    { label: 'Engaged Users', value: engaged.toLocaleString(), icon: Heart, color: 'text-rose-400' },
    { label: 'Post Engagements', value: engagement.toLocaleString(), icon: TrendingUp, color: 'text-emerald-400' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
            <span className="text-2xl">📘</span> Facebook Insights
          </h2>
          {page && (
            <p className="text-xs text-muted-foreground font-thai mt-0.5">
              {page.name} · {Number(page.fan_count || 0).toLocaleString()} ผู้ติดตาม
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={v => setPeriod(v as any)}>
            <SelectTrigger className="w-36 bg-secondary border-border text-xs font-thai">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PERIOD_LABELS).map(([v, l]) => (
                <SelectItem key={v} value={v} className="font-thai text-xs">{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => refetch()} className="border-border">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
          <a
            href={`https://www.facebook.com/profile.php?id=${import.meta.env.VITE_FACEBOOK_PAGE_ID || '1090477170805304'}`}
            target="_blank" rel="noopener noreferrer"
          >
            <Button size="sm" variant="outline" className="border-border text-xs font-thai gap-1">
              <ExternalLink className="w-3.5 h-3.5" /> ดูเพจ
            </Button>
          </a>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm font-thai bg-destructive/10 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>ไม่สามารถโหลด Insights ได้: {(error as any).message || 'ตรวจสอบ Token และสิทธิ์ read_insights'}</span>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gradient-card border border-border rounded-xl p-5 animate-pulse">
              <div className="h-4 w-24 bg-secondary rounded mb-3" />
              <div className="h-8 w-16 bg-secondary rounded" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(s => (
              <div key={s.label} className="bg-gradient-card border border-border rounded-xl p-5">
                <s.icon className={`w-5 h-5 mb-2 ${s.color}`} />
                <p className="text-xs text-muted-foreground font-thai mb-1">{s.label}</p>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-card border border-border rounded-xl p-5 col-span-2 sm:col-span-1">
              <p className="text-sm font-semibold text-foreground mb-1 font-thai flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-primary" /> Reach รายวัน
              </p>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1 text-xs text-emerald-400 font-thai">
                  <TrendingUp className="w-3 h-3" />
                  +{fanAdds} ผู้ติดตามใหม่
                </div>
                {fanRemoves > 0 && (
                  <div className="flex items-center gap-1 text-xs text-destructive font-thai">
                    <TrendingDown className="w-3 h-3" />
                    -{fanRemoves} ยกเลิกติดตาม
                  </div>
                )}
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={reachSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#888' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#888' }} width={40} />
                  <Tooltip
                    contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }}
                    labelStyle={{ color: '#fff', fontSize: 11 }}
                    itemStyle={{ color: '#D4AF37', fontSize: 11 }}
                  />
                  <Bar dataKey="value" fill="#D4AF37" radius={[3, 3, 0, 0]} name="Reach" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gradient-card border border-border rounded-xl p-5 col-span-2 sm:col-span-1">
              <p className="text-sm font-semibold text-foreground mb-5 font-thai flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-400" /> Engaged Users รายวัน
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={engagedSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#888' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#888' }} width={40} />
                  <Tooltip
                    contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }}
                    labelStyle={{ color: '#fff', fontSize: 11 }}
                    itemStyle={{ color: '#f87171', fontSize: 11 }}
                  />
                  <Bar dataKey="value" fill="#f87171" radius={[3, 3, 0, 0]} name="Engaged" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
