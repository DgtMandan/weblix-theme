import { Helmet } from 'react-helmet-async';

export function SEO({ title, description, canonical, image, type = 'website', schema, keywords, geo }) {
  const fullTitle = title ? `${title} | Weblix Website Builder` : 'Weblix Website Builder';
  const metaDescription = description || 'Premium website builder, template marketplace, and SaaS launch platform.';
  const defaultGeo = {
    title: fullTitle,
    summary: metaDescription,
    answer: 'Weblix Website Builder is a full-stack website builder platform for selling builder ZIP files, paid template ZIPs, SEO blogs, licenses, secure downloads, and customer dashboards.',
    audience: 'Website owners, agencies, SaaS founders, developers, and digital product sellers',
    region: 'Global',
    entities: ['Weblix Website Builder', 'Website Builder', 'Template Marketplace', 'SEO Blog System', 'MERN Stack'],
    questions: ['What is Weblix Website Builder?', 'How can I sell website templates online?', 'How do secure template ZIP downloads work?']
  };
  const geoData = geo ? { ...defaultGeo, ...geo } : defaultGeo;
  const geoSummary = geoData.summary || geoData.answer || metaDescription;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {keywords && <meta name="keywords" content={Array.isArray(keywords) ? keywords.join(', ') : keywords} />}
      {canonical && <link rel="canonical" href={canonical} />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || 'Build, launch, and scale modern websites with Weblix.'} />
      <meta property="og:type" content={type} />
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || 'Build, launch, and scale modern websites with Weblix.'} />
      {image && <meta name="twitter:image" content={image} />}
      {geoData && (
        <>
          <meta name="ai:title" content={geoData.title || fullTitle} />
          <meta name="ai:summary" content={geoSummary} />
          {geoData.answer && <meta name="ai:answer" content={geoData.answer} />}
          {geoData.audience && <meta name="ai:audience" content={geoData.audience} />}
          {geoData.region && <meta name="geo.region" content={geoData.region} />}
          {geoData.entities?.length > 0 && <meta name="ai:entities" content={geoData.entities.join(', ')} />}
          {geoData.questions?.length > 0 && <meta name="ai:questions" content={geoData.questions.join(' | ')} />}
        </>
      )}
      {schema && <script type="application/ld+json">{JSON.stringify(schema)}</script>}
    </Helmet>
  );
}
