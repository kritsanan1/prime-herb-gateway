export interface PublicRuntimeConfig {
  apiBaseUrl: string;
  supabase: {
    url: string | null;
    projectRef: string | null;
    functionsBaseUrl: string | null;
  };
  facebook: {
    pageId: string | null;
  };
}

interface RuntimeConfigEnvelope {
  success: boolean;
  data?: PublicRuntimeConfig;
}

let runtimeConfigPromise: Promise<PublicRuntimeConfig> | null = null;

function trimToNull(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function inferProjectRef(url: string | null, explicitProjectRef: string | null) {
  if (url) {
    try {
      const { hostname } = new URL(url);
      const [projectRef] = hostname.split('.');
      if (projectRef) return projectRef;
    } catch {
      // Fall through to any explicit project ref.
    }
  }

  return explicitProjectRef;
}

function buildFallbackRuntimeConfig(): PublicRuntimeConfig {
  const supabaseUrl = trimToNull(import.meta.env.VITE_SUPABASE_URL);
  const projectRef = inferProjectRef(
    supabaseUrl,
    trimToNull(import.meta.env.VITE_SUPABASE_PROJECT_ID),
  );

  return {
    apiBaseUrl: '/api',
    supabase: {
      url: supabaseUrl,
      projectRef,
      functionsBaseUrl: supabaseUrl ? `${new URL(supabaseUrl).origin}/functions/v1` : projectRef
        ? `https://${projectRef}.supabase.co/functions/v1`
        : null,
    },
    facebook: {
      pageId: trimToNull(import.meta.env.VITE_FACEBOOK_PAGE_ID),
    },
  };
}

function isPublicRuntimeConfig(value: unknown): value is PublicRuntimeConfig {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.apiBaseUrl === 'string' &&
    !!candidate.supabase &&
    typeof candidate.supabase === 'object' &&
    !!candidate.facebook &&
    typeof candidate.facebook === 'object'
  );
}

async function fetchRuntimeConfig() {
  const fallback = buildFallbackRuntimeConfig();

  try {
    const response = await fetch('/api/config/public');
    if (!response.ok) {
      return fallback;
    }

    const payload = (await response.json()) as RuntimeConfigEnvelope;
    return payload.success && isPublicRuntimeConfig(payload.data) ? payload.data : fallback;
  } catch {
    return fallback;
  }
}

export async function getPublicRuntimeConfig() {
  runtimeConfigPromise ??= fetchRuntimeConfig();
  return runtimeConfigPromise;
}

export async function buildSupabaseFunctionUrl(functionName: string) {
  const config = await getPublicRuntimeConfig();
  const baseUrl = config.supabase.functionsBaseUrl;

  if (!baseUrl) {
    throw new Error(
      'Supabase function base URL is not configured. Set VITE_SUPABASE_URL or VITE_SUPABASE_PROJECT_ID.',
    );
  }

  return `${baseUrl.replace(/\/$/, '')}/${functionName}`;
}

export function resetRuntimeConfigCache() {
  runtimeConfigPromise = null;
}
