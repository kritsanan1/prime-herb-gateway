import { describe, it, expect, vi, beforeEach } from 'vitest';

const BASE = '/api/facebook';

async function postToFacebookAPI(message: string, image_url?: string) {
  const res = await fetch(`${BASE}/post`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, image_url }),
  });
  return res.json();
}

async function getInsights(period: string) {
  const res = await fetch(`${BASE}/insights?period=${period}`);
  return res.json();
}

async function getFeed() {
  const res = await fetch(`${BASE}/feed`);
  return res.json();
}

async function replyToComment(commentId: string, message: string) {
  const res = await fetch(`${BASE}/comments/${commentId}/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  return res.json();
}

describe('Facebook API helpers', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('postToFacebookAPI', () => {
    it('sends POST with message and image_url', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        json: async () => ({ success: true, id: 'fb123' }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await postToFacebookAPI('สวัสดีครับ', 'https://example.com/img.jpg');

      expect(mockFetch).toHaveBeenCalledWith(`${BASE}/post`, expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'สวัสดีครับ', image_url: 'https://example.com/img.jpg' }),
      }));
      expect(result.success).toBe(true);
      expect(result.id).toBe('fb123');
    });

    it('sends POST without image_url when omitted', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        json: async () => ({ success: true, id: 'fb456' }),
      });
      vi.stubGlobal('fetch', mockFetch);

      await postToFacebookAPI('โพสต์ทดสอบ');

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.message).toBe('โพสต์ทดสอบ');
      expect(callBody.image_url).toBeUndefined();
    });

    it('returns error from API on failure', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        json: async () => ({ success: false, error: 'Invalid token' }),
      }));

      const result = await postToFacebookAPI('test');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid token');
    });
  });

  describe('getInsights', () => {
    it('calls insights endpoint with period param', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        json: async () => ({ data: [] }),
      });
      vi.stubGlobal('fetch', mockFetch);

      await getInsights('week');

      expect(mockFetch).toHaveBeenCalledWith(`${BASE}/insights?period=week`);
    });

    it('supports all three period values', async () => {
      for (const period of ['day', 'week', 'days_28']) {
        const mockFetch = vi.fn().mockResolvedValue({ json: async () => ({ data: [] }) });
        vi.stubGlobal('fetch', mockFetch);
        await getInsights(period);
        expect(mockFetch).toHaveBeenCalledWith(`${BASE}/insights?period=${period}`);
        vi.restoreAllMocks();
      }
    });
  });

  describe('getFeed', () => {
    it('calls the feed endpoint', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        json: async () => ({ data: [{ id: 'p1', message: 'Hello', comments: { data: [] } }] }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await getFeed();
      expect(mockFetch).toHaveBeenCalledWith(`${BASE}/feed`);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('replyToComment', () => {
    it('sends reply with correct comment ID and message', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        json: async () => ({ success: true }),
      });
      vi.stubGlobal('fetch', mockFetch);

      await replyToComment('comment_abc', 'ขอบคุณครับ');

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE}/comments/comment_abc/reply`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ message: 'ขอบคุณครับ' }),
        }),
      );
    });
  });
});
