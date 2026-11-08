import type { Metadata } from 'next'
import { SITE_NAME, SITE_OG_IMAGE } from '@/data/site'
import type { PageMetadataOptions } from '@/interfaces/seo'

/* Per-page metadata. Canonical, og:url and the share image are set here because a child's openGraph replaces the layout's whole object. */
export function pageMetadata({ title, description, path, absolute, noindex }: PageMetadataOptions): Metadata {
  const full = absolute ? title : `${title} | ${SITE_NAME}`
  return {
    title: absolute ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: { type: 'website', locale: 'id_ID', siteName: SITE_NAME, url: path, title: full, description, images: [SITE_OG_IMAGE] },
    twitter: { card: 'summary_large_image', title: full, description, images: [SITE_OG_IMAGE.url] },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  }
}
