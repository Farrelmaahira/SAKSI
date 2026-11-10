import type { MetadataRoute } from "next";
import { SITE_URL } from "@/data/site";

// Only public pages. The dashboard and the token pages (verify email, reset password) stay out.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/simulasi`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/lacak`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/daftar`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE_URL}/masuk`, changeFrequency: "yearly", priority: 0.4 },
  ];
}
