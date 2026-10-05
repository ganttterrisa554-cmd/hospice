import { isIndexable, siteUrl } from '../site'

export default function sitemap() {
  return isIndexable ? [{ url: siteUrl.href }] : []
}
