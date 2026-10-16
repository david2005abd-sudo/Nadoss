/** @type {import('next').NextConfig} */
const isExport = process.env.NEXT_EXPORT === 'true';

const nextConfig = isExport
  ? {
      output: 'export',
      basePath: '/Nadoss',
      trailingSlash: true,
      images: { unoptimized: true },
      poweredByHeader: false,
    }
  : {
      images: {
        remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co' }],
      },
      poweredByHeader: false,
    };

module.exports = nextConfig;
