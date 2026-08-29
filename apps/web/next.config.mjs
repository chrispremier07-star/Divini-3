/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ['@divini/design-tokens'],
  // L'app doit répondre sur l'hôte de prévisualisation, pas seulement localhost.
  allowedDevOrigins: ['*.e2b.app']
};

export default nextConfig;
