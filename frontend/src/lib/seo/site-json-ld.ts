import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from '@/data/site'

/* Organization + WebSite for search engines. */
export function siteJsonLd() {
  const org = `${SITE_URL}/#organization`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': org, name: SITE_NAME, alternateName: SITE_TITLE, url: SITE_URL, logo: new URL('/logo_saksi.png', SITE_URL).toString(), description: SITE_DESCRIPTION },
      { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: SITE_URL, name: SITE_NAME, description: SITE_DESCRIPTION, inLanguage: 'id-ID', publisher: { '@id': org } },
    ],
  }
}
