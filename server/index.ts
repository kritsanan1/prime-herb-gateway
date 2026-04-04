import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Response } from 'express';
import { publicRuntimeConfig, serverConfig } from './config';
import {
  FACEBOOK_PAGE_ID,
  FacebookApiError,
  classifyFacebookError,
  emptyAdAccounts,
  emptyCampaigns,
  emptyConversations,
  emptyFeed,
  emptyInsights,
  emptyMessages,
  emptyPage,
  fbGet,
  fbPost,
  failureResponse,
  getFacebookInsights,
  normalizeFacebookAdAccounts,
  normalizeFacebookCampaigns,
  normalizeFacebookConversations,
  normalizeFacebookFeed,
  normalizeFacebookMessages,
  normalizeFacebookPage,
  successResponse,
  validationError,
} from './facebookAdmin';

const app = express();
const PORT = serverConfig.apiPort;

app.use(cors());
app.use(express.json());

function sendFacebookError(
  res: Response,
  error: unknown,
  emptyData: unknown,
  statusOverride?: number,
) {
  const adminError =
    error instanceof FacebookApiError
      ? error.adminError
      : classifyFacebookError(error instanceof Error ? error : new Error(String(error)));

  const statusMap = {
    validation_error: 400,
    missing_permission: 403,
    misconfigured_token: 500,
    unsupported_metric: 200,
    upstream_failure: 502,
  } as const;

  res
    .status(statusOverride ?? statusMap[adminError.code] ?? 500)
    .json(failureResponse(adminError, emptyData));
}

function requireNonEmptyString(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0;
}

app.get('/api/health', (_req, res) => {
  res.json(
    successResponse({
      status: 'ok',
      environment: serverConfig.nodeEnv,
      timestamp: new Date().toISOString(),
    }),
  );
});

app.get('/api/config/public', (_req, res) => {
  res.json(successResponse(publicRuntimeConfig));
});

app.post('/api/facebook/post', async (req, res) => {
  try {
    const { message, image_url } = req.body;
    if (!requireNonEmptyString(message) && !requireNonEmptyString(image_url)) {
      return sendFacebookError(
        res,
        validationError('A Facebook post requires a message or image URL.'),
        { id: null, message: 'Facebook post was not created.' },
      );
    }

    let data;
    if (requireNonEmptyString(image_url)) {
      data = await fbPost(`${FACEBOOK_PAGE_ID}/photos`, { caption: message, url: image_url });
    } else {
      data = await fbPost(`${FACEBOOK_PAGE_ID}/feed`, { message });
    }

    res.json(
      successResponse({
        id: data?.id || data?.post_id || null,
        message: 'Facebook post published successfully.',
      }),
    );
  } catch (error) {
    sendFacebookError(res, error, { id: null, message: 'Facebook post was not created.' });
  }
});

app.get('/api/facebook/page', async (_req, res) => {
  try {
    const data = await fbGet(FACEBOOK_PAGE_ID, {
      fields: 'id,name,fan_count,picture{url},followers_count,about',
    });
    res.json(successResponse(normalizeFacebookPage(data)));
  } catch (error) {
    sendFacebookError(res, error, emptyPage());
  }
});

app.get('/api/facebook/insights', async (req, res) => {
  try {
    const period = (req.query.period as string) || 'day';
    const response = await getFacebookInsights(period);
    if (!response.success) {
      return sendFacebookError(res, response.error, response.data ?? emptyInsights(period));
    }

    res.json(response);
  } catch (error) {
    sendFacebookError(res, error, emptyInsights((req.query.period as string) || 'day'));
  }
});

app.get('/api/facebook/feed', async (_req, res) => {
  try {
    const data = await fbGet(`${FACEBOOK_PAGE_ID}/feed`, {
      fields:
        'id,message,story,created_time,full_picture,permalink_url,likes.summary(true),comments{id,message,from,created_time,like_count}',
      limit: '20',
    });
    res.json(successResponse(normalizeFacebookFeed(data)));
  } catch (error) {
    sendFacebookError(res, error, emptyFeed());
  }
});

app.post('/api/facebook/comments/:id/reply', async (req, res) => {
  try {
    const { message } = req.body;
    if (!requireNonEmptyString(message)) {
      return sendFacebookError(
        res,
        validationError('A reply message is required before posting to a Facebook comment.'),
        { id: null, message: 'Facebook comment reply was not sent.' },
      );
    }

    const data = await fbPost(`${req.params.id}/comments`, { message });
    res.json(
      successResponse({
        id: data?.id || null,
        message: 'Facebook comment reply sent successfully.',
      }),
    );
  } catch (error) {
    sendFacebookError(res, error, { id: null, message: 'Facebook comment reply was not sent.' });
  }
});

app.get('/api/facebook/conversations', async (_req, res) => {
  try {
    const data = await fbGet(`${FACEBOOK_PAGE_ID}/conversations`, {
      fields: 'id,snippet,unread_count,updated_time,participants',
      limit: '30',
    });
    res.json(successResponse(normalizeFacebookConversations(data)));
  } catch (error) {
    sendFacebookError(res, error, emptyConversations());
  }
});

app.get('/api/facebook/conversations/:id/messages', async (req, res) => {
  try {
    const data = await fbGet(`${req.params.id}/messages`, {
      fields: 'id,message,from,created_time',
      limit: '50',
    });
    res.json(successResponse(normalizeFacebookMessages(req.params.id, data)));
  } catch (error) {
    sendFacebookError(res, error, emptyMessages(req.params.id));
  }
});

app.post('/api/facebook/conversations/:id/reply', async (req, res) => {
  try {
    const { message } = req.body;
    if (!requireNonEmptyString(message)) {
      return sendFacebookError(
        res,
        validationError('A reply message is required before sending a Facebook inbox response.'),
        { id: null, message: 'Facebook inbox reply was not sent.' },
      );
    }

    const data = await fbPost(`${req.params.id}/messages`, { message });
    res.json(
      successResponse({
        id: data?.message_id || data?.id || null,
        message: 'Facebook inbox reply sent successfully.',
      }),
    );
  } catch (error) {
    sendFacebookError(res, error, { id: null, message: 'Facebook inbox reply was not sent.' });
  }
});

app.get('/api/facebook/ads/accounts', async (_req, res) => {
  try {
    const data = await fbGet('me/adaccounts', {
      fields: 'id,name,account_status,currency,amount_spent,balance',
    });
    res.json(successResponse(normalizeFacebookAdAccounts(data)));
  } catch (error) {
    sendFacebookError(res, error, emptyAdAccounts());
  }
});

app.get('/api/facebook/ads/campaigns', async (req, res) => {
  const accountId = req.query.account_id as string;
  try {
    if (!requireNonEmptyString(accountId)) {
      return sendFacebookError(
        res,
        validationError('An account_id query parameter is required to load Facebook ad campaigns.'),
        emptyCampaigns(accountId || ''),
      );
    }

    const data = await fbGet(`${accountId}/campaigns`, {
      fields:
        'id,name,status,objective,daily_budget,lifetime_budget,start_time,stop_time,insights{impressions,clicks,spend,reach}',
      limit: '20',
    });
    res.json(successResponse(normalizeFacebookCampaigns(accountId, data)));
  } catch (error) {
    sendFacebookError(res, error, emptyCampaigns(accountId || ''));
  }
});

if (serverConfig.nodeEnv === 'production') {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, () => console.log(`API server ready on :${PORT}`));
