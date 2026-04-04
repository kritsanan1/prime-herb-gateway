import './config';

const FB = 'https://graph.facebook.com/v21.0';

export const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID || '1090477170805304';
export const FACEBOOK_PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '';

export type FacebookAdminErrorCode =
  | 'validation_error'
  | 'missing_permission'
  | 'misconfigured_token'
  | 'unsupported_metric'
  | 'upstream_failure';

export interface FacebookAdminError {
  code: FacebookAdminErrorCode;
  message: string;
  retryable: boolean;
  details?: Record<string, unknown>;
}

export interface FacebookAdminResponse<T> {
  success: boolean;
  data: T;
  error: FacebookAdminError | null;
}

export interface FacebookPageData {
  pageId: string;
  pageUrl: string;
  isConfigured: boolean;
  name: string | null;
  about: string | null;
  pictureUrl: string | null;
  fanCount: number;
  followerCount: number;
}

export interface FacebookInsightsSummary {
  pageViews: number;
  postEngagements: number;
  newFollowers: number;
  unfollows: number;
}

export interface FacebookInsightsPoint extends FacebookInsightsSummary {
  date: string;
}

export interface FacebookInsightsData {
  period: string;
  summary: FacebookInsightsSummary;
  series: FacebookInsightsPoint[];
  supportedMetrics: string[];
  unavailableMetrics: string[];
  lastUpdatedAt: string | null;
}

export interface FacebookFeedComment {
  id: string;
  message: string;
  fromName: string | null;
  createdTime: string | null;
  likeCount: number;
}

export interface FacebookFeedPost {
  id: string;
  message: string;
  story: string | null;
  createdTime: string | null;
  fullPicture: string | null;
  permalinkUrl: string | null;
  likeCount: number;
  comments: FacebookFeedComment[];
}

export interface FacebookFeedData {
  posts: FacebookFeedPost[];
}

export interface FacebookConversation {
  id: string;
  snippet: string;
  unreadCount: number;
  updatedTime: string | null;
  customerName: string;
  participants: Array<{
    id: string | null;
    name: string | null;
  }>;
}

export interface FacebookConversationsData {
  pageId: string;
  conversations: FacebookConversation[];
}

export interface FacebookMessage {
  id: string;
  message: string;
  createdTime: string | null;
  fromId: string | null;
  fromName: string | null;
  isFromPage: boolean;
}

export interface FacebookMessagesData {
  conversationId: string;
  pageId: string;
  messages: FacebookMessage[];
}

export interface FacebookAdAccount {
  id: string;
  name: string;
  accountStatus: number | null;
  currency: string | null;
  amountSpent: string | null;
  balance: string | null;
}

export interface FacebookAdAccountsData {
  accounts: FacebookAdAccount[];
}

export interface FacebookCampaign {
  id: string;
  name: string;
  status: string | null;
  objective: string | null;
  dailyBudget: string | null;
  lifetimeBudget: string | null;
  startTime: string | null;
  stopTime: string | null;
  metrics: {
    impressions: number;
    clicks: number;
    spend: number;
    reach: number;
  };
}

export interface FacebookCampaignsData {
  accountId: string;
  campaigns: FacebookCampaign[];
}

export interface FacebookMutationData {
  id: string | null;
  message: string;
}

const SUPPORTED_INSIGHT_METRICS = [
  'page_media_view',
  'page_post_engagements',
  'page_daily_follows_unique',
  'page_daily_unfollows_unique',
] as const;

type SupportedInsightMetric = (typeof SUPPORTED_INSIGHT_METRICS)[number];

type FacebookGraphError = {
  message?: string;
  code?: number;
  type?: string;
  error_subcode?: number;
  fbtrace_id?: string;
};

type FacebookFetchFailure = {
  httpStatus: number;
  error: FacebookGraphError;
};

export class FacebookApiError extends Error {
  public readonly adminError: FacebookAdminError;
  public readonly httpStatus: number;

  constructor(adminError: FacebookAdminError, httpStatus = 500) {
    super(adminError.message);
    this.name = 'FacebookApiError';
    this.adminError = adminError;
    this.httpStatus = httpStatus;
  }
}

