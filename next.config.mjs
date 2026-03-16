/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  // Allow HTTP access without security restrictions
  experimental: {
    // Disable HTTPS redirect
    allowedOrigins: ['*'],
  },
  // Disable security headers for HTTP access
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
