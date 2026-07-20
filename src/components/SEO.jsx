import { Helmet } from "react-helmet-async";

/**
 * SEO component to set per-page meta tags for search engine optimization.
 * Uses react-helmet-async to update <head> tags for each route.
 *
 * @param {object} props
 * @param {string} props.title - Page title (appended with " | SetuLearn")
 * @param {string} props.description - Meta description for this page
 * @param {string} props.canonical - Canonical URL relative to https://www.setulearn.in/
 * @param {string} props.image - OG image path relative to public folder
 * @param {string} props.type - JSON-LD type hint (default: WebPage)
 */
export default function SEO({
  title = "SetuLearn | Bridge to Excellence",
  description = "India's premier mock test platform for government jobs, engineering, medical, and college entrance exam preparation. Practice, analyze, and excel.",
  canonical = "/",
  image = "/OG-image.jpg",
  type = "WebPage",
}) {
  const siteUrl = "https://www.setulearn.in";
  const fullTitle = title.includes("|") ? title : `${title} | SetuLearn`;
  const canonicalUrl = `${siteUrl}${canonical}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        "url": siteUrl,
        "name": title.includes("|") ? "SetuLearn" : title,
        "description": description,
        "publisher": { "@id": `${siteUrl}/#organization` }
      },
      {
        "@type": type,
        "@id": `${canonicalUrl}#webpage`,
        "url": canonicalUrl,
        "name": fullTitle,
        "description": description,
        "isPartOf": { "@id": `${siteUrl}/#website` },
        "image": {
          "@type": "ImageObject",
          "url": `${siteUrl}${image}`
        }
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        "name": "SetuLearn",
        "url": siteUrl,
        "logo": {
          "@type": "ImageObject",
          "url": `${siteUrl}/logo.webp`
        },
        "sameAs": [
          "https://twitter.com/SetuLearnOfficial"
        ]
      }
    ]
  };

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${siteUrl}${image}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="SetuLearn" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@SetuLearnOfficial" />
      <meta name="twitter:creator" content="@SetuLearnOfficial" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${image}`} />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
}
