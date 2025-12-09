/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  cookies: {
    secure: true, // 🔥 חובה בקודספייסס כדי לשמור עוגיות
  },
};

module.exports = nextConfig;
