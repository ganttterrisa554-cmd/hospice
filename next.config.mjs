/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  async headers() {
    return [{
      source: '/api/:path*',
      headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }],
    }];
  },
};

export default nextConfig;
