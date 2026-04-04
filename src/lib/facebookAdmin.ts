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

export interface FacebookConversationParticipant {
  id: string | null;
  name: string | null;
}

export interface FacebookConversation {
  id: string;
  snippet: string;
  unreadCount: number;
  updatedTime: string | null;
  customerName: string;
  participants: FacebookConversationParticipant[];
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

export interface FacebookCampaignMetrics {
  impressions: number;
  clicks: number;
  spend: number;
  reach: number;
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
  metrics: FacebookCampaignMetrics;
}

export interface FacebookCampaignsData {
  accountId: string;
  campaigns: FacebookCampaign[];
}

export interface FacebookMutationData {
  id: string | null;
  message: string;
}

export class FacebookAdminApiError extends Error {
  code: FacebookAdminErrorCode;
  retryable: boolean;
  details?: Record<string, unknown>;

  constructor(error: FacebookAdminError) {
    super(error.message);
    this.name = 'FacebookAdminApiError';
    this.code = error.code;
    this.retryable = error.retryable;
    this.details = error.details;
  }
}

const fallbackMessageByCode: Record<FacebookAdminErrorCode, string> = {
  validation_error: 'The Facebook request is missing required information.',
  missing_permission: 'The connected Facebook account is missing required permissions.',
  misconfigured_token: 'The Facebook page access token is missing or invalid.',
  unsupported_metric: 'Some Facebook metrics are unavailable right now.',
  upstream_failure: 'Facebook returned an unexpected error.',
};

function normalizeFacebookError(error: unknown): FacebookAdminError {
  if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
    const candidate = error as FacebookAdminError;
    return {
      code: candidate.code || 'upstream_failure',
      message: candidate.message || fallbackMessageByCode[candidate.code || 'upstream_failure'],
      retryable: candidate.retryable ?? candidate.code === 'upstream_failure',
      details: candidate.details,
    };
  }

  return {
    code: 'upstream_failure',
    message: error instanceof Error ? error.message : fallbackMessageByCode.upstream_failure,
    retryable: true,
  };
}

function extractErrorMessage(error: FacebookAdminError) {
  return error.message || fallbackMessageByCode[error.code] || fallbackMessageByCode.upstream_failure;
}

export function getFacebookAdminErrorMessage(error: unknown) {
  return extractErrorMessage(normalizeFacebookError(error));
}

function isFacebookAdminEnvelope<T>(
  payload: unknown,
): payload is FacebookAdminResponse<T> {
  return !!(
    payload &&
    typeof payload === 'object' &&
    'success' in payload &&
    'data' in payload &&
    'error' in payload
  );
}

async function requestFacebookAdminEnvelope<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<FacebookAdminResponse<T>> {
  const res = await fetch(input, init);
  const payload = (await res.json()) as unknown;

  if (!isFacebookAdminEnvelope<T>(payload)) {
    if (!res.ok) {
      return {
        success: false,
        data: undefined as T,
        error: {
          code: 'upstream_failure',
          message: `${res.status} ${res.statusText}`,
          retryable: true,
        },
      };
    }

    return {
      success: true,
      data: payload as T,
      error: null,
    };
  }

  return payload;
}

async function requestFacebookAdmin<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const envelope = await requestFacebookAdminEnvelope<T>(input, init);
  if (!envelope.success) {
    throw new FacebookAdminApiError(normalizeFacebookError(envelope.error));
  }

  return envelope.data;
}

export function fetchFacebookAdminResponse<T>(url: string) {
  return requestFacebookAdminEnvelope<T>(url);
}

export function fetchFacebookAdmin<T>(url: string) {
  return requestFacebookAdmin<T>(url);
}

export function postFacebookAdminResponse<T>(url: string, body: Record<string, unknown>) {
  return requestFacebookAdminEnvelope<T>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export function postFacebookAdmin<T>(url: string, body: Record<string, unknown>) {
  return requestFacebookAdmin<T>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
