import path from 'path';

function loadServerEnv() {
  if (typeof process.loadEnvFile === 'function') {
    try {
      process.loadEnvFile();
      return;
    } catch {
      // Fall through to the explicit path attempt below.
    }
  }

  const envPath = path.resolve(process.cwd(), '.env');
  if (typeof process.loadEnvFile === 'function') {
    try {
      process.loadEnvFile(envPath);
    } catch {
      // The app can still run with environment variables provided by the shell.
    }
  }
}

loadServerEnv();

function trimToNull(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function parsePort(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function inferSupabaseProjectRef(
  explicitProjectRef: string | null,
  supabaseUrl: string | null,
) {
  if (supabaseUrl) {
    try {
      const { hostname } = new URL(supabaseUrl);
      const [projectRef] = hostname.split('.');
      if (projectRef) return projectRef;
    } catch {
      // Fall through to any explicit project ref.
    }
  }

  return explicitProjectRef;
}

function buildFunctionsBaseUrl(supabaseUrl: string | null, projectRef: string | null) {
  if (supabaseUrl) {
    try {
      const base = new URL(supabaseUrl);
      return `${base.origin}/functions/v1`;
    } catch {
      // Fall back to project ref below.
    }
  }

  return projectRef ? `https://${projectRef}.supabase.co/functions/v1` : null;
}

const supabaseUrl =
  trimToNull(process.env.VITE_SUPABASE_URL) ?? trimToNull(process.env.SUPABASE_URL);
const supabaseProjectRef = inferSupabaseProjectRef(
  trimToNull(process.env.VITE_SUPABASE_PROJECT_ID),
  supabaseUrl,
);

export const serverConfig = {
  apiPort: parsePort(process.env.API_PORT, 3001),
  nodeEnv: trimToNull(process.env.NODE_ENV) ?? 'development',
} as const;

export const publicRuntimeConfig = {
  apiBaseUrl: '/api',
  supabase: {
    url: supabaseUrl,
    projectRef: supabaseProjectRef,
    functionsBaseUrl: buildFunctionsBaseUrl(supabaseUrl, supabaseProjectRef),
  },
  facebook: {
    pageId: trimToNull(process.env.FACEBOOK_PAGE_ID),
  },
} as const;

export type PublicRuntimeConfig = typeof publicRuntimeConfig;
