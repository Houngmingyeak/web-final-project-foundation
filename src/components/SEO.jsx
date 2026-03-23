import { Helmet } from "react-helmet-async";

/**
 * SEO component — updates <title> and key meta tags per page.
 * Usage: <SEO title="Questions" description="..." keywords="..." />
 */
export default function SEO({ title, description, keywords }) {
  const fullTitle = title ? `${title} | MindStack — Gamified Q&A for Developers` : "MindStack — Gamified Q&A for Developers";
  const currentUrl = typeof window !== 'undefined' ? window.location.href : "https://mindstack.study";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta property="og:title" content={fullTitle} />
      <meta name="twitter:title" content={title ? `${title} | MindStack` : fullTitle} />
      
      {description && (
        <>
          <meta name="description" content={description} />
          <meta property="og:description" content={description} />
          <meta name="twitter:description" content={description} />
        </>
      )}

      {keywords && <meta name="keywords" content={keywords} />}

      <meta property="og:url" content={currentUrl} />
      <meta name="twitter:url" content={currentUrl} />
      <link rel="canonical" href={currentUrl} />
    </Helmet>
  );
}
