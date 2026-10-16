import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT ?? process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_APP_VERSION,
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,

  // Tag every event with tenant info when available
  initialScope: {
    tags: {
      service: 'nados-server',
    },
  },

  // Ignore expected errors
  ignoreErrors: [
    'NEXT_REDIRECT',
    'NEXT_NOT_FOUND',
    'UNAUTHENTICATED',
    'NO_TENANT',
  ],
});
