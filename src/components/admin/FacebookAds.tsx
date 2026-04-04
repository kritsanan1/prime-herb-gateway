import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Eye,
  MousePointer,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FacebookAdAccount,
  FacebookAdAccountsData,
  FacebookAdminApiError,
  FacebookCampaign,
  FacebookCampaignsData,
  fetchFacebookAdmin,
  getFacebookAdminErrorMessage,
} from '@/lib/facebookAdmin';

function formatCurrency(amount: string | null, currency: string | null) {
  if (!amount) return '-';

  const value = Number(amount);
  if (Number.isNaN(value)) return amount;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatMetricValue(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

function AdsErrorState({
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
          {details ? <p className="text-xs text-destructive/80">{JSON.stringify(details)}</p> : null}
        </div>
        <Button size="sm" variant="outline" onClick={onRetry} className="border-destructive/40">
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
}

function EmptyAccountsState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-xl border border-border bg-gradient-card p-8 text-center">
      <DollarSign className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">No Facebook ad accounts are available for this page.</p>
      <Button size="sm" variant="outline" onClick={onRetry} className="mt-4 border-border">
        <RefreshCw className="mr-2 h-3.5 w-3.5" />
        Reload accounts
      </Button>
    </div>
  );
}

function EmptyCampaignsState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-background/40 p-6 text-center">
      <TrendingUp className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">This ad account does not have campaigns to show yet.</p>
      <Button size="sm" variant="outline" onClick={onRetry} className="mt-4 border-border">
        <RefreshCw className="mr-2 h-3.5 w-3.5" />
        Refresh campaigns
      </Button>
    </div>
  );
}

function statusBadgeVariant(status: string | null) {
  switch (status) {
    case 'ACTIVE':
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    case 'PAUSED':
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    case 'ARCHIVED':
      return 'bg-muted text-muted-foreground border-border';
    default:
      return 'bg-secondary text-foreground border-border';
  }
}

function CampaignCard({ campaign }: { campaign: FacebookCampaign }) {
  const [expanded, setExpanded] = useState(false);

  const budget = campaign.dailyBudget || campaign.lifetimeBudget;

  return (
    <div className="rounded-xl border border-border bg-gradient-card">
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-foreground">{campaign.name}</h3>
            <Badge className={statusBadgeVariant(campaign.status)}>{campaign.status || 'UNKNOWN'}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground sm:grid-cols-4">
            <div className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-blue-400" />
              {formatMetricValue(campaign.metrics.impressions)}
            </div>
            <div className="flex items-center gap-1.5">
              <MousePointer className="h-3.5 w-3.5 text-primary" />
              {formatMetricValue(campaign.metrics.clicks)}
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              {formatMetricValue(campaign.metrics.reach)}
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-amber-400" />
              {campaign.metrics.spend.toFixed(2)}
            </div>
          </div>
        </div>

        <Button size="icon" variant="ghost" onClick={() => setExpanded((current) => !current)}>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {expanded ? (
        <div className="grid gap-3 border-t border-border/70 bg-background/40 p-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Objective</p>
            <p className="mt-1 text-foreground">{campaign.objective || '-'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Budget</p>
            <p className="mt-1 text-foreground">{budget || '-'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Start</p>
            <p className="mt-1 text-foreground">{campaign.startTime || '-'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">End</p>
            <p className="mt-1 text-foreground">{campaign.stopTime || '-'}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function FacebookAds() {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const {
    data: accountsData,
    isLoading: isAccountsLoading,
    error: accountsError,
    refetch: refetchAccounts,
  } = useQuery({
    queryKey: ['/api/facebook/ads/accounts'],
    queryFn: () => fetchFacebookAdmin<FacebookAdAccountsData>('/api/facebook/ads/accounts'),
    select: (data) => {
      if (!selectedAccount && data.accounts.length > 0) {
        setSelectedAccount(data.accounts[0].id);
      }
      return data;
    },
  });

  const {
    data: campaignsData,
    isLoading: isCampaignsLoading,
    error: campaignsError,
    refetch: refetchCampaigns,
  } = useQuery({
    queryKey: ['/api/facebook/ads/campaigns', selectedAccount],
    queryFn: () =>
      fetchFacebookAdmin<FacebookCampaignsData>(
        `/api/facebook/ads/campaigns?account_id=${encodeURIComponent(selectedAccount!)}`,
      ),
    enabled: !!selectedAccount,
  });

  const accounts = accountsData?.accounts ?? [];
  const campaigns = campaignsData?.campaigns ?? [];
  const selectedAccountData =
    accounts.find((account) => account.id === selectedAccount) ?? accounts[0] ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <span className="text-2xl">Facebook</span> Ads
          </h2>
          <p className="text-xs text-muted-foreground">
            Monitor connected ad accounts and campaign delivery from the admin panel.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => refetchAccounts()} className="border-border">
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {accountsError ? <AdsErrorState error={accountsError} onRetry={() => refetchAccounts()} /> : null}

      {isAccountsLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, index) => (
            <div key={index} className="rounded-xl border border-border bg-gradient-card p-5 animate-pulse">
              <div className="mb-3 h-4 w-1/3 rounded bg-secondary" />
              <div className="h-4 w-1/2 rounded bg-secondary" />
            </div>
          ))}
        </div>
      ) : !accountsError && accounts.length === 0 ? (
        <EmptyAccountsState onRetry={() => refetchAccounts()} />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {accounts.map((account: FacebookAdAccount) => {
              const isSelected = account.id === selectedAccountData?.id;

              return (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => setSelectedAccount(account.id)}
                  className={`rounded-xl border p-5 text-left transition ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-[0_0_0_1px_rgba(212,175,55,0.2)]'
                      : 'border-border bg-gradient-card hover:border-primary/40'
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{account.name}</p>
                      <p className="text-xs text-muted-foreground">{account.id}</p>
                    </div>
                    <Badge className={statusBadgeVariant(String(account.accountStatus ?? 'UNKNOWN'))}>
                      {account.accountStatus ?? 'UNKNOWN'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Spent</p>
                      <p className="mt-1 text-foreground">
                        {formatCurrency(account.amountSpent, account.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Balance</p>
                      <p className="mt-1 text-foreground">
                        {formatCurrency(account.balance, account.currency)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {campaignsError ? (
            <AdsErrorState error={campaignsError} onRetry={() => refetchCampaigns()} />
          ) : isCampaignsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="rounded-xl border border-border bg-gradient-card p-5 animate-pulse">
                  <div className="mb-3 h-4 w-1/2 rounded bg-secondary" />
                  <div className="h-4 w-3/4 rounded bg-secondary" />
                </div>
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <EmptyCampaignsState onRetry={() => refetchCampaigns()} />
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
