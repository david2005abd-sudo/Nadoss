/** @type {import('next').NextConfig} */
const isExport = process.env.NEXT_EXPORT === 'true';

// Repository name on GitHub Pages (https://<user>.github.io/<repo>/).
const BASE_PATH = process.env.NEXT_PUBLIC_REPO_NAME ?? 'Nadoss';

const nextConfig = isExport
  ? {
      output: 'export',
      basePath: `/${BASE_PATH}`,
      trailingSlash: true,
      images: { unoptimized: true },
      poweredByHeader: false,
      // Inlined into the client bundle so raw window.location navigations
      // resolve under the same basePath that next/link uses.
      env: {
        NEXT_PUBLIC_BASE_PATH: `/${BASE_PATH}`,
      },
    }
  : {
      images: {
        remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co' }],
      },
      poweredByHeader: false,
      env: {
        NEXT_PUBLIC_BASE_PATH: '',
      },
    };

module.exports = nextConfig;
