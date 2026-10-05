import { isIndexable, siteUrl } from '../site'

export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    ...(isIndexable ? { sitemap: new URL('/sitemap.xml', siteUrl).href } : {}),
  }
}
