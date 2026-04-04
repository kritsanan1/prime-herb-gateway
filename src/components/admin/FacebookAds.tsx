import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, TrendingUp, Eye, MousePointer, RefreshCw, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AdAccount {
  id: string;
  name: string;
  account_status: number;
  currency: string;
  amount_spent: string;
  balance: string;
}
interface Campaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  daily_budget?: string;
  lifetime_budget?: string;
  start_time?: string;
  stop_time?: string;
  insights?: { data: Array<{ impressions: string; clicks: string; spend: string; reach: string }> };
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'กำลังทำงาน', color: 'bg-emerald-500/20 text-emerald-400' },
  PAUSED: { label: 'หยุดชั่วคราว', color: 'bg-amber-500/20 text-amber-400' },
  DELETED: { label: 'ลบแล้ว', color: 'bg-destructive/20 text-destructive' },
  ARCHIVED: { label: 'เก็บถาวร', color: 'bg-secondary text-muted-foreground' },
};

function fmt(n: string | undefined) {
  return n ? Number(n).toLocaleString() : '0';
}

export default function FacebookAds() {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: accountsData, isLoading: accountsLoading, error: accountsError, refetch } = useQuery({
    queryKey: ['/api/facebook/ads/accounts'],
    queryFn: () => fetch('/api/facebook/ads/accounts').then(r => r.json()),
  });

  const { data: campaignsData, isLoading: campaignsLoading } = useQuery({
    queryKey: ['/api/facebook/ads/campaigns', selectedAccount],
    queryFn: () => fetch(`/api/facebook/ads/campaigns?account_id=${selectedAccount}`).then(r => r.json()),
    enabled: !!selectedAccount,
  });

  const accounts: AdAccount[] = accountsData?.data || [];
  const campaigns: Campaign[] = campaignsData?.data || [];

  const activeAccount = accounts.find(a => a.id === selectedAccount);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
          <span className="text-2xl">📣</span> Facebook Ads
        </h2>
        <Button size="sm" variant="outline" onClick={() => refetch()} className="border-border">
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
      </div>

      {accountsError && (
        <div className="flex items-start gap-2 text-destructive text-sm font-thai bg-destructive/10 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">ไม่สามารถโหลดข้อมูล Ads ได้</p>
            <p className="text-xs mt-1 text-destructive/80">ต้องขอสิทธิ์ ads_read จาก Meta และให้แน่ใจว่า Token มีสิทธิ์ Business Admin</p>
          </div>
        </div>
      )}

      {accountsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-gradient-card border border-border rounded-xl p-5 animate-pulse">
              <div className="h-4 w-32 bg-secondary rounded mb-3" />
              <div className="h-6 w-24 bg-secondary rounded" />
            </div>
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <div className="bg-gradient-card border border-border rounded-xl p-8 text-center">
          <DollarSign className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-thai">ไม่พบ Ad Account</p>
          <p className="text-xs text-muted-foreground/60 font-thai mt-1">ตรวจสอบว่า Token มีสิทธิ์ ads_read</p>
        </div>
      ) : (
        <>
          <div>
            <p className="text-xs text-muted-foreground font-thai mb-2">เลือก Ad Account</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {accounts.map(acc => (
                <button
                  key={acc.id}
                  onClick={() => setSelectedAccount(acc.id)}
                  className={`bg-gradient-card border rounded-xl p-4 text-left transition-all ${
                    selectedAccount === acc.id ? 'border-primary' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <p className="text-sm font-semibold text-foreground font-thai">{acc.name}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-muted-foreground font-thai">
                      ยอดใช้: <span className="text-foreground font-medium">{fmt(acc.amount_spent)} {acc.currency}</span>
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-thai ${acc.account_status === 1 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-secondary text-muted-foreground'}`}>
                      {acc.account_status === 1 ? 'เปิดใช้งาน' : 'ปิด'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedAccount && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground font-thai">
                  แคมเปญ — {activeAccount?.name}
                </p>
                {campaignsLoading && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
              </div>

              {campaigns.length === 0 && !campaignsLoading ? (
                <p className="text-sm text-muted-foreground font-thai">ไม่มีแคมเปญ</p>
              ) : (
                <div className="space-y-3">
                  {campaigns.map(c => {
                    const ins = c.insights?.data?.[0];
                    const statusInfo = STATUS_MAP[c.status] || { label: c.status, color: 'bg-secondary text-muted-foreground' };
                    return (
                      <div key={c.id} className="bg-gradient-card border border-border rounded-xl overflow-hidden">
                        <button
                          className="w-full flex items-center justify-between p-4 text-left"
                          onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-thai shrink-0 ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                            <span className="text-sm font-thai text-foreground truncate">{c.name}</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            {ins && (
                              <span className="text-xs font-semibold text-primary">
                                ฿{Number(ins.spend || 0).toLocaleString()}
                              </span>
                            )}
                            {expanded === c.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                          </div>
                        </button>

                        {expanded === c.id && (
                          <div className="border-t border-border px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                              <p className="text-[10px] text-muted-foreground font-thai mb-0.5 flex items-center gap-1"><Eye className="w-3 h-3" /> Reach</p>
                              <p className="text-lg font-bold text-foreground">{fmt(ins?.reach)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground font-thai mb-0.5 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Impressions</p>
                              <p className="text-lg font-bold text-foreground">{fmt(ins?.impressions)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground font-thai mb-0.5 flex items-center gap-1"><MousePointer className="w-3 h-3" /> Clicks</p>
                              <p className="text-lg font-bold text-foreground">{fmt(ins?.clicks)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground font-thai mb-0.5 flex items-center gap-1"><DollarSign className="w-3 h-3" /> Spend</p>
                              <p className="text-lg font-bold text-primary">฿{fmt(ins?.spend)}</p>
                            </div>
                            <div className="col-span-2 sm:col-span-4">
                              <p className="text-[10px] text-muted-foreground font-thai">
                                วัตถุประสงค์: <span className="text-foreground">{c.objective}</span>
                                {c.daily_budget && <> · งบรายวัน: <span className="text-foreground">฿{fmt(c.daily_budget)}</span></>}
                                {c.lifetime_budget && <> · งบทั้งหมด: <span className="text-foreground">฿{fmt(c.lifetime_budget)}</span></>}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
