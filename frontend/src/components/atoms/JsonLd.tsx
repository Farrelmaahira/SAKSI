interface Props {
  data: object
}

/* The "<" escape stops a string inside the data from closing the script tag (see the Next.js JSON-LD guide). */
export default function JsonLd({ data }: Props) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
}