function pageUrlFromId(pageId = FACEBOOK_PAGE_ID) {
  return pageId ? `https://www.facebook.com/${pageId}` : '';
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function normalizeMessage(message: string | undefined) {
  return (message || '').trim();
}

function isMissingPermission(error: FacebookGraphError) {
  const message = normalizeMessage(error.message).toLowerCase();
  return (
    error.code === 10 ||
    error.code === 200 ||
    message.includes('permission') ||
    message.includes('permissions error') ||
    message.includes('requires') ||
    message.includes('not authorized')
  );
}

function isMisconfiguredToken(error: FacebookGraphError) {
  const message = normalizeMessage(error.message).toLowerCase();
  return (
    error.code === 190 ||
    message.includes('access token') ||
    message.includes('session has expired') ||
    message.includes('invalid oauth') ||
    message.includes('could not validate access token')
  );
}

function isUnsupportedMetric(error: FacebookGraphError) {
  const message = normalizeMessage(error.message).toLowerCase();
  return (
    message.includes('deprecated') ||
    message.includes('not supported') ||
    message.includes('unknown path components') ||
    message.includes('does not support this metric') ||
    message.includes('invalid metric')
  );
}

function defaultMessageForCode(code: FacebookAdminErrorCode) {
  switch (code) {
    case 'validation_error':
      return 'The request is missing required Facebook parameters.';
    case 'missing_permission':
      return 'The Facebook connection is missing required permissions for this admin action.';
    case 'misconfigured_token':
      return 'The Facebook page access token is missing, expired, or invalid.';
    case 'unsupported_metric':
      return 'Some Facebook metrics are unavailable for the current Graph API version or page setup.';
    default:
      return 'Facebook returned an unexpected error while loading admin data.';
  }
}

export function classifyFacebookError(
  failure: FacebookFetchFailure | Error | FacebookAdminError,
): FacebookAdminError {
  if ('code' in failure && 'retryable' in failure) {
    return failure;
  }

  if (failure instanceof FacebookApiError) {
    return failure.adminError;
  }

  if (!('error' in failure)) {
    return {
      code: 'upstream_failure',
      message: failure.message || defaultMessageForCode('upstream_failure'),
      retryable: true,
    };
  }

  const code: FacebookAdminErrorCode = isMisconfiguredToken(failure.error)
    ? 'misconfigured_token'
    : isMissingPermission(failure.error)
      ? 'missing_permission'
      : isUnsupportedMetric(failure.error)
        ? 'unsupported_metric'
        : 'upstream_failure';

  return {
    code,
    message: normalizeMessage(failure.error.message) || defaultMessageForCode(code),
    retryable: code === 'upstream_failure',
    details: {
      httpStatus: failure.httpStatus,
      fbCode: failure.error.code ?? null,
      fbSubcode: failure.error.error_subcode ?? null,
      fbType: failure.error.type ?? null,
    },
  };
}

function ensureConfigured() {
  if (FACEBOOK_PAGE_ACCESS_TOKEN) return;
  throw new FacebookApiError({
    code: 'misconfigured_token',
    message: 'FACEBOOK_PAGE_ACCESS_TOKEN is not configured on the server.',
    retryable: false,
  });
}

async function parseFacebookResponse(res: Response) {
  const text = await res.text();
  if (!text) return {};

  try {
    return JSON.parse(text) as Record<string, any>;
  } catch {
    return { raw: text };
  }
}

export async function fbGet(path: string, params: Record<string, string> = {}) {
  ensureConfigured();
  const url = new URL(`${FB}/${path}`);
  url.searchParams.set('access_token', FACEBOOK_PAGE_ACCESS_TOKEN);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString());
  const data = await parseFacebookResponse(res);
  if (!res.ok) {
    throw new FacebookApiError(
      classifyFacebookError({
        httpStatus: res.status,
        error: (data?.error || {}) as FacebookGraphError,
      }),
      res.status,
    );
  }

  return data;
}

