import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogType?: "website" | "article" | "event" | "organization";
  ogImage?: string;
  structuredData?: object;
  noIndex?: boolean;
}

export default function SEOHead({
  title,
  description,
  keywords = "running, events, community, fitness, social running, running clubs, training plans, Australia",
  canonicalUrl,
  ogType = "website",
  ogImage = "/og-image.jpg",
  structuredData,
  noIndex = false
}: SEOHeadProps) {
  const fullTitle = `${title} | The Social Runner`;
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://the-social-runner.replit.app';
  const fullCanonicalUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : siteUrl);
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="The Social Runner" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      <link rel="canonical" href={fullCanonicalUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="The Social Runner" />
      <meta property="og:locale" content="en_AU" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />
      <meta name="twitter:site" content="@thesocialrunner" />
      <meta name="twitter:creator" content="@thesocialrunner" />

      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#f97316" />
      <meta name="msapplication-TileColor" content="#f97316" />
      <meta name="application-name" content="The Social Runner" />
      <meta name="apple-mobile-web-app-title" content="The Social Runner" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />

      {/* Geo Tags for Australian Focus */}
      <meta name="geo.region" content="AU" />
      <meta name="geo.placename" content="Australia" />
      <meta name="geo.position" content="-25.274398;133.775136" />
      <meta name="ICBM" content="-25.274398, 133.775136" />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}

      {/* Base Organization Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "The Social Runner",
          "description": "Australia's premier running community connecting runners through events, training plans, and social networking",
          "url": siteUrl,
          "logo": `${siteUrl}/logo-192.png`,
          "sameAs": [
            "https://facebook.com/thesocialrunner",
            "https://instagram.com/thesocialrunner",
            "https://twitter.com/thesocialrunner"
          ],
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "AU",
            "addressRegion": "Australia"
          },
          "areaServed": {
            "@type": "Country",
            "name": "Australia"
          },
          "serviceType": "Running Community Platform",
          "knowsAbout": [
            "Running Events",
            "Training Plans", 
            "Running Clubs",
            "Fitness Community",
            "Social Running",
            "Parkrun",
            "Marathon Training"
          ]
        })}
      </script>
    </Helmet>
  );
}