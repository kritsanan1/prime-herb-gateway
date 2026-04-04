import { describe, it, expect, vi, beforeEach } from 'vitest';

interface ContentItem {
  id: string;
  platform: string;
  caption: string;
  hashtags: string;
  image_url: string | null;
  status: string;
}

async function postToFacebook(
  item: ContentItem,
  updateStatus: (id: string, status: string) => Promise<void>,
): Promise<{ success: boolean; error?: string }> {
  if (item.platform !== 'facebook') return { success: false, error: 'Not a Facebook item' };

  const message = [item.caption, item.hashtags].filter(Boolean).join('\n\n');
  const body: Record<string, string> = { message };
  if (item.image_url) body.image_url = item.image_url;

  const res = await fetch('/api/facebook/post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'โพสต์ไม่สำเร็จ');

  await updateStatus(item.id, 'published');
  return { success: true };
}

const facebookItem: ContentItem = {
  id: 'abc-123',
  platform: 'facebook',
  caption: 'สมุนไพรแท้ คุณภาพดี',
  hashtags: '#DrArtyPrimeHerb #สมุนไพร',
  image_url: 'https://cdn.example.com/herb.jpg',
  status: 'approved',
};

describe('postToFacebook logic', () => {
  let mockUpdateStatus: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.restoreAllMocks();
    mockUpdateStatus = vi.fn().mockResolvedValue(undefined);
  });

  it('joins caption and hashtags with double newline', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, id: '123456789' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await postToFacebook(facebookItem, mockUpdateStatus);

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.message).toBe('สมุนไพรแท้ คุณภาพดี\n\n#DrArtyPrimeHerb #สมุนไพร');
  });

  it('includes image_url when present', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await postToFacebook(facebookItem, mockUpdateStatus);

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.image_url).toBe('https://cdn.example.com/herb.jpg');
  });

  it('omits image_url when null', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await postToFacebook({ ...facebookItem, image_url: null }, mockUpdateStatus);

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.image_url).toBeUndefined();
  });

  it('calls updateStatus with "published" on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    }));

    await postToFacebook(facebookItem, mockUpdateStatus);

    expect(mockUpdateStatus).toHaveBeenCalledOnce();
    expect(mockUpdateStatus).toHaveBeenCalledWith('abc-123', 'published');
  });

  it('throws and does NOT update status when API returns error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ success: false, error: 'OAuthException: invalid token' }),
    }));

    await expect(postToFacebook(facebookItem, mockUpdateStatus)).rejects.toThrow('OAuthException: invalid token');
    expect(mockUpdateStatus).not.toHaveBeenCalled();
  });

  it('throws and does NOT update status when fetch rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    await expect(postToFacebook(facebookItem, mockUpdateStatus)).rejects.toThrow('Network error');
    expect(mockUpdateStatus).not.toHaveBeenCalled();
  });

  it('returns early without fetching for non-facebook platforms', async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);

    const result = await postToFacebook({ ...facebookItem, platform: 'instagram' }, mockUpdateStatus);

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.error).toBe('Not a Facebook item');
  });

  it('works with caption only (no hashtags)', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await postToFacebook({ ...facebookItem, hashtags: '' }, mockUpdateStatus);

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.message).toBe('สมุนไพรแท้ คุณภาพดี');
  });

  it('uses POST method and JSON content type', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await postToFacebook(facebookItem, mockUpdateStatus);

    expect(mockFetch.mock.calls[0][0]).toBe('/api/facebook/post');
    expect(mockFetch.mock.calls[0][1].method).toBe('POST');
    expect(mockFetch.mock.calls[0][1].headers['Content-Type']).toBe('application/json');
  });
});