export async function fbPost(path: string, body: Record<string, unknown>) {
  ensureConfigured();
  const res = await fetch(`${FB}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, access_token: FACEBOOK_PAGE_ACCESS_TOKEN }),
  });
  const data = await parseFacebookResponse(res);
  if (!res.ok) {
    throw new FacebookApiError(
      classifyFacebookError({
        httpStatus: res.status,
        error: (data?.error || {}) as FacebookGraphError,
      }),
      res.status,
    );
  }

  return data;
}

export function emptyPage(): FacebookPageData {
  return {
    pageId: FACEBOOK_PAGE_ID || '',
    pageUrl: pageUrlFromId(),
    isConfigured: Boolean(FACEBOOK_PAGE_ID && FACEBOOK_PAGE_ACCESS_TOKEN),
    name: null,
    about: null,
    pictureUrl: null,
    fanCount: 0,
    followerCount: 0,
  };
}

export function emptyInsights(period = 'day'): FacebookInsightsData {
  return {
    period,
    summary: {
      pageViews: 0,
      postEngagements: 0,
      newFollowers: 0,
      unfollows: 0,
    },
    series: [],
    supportedMetrics: [...SUPPORTED_INSIGHT_METRICS],
    unavailableMetrics: [],
    lastUpdatedAt: null,
  };
}

export function emptyFeed(): FacebookFeedData {
  return { posts: [] };
}

export function emptyConversations(): FacebookConversationsData {
  return {
    pageId: FACEBOOK_PAGE_ID || '',
    conversations: [],
  };
}

export function emptyMessages(conversationId: string): FacebookMessagesData {
  return {
    conversationId,
    pageId: FACEBOOK_PAGE_ID || '',
    messages: [],
  };
}

export function emptyAdAccounts(): FacebookAdAccountsData {
  return { accounts: [] };
}

export function emptyCampaigns(accountId: string): FacebookCampaignsData {
  return {
    accountId,
    campaigns: [],
  };
}

export function successResponse<T>(data: T): FacebookAdminResponse<T> {
  return {
    success: true,
    data,
    error: null,
  };
}

export function failureResponse<T>(
  error: FacebookAdminError,
  data: T,
): FacebookAdminResponse<T> {
  return {
    success: false,
    data,
    error,
  };
}

export function normalizeFacebookPage(raw: any): FacebookPageData {
  return {
    pageId: raw?.id || FACEBOOK_PAGE_ID || '',
    pageUrl: pageUrlFromId(raw?.id || FACEBOOK_PAGE_ID),
    isConfigured: Boolean(FACEBOOK_PAGE_ID && FACEBOOK_PAGE_ACCESS_TOKEN),
    name: raw?.name || null,
    about: raw?.about || null,
    pictureUrl: raw?.picture?.data?.url || raw?.picture?.url || null,
    fanCount: toNumber(raw?.fan_count),
    followerCount: toNumber(raw?.followers_count),
  };
}

export function normalizeFacebookFeed(raw: any): FacebookFeedData {
  const posts = Array.isArray(raw?.data) ? raw.data : [];
  return {
    posts: posts.map((post: any) => ({
      id: post?.id || '',
      message: post?.message || '',
      story: post?.story || null,
      createdTime: post?.created_time || null,
      fullPicture: post?.full_picture || null,
      permalinkUrl: post?.permalink_url || null,
      likeCount: toNumber(post?.likes?.summary?.total_count),
      comments: Array.isArray(post?.comments?.data)
        ? post.comments.data.map((comment: any) => ({
            id: comment?.id || '',
            message: comment?.message || '',
            fromName: comment?.from?.name || null,
            createdTime: comment?.created_time || null,
            likeCount: toNumber(comment?.like_count),
          }))
        : [],
    })),
  };
}

export function normalizeFacebookConversations(raw: any): FacebookConversationsData {
  const conversations = Array.isArray(raw?.data) ? raw.data : [];

  return {
    pageId: FACEBOOK_PAGE_ID || '',
    conversations: conversations.map((conversation: any) => {
      const participants = Array.isArray(conversation?.participants?.data)
        ? conversation.participants.data.map((participant: any) => ({
            id: participant?.id || null,
            name: participant?.name || null,
          }))
        : [];
      const customer =
        participants.find((participant) => participant.id && participant.id !== FACEBOOK_PAGE_ID) ||
        participants.find((participant) => participant.name) ||
        { name: 'Unknown user' };

      return {
        id: conversation?.id || '',
        snippet: conversation?.snippet || '',
        unreadCount: toNumber(conversation?.unread_count),
        updatedTime: conversation?.updated_time || null,
        customerName: customer.name || 'Unknown user',
        participants,
      };
    }),
  };
}

export function normalizeFacebookMessages(
  conversationId: string,
  raw: any,
): FacebookMessagesData {
  const messages = Array.isArray(raw?.data) ? raw.data : [];
  return {
    conversationId,
    pageId: FACEBOOK_PAGE_ID || '',
    messages: messages.map((message: any) => {
      const fromId = message?.from?.id || null;
      return {
        id: message?.id || '',
        message: message?.message || '',
        createdTime: message?.created_time || null,
        fromId,
        fromName: message?.from?.name || null,
        isFromPage: Boolean(fromId && fromId === FACEBOOK_PAGE_ID),
      };
    }),
  };
}

export function normalizeFacebookAdAccounts(raw: any): FacebookAdAccountsData {
  const accounts = Array.isArray(raw?.data) ? raw.data : [];
  return {
    accounts: accounts.map((account: any) => ({
      id: account?.id || '',
      name: account?.name || '',
      accountStatus: account?.account_status ?? null,
      currency: account?.currency || null,
      amountSpent: account?.amount_spent || null,
      balance: account?.balance || null,
    })),
  };
}

export function normalizeFacebookCampaigns(accountId: string, raw: any): FacebookCampaignsData {
  const campaigns = Array.isArray(raw?.data) ? raw.data : [];
  return {
    accountId,
    campaigns: campaigns.map((campaign: any) => {
      const insight = Array.isArray(campaign?.insights?.data) ? campaign.insights.data[0] : null;
      return {
        id: campaign?.id || '',
        name: campaign?.name || '',
        status: campaign?.status || null,
        objective: campaign?.objective || null,
        dailyBudget: campaign?.daily_budget || null,
        lifetimeBudget: campaign?.lifetime_budget || null,
        startTime: campaign?.start_time || null,
        stopTime: campaign?.stop_time || null,
        metrics: {
          impressions: toNumber(insight?.impressions),
          clicks: toNumber(insight?.clicks),
          spend: toNumber(insight?.spend),
          reach: toNumber(insight?.reach),
        },
      };
    }),
  };
}

function extractMetricPoints(metric: any) {
  return Array.isArray(metric?.values) ? metric.values : [];
}

function metricSummaryValue(metric: any) {
  const values = extractMetricPoints(metric);
  return values.reduce((total, item) => total + toNumber(item?.value), 0);
}

export async function getFacebookInsights(period = 'day'): Promise<FacebookAdminResponse<FacebookInsightsData>> {
  const empty = emptyInsights(period);
  const metricResults = await Promise.allSettled(
    SUPPORTED_INSIGHT_METRICS.map(async (metric) => ({
      metric,
      response: await fbGet(`${FACEBOOK_PAGE_ID}/insights`, { metric, period }),
    })),
  );

  const metricMap = new Map<SupportedInsightMetric, any>();
  const unavailableMetrics: string[] = [];
  const seriousErrors: FacebookAdminError[] = [];

  for (const result of metricResults) {
    if (result.status === 'fulfilled') {
      const metric = result.value.response?.data?.[0];
      if (metric) {
        metricMap.set(result.value.metric, metric);
      } else {
        unavailableMetrics.push(result.value.metric);
      }
      continue;
    }

    const error = classifyFacebookError(result.reason instanceof Error ? result.reason : new Error(String(result.reason)));
    if (error.code === 'unsupported_metric') {
      const metric = SUPPORTED_INSIGHT_METRICS.find((value) =>
        normalizeMessage(result.reason?.message).includes(value),
      );
      unavailableMetrics.push(metric || error.code);
    } else {
      seriousErrors.push(error);
    }
  }

  if (metricMap.size === 0 && seriousErrors.length > 0) {
    return failureResponse(seriousErrors[0], empty);
  }

  const byDate = new Map<string, FacebookInsightsPoint>();
  let lastUpdatedAt: string | null = null;

  const metricToField: Record<SupportedInsightMetric, keyof FacebookInsightsSummary> = {
    page_media_view: 'pageViews',
    page_post_engagements: 'postEngagements',
    page_daily_follows_unique: 'newFollowers',
    page_daily_unfollows_unique: 'unfollows',
  };

  for (const metric of SUPPORTED_INSIGHT_METRICS) {
    const responseMetric = metricMap.get(metric);
    if (!responseMetric) {
      if (!unavailableMetrics.includes(metric)) {
        unavailableMetrics.push(metric);
      }
      continue;
    }

    for (const point of extractMetricPoints(responseMetric)) {
      const date = point?.end_time || point?.value?.end_time || '';
      if (!date) continue;
      const existing =
        byDate.get(date) ||
        ({
          date,
          pageViews: 0,
          postEngagements: 0,
          newFollowers: 0,
          unfollows: 0,
        } satisfies FacebookInsightsPoint);
      existing[metricToField[metric]] = toNumber(point?.value);
      byDate.set(date, existing);
      lastUpdatedAt = !lastUpdatedAt || date > lastUpdatedAt ? date : lastUpdatedAt;
    }
  }

  const data: FacebookInsightsData = {
    period,
    summary: {
      pageViews: metricSummaryValue(metricMap.get('page_media_view')),
      postEngagements: metricSummaryValue(metricMap.get('page_post_engagements')),
      newFollowers: metricSummaryValue(metricMap.get('page_daily_follows_unique')),
      unfollows: metricSummaryValue(metricMap.get('page_daily_unfollows_unique')),
    },
    series: [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date)),
    supportedMetrics: [...SUPPORTED_INSIGHT_METRICS],
    unavailableMetrics,
    lastUpdatedAt,
  };

  return successResponse(data);
}

export function validationError(message: string, details?: Record<string, unknown>): FacebookAdminError {
  return {
    code: 'validation_error',
    message,
    retryable: false,
    details,
  };
}
