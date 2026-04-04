import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('facebook admin server helpers', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('maps permission failures to a readable missing_permission error', async () => {
    const { classifyFacebookError } = await import('../../server/facebookAdmin');

    expect(
      classifyFacebookError({
        httpStatus: 403,
        error: {
          code: 200,
          message: 'Permissions error',
        },
      }),
    ).toMatchObject({
      code: 'missing_permission',
      retryable: false,
    });
  });

  it('maps deprecated metrics to unsupported_metric', async () => {
    const { classifyFacebookError } = await import('../../server/facebookAdmin');

    expect(
      classifyFacebookError({
        httpStatus: 400,
        error: {
          code: 100,
          message: 'This endpoint is deprecated and does not support this metric',
        },
      }),
    ).toMatchObject({
      code: 'unsupported_metric',
      retryable: false,
    });
  });

  it('returns a misconfigured_token failure envelope when the server token is missing', async () => {
    vi.stubEnv('FACEBOOK_PAGE_ACCESS_TOKEN', '');
    vi.stubEnv('FACEBOOK_PAGE_ID', '123456789');

    const { getFacebookInsights } = await import('../../server/facebookAdmin');
    const response = await getFacebookInsights('day');

    expect(response.success).toBe(false);
    expect(response.error).toMatchObject({
      code: 'misconfigured_token',
      retryable: false,
    });
    expect(response.data.supportedMetrics).toEqual([
      'page_media_view',
      'page_post_engagements',
      'page_daily_follows_unique',
      'page_daily_unfollows_unique',
    ]);
  });
});
