import HomeTemplate from "@/components/organisms/HomeTemplate";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/data/site";
import { pageMetadata } from "@/lib/seo/page-metadata";

export const metadata = pageMetadata({
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  path: "/",
  absolute: true,
});

export default function Home() {
  return <HomeTemplate />;
}
