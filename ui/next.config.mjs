/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/skills-repo' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/skills-repo/' : '',
  productionBrowserSourceMaps: false,
}

export default nextConfig
