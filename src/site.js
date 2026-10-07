const configuredUrl = process.env.SITE_URL?.trim()

export const siteUrl = configuredUrl ? new URL(configuredUrl) : null

if (siteUrl && (siteUrl.protocol !== 'https:' || siteUrl.username || siteUrl.password || siteUrl.pathname !== '/' || siteUrl.search || siteUrl.hash)) {
  throw new Error('SITE_URL must be an HTTPS origin without credentials, a path, query, or fragment.')
}

export const isIndexable = Boolean(
  siteUrl &&
  process.env.SITE_INDEXABLE === 'true' &&
  process.env.NODE_ENV === 'production' &&
  (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === 'production')
)

export const siteName = 'Canyon HomeCare & Hospice'
export const siteTitle = 'Healthcare Careers | Canyon HomeCare & Hospice'
export const siteDescription = 'Join Canyon HomeCare & Hospice as a remote Patient Intake & Data Entry Specialist. Explore the role and apply in four simple steps.'
