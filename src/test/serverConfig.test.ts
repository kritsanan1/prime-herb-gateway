import { afterEach, describe, expect, it, vi } from 'vitest';

describe('server config bootstrap', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('derives public runtime config from env values', async () => {
    vi.stubEnv('API_PORT', '4010');
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('VITE_SUPABASE_URL', 'https://demo-ref.supabase.co');
    vi.stubEnv('FACEBOOK_PAGE_ID', 'page-123');

    const { publicRuntimeConfig, serverConfig } = await import('../../server/config');

    expect(serverConfig).toMatchObject({
      apiPort: 4010,
      nodeEnv: 'test',
    });
    expect(publicRuntimeConfig).toMatchObject({
      apiBaseUrl: '/api',
      supabase: {
        url: 'https://demo-ref.supabase.co',
        projectRef: 'demo-ref',
        functionsBaseUrl: 'https://demo-ref.supabase.co/functions/v1',
      },
      facebook: {
        pageId: 'page-123',
      },
    });
  });
});
