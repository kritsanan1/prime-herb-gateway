import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.API_PORT || 3001;
const PAGE_ID = process.env.FACEBOOK_PAGE_ID || '1090477170805304';
const TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '';
const FB = 'https://graph.facebook.com/v21.0';

app.use(cors());
app.use(express.json());

async function fbGet(path: string, params: Record<string, string> = {}) {
  const url = new URL(`${FB}/${path}`);
  url.searchParams.set('access_token', TOKEN);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  const data = await res.json() as any;
  if (!res.ok) throw new Error(data.error?.message || `Facebook API error: ${res.status}`);
  return data;
}

async function fbPost(path: string, body: Record<string, any>) {
  const res = await fetch(`${FB}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, access_token: TOKEN }),
  });
  const data = await res.json() as any;
  if (!res.ok) throw new Error(data.error?.message || `Facebook API error: ${res.status}`);
  return data;
}

// ── POST to page ────────────────────────────────────────────────────────────
app.post('/api/facebook/post', async (req, res) => {
  try {
    const { message, image_url } = req.body;
    let data;
    if (image_url) {
      data = await fbPost(`${PAGE_ID}/photos`, { caption: message, url: image_url });
    } else {
      data = await fbPost(`${PAGE_ID}/feed`, { message });
    }
    res.json({ success: true, ...data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── PAGE INFO ────────────────────────────────────────────────────────────────
app.get('/api/facebook/page', async (req, res) => {
  try {
    const data = await fbGet(PAGE_ID, {
      fields: 'name,fan_count,picture{url},followers_count,about',
    });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── INSIGHTS ─────────────────────────────────────────────────────────────────
app.get('/api/facebook/insights', async (req, res) => {
  try {
    const period = (req.query.period as string) || 'day';
    const metrics = [
      'page_impressions',
      'page_impressions_unique',
      'page_engaged_users',
      'page_post_engagements',
      'page_fan_adds',
      'page_fan_removes',
    ].join(',');
    const data = await fbGet(`${PAGE_ID}/insights`, { metric: metrics, period });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── FEED (posts + likes + comments) ─────────────────────────────────────────
app.get('/api/facebook/feed', async (req, res) => {
  try {
    const data = await fbGet(`${PAGE_ID}/feed`, {
      fields: 'id,message,story,created_time,full_picture,permalink_url,likes.summary(true),comments{id,message,from,created_time,like_count}',
      limit: '20',
    });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── REPLY TO COMMENT ─────────────────────────────────────────────────────────
app.post('/api/facebook/comments/:id/reply', async (req, res) => {
  try {
    const { message } = req.body;
    const data = await fbPost(`${req.params.id}/comments`, { message });
    res.json({ success: true, ...data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── CONVERSATIONS (inbox) ────────────────────────────────────────────────────
app.get('/api/facebook/conversations', async (req, res) => {
  try {
    const data = await fbGet(`${PAGE_ID}/conversations`, {
      fields: 'id,snippet,unread_count,updated_time,participants',
      limit: '30',
    });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── MESSAGES IN CONVERSATION ─────────────────────────────────────────────────
app.get('/api/facebook/conversations/:id/messages', async (req, res) => {
  try {
    const data = await fbGet(`${req.params.id}/messages`, {
      fields: 'id,message,from,created_time',
      limit: '50',
    });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── REPLY IN CONVERSATION ────────────────────────────────────────────────────
app.post('/api/facebook/conversations/:id/reply', async (req, res) => {
  try {
    const { message } = req.body;
    const data = await fbPost(`${req.params.id}/messages`, { message });
    res.json({ success: true, ...data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── ADS CAMPAIGNS ────────────────────────────────────────────────────────────
app.get('/api/facebook/ads/accounts', async (req, res) => {
  try {
    const data = await fbGet('me/adaccounts', {
      fields: 'id,name,account_status,currency,amount_spent,balance',
    });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/facebook/ads/campaigns', async (req, res) => {
  try {
    const accountId = req.query.account_id as string;
    if (!accountId) return res.status(400).json({ error: 'account_id required' });
    const data = await fbGet(`${accountId}/campaigns`, {
      fields: 'id,name,status,objective,daily_budget,lifetime_budget,start_time,stop_time,insights{impressions,clicks,spend,reach}',
      limit: '20',
    });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── SERVE STATIC IN PRODUCTION ───────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, () => console.log(`API server ready on :${PORT}`));
