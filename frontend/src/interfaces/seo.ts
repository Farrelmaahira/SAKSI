export interface PageMetadataOptions {
  title: string
  description: string
  path: string
  /* Skip the "| SAKSI" suffix, for the home page whose title already is the brand. */
  absolute?: boolean
  noindex?: boolean
}
