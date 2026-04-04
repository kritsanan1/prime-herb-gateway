import { afterEach, describe, expect, it, vi } from 'vitest';

describe('runtime config', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('uses the backend-owned public config when available', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            apiBaseUrl: '/api',
            supabase: {
              url: 'https://backend.supabase.co',
              projectRef: 'backend',
              functionsBaseUrl: 'https://backend.supabase.co/functions/v1',
            },
            facebook: {
              pageId: '42',
            },
          },
        }),
      }),
    );

    const { buildSupabaseFunctionUrl, getPublicRuntimeConfig, resetRuntimeConfigCache } = await import(
      '@/lib/runtimeConfig'
    );

    resetRuntimeConfigCache();

    await expect(getPublicRuntimeConfig()).resolves.toMatchObject({
      supabase: {
        projectRef: 'backend',
      },
      facebook: {
        pageId: '42',
      },
    });
    await expect(buildSupabaseFunctionUrl('create-checkout')).resolves.toBe(
      'https://backend.supabase.co/functions/v1/create-checkout',
    );
  });

  it('falls back to vite env values when the backend config endpoint is unavailable', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://fallback.supabase.co');
    vi.stubEnv('VITE_SUPABASE_PROJECT_ID', 'fallback');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    const { buildSupabaseFunctionUrl, getPublicRuntimeConfig, resetRuntimeConfigCache } = await import(
      '@/lib/runtimeConfig'
    );

    resetRuntimeConfigCache();

    await expect(getPublicRuntimeConfig()).resolves.toMatchObject({
      supabase: {
        projectRef: 'fallback',
        functionsBaseUrl: 'https://fallback.supabase.co/functions/v1',
      },
    });
    await expect(buildSupabaseFunctionUrl('line-notify')).resolves.toBe(
      'https://fallback.supabase.co/functions/v1/line-notify',
    );
  });
});
