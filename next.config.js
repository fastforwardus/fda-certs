/** @type {import('next').NextConfig} */
const TEMPLATES = ['./public/cert-templates/**/*']

const nextConfig = {
  serverExternalPackages: ['canvas'],
  outputFileTracingIncludes: {
    '/api/certificates': TEMPLATES,
    '/api/certificates/[id]/pdf': TEMPLATES,
    '/api/certificates/[id]/send': TEMPLATES,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'fastfwdus.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'flagcdn.com' },
    ],
  },
}

module.exports = nextConfig
