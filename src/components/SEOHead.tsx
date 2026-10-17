import React, { useEffect } from 'react';
import { OFFICIAL_CHURCH_INFO } from '../data/churchData';

export interface SEOProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  structuredData?: Record<string, any>;
}

export const SEOHead: React.FC<SEOProps> = ({
  title,
  description,
  path,
  image = '/images/eglise/og-banner.svg',
  type = 'website',
  publishedTime,
  structuredData
}) => {
  useEffect(() => {
    // 1. Dynamic Page Title
    document.title = title;

    const baseOrigin = 'https://www.eglisedunazareendedame.org';
    const canonicalUrl = `${baseOrigin}${path === '/' ? '/' : path}`;
    const imageUrl = image.startsWith('http') ? image : `${baseOrigin}${image}`;

    // Helper to safely set or create meta tag
    const setMetaTag = (attribute: string, nameOrProperty: string, content: string) => {
      let element = document.querySelector(`meta[${attribute}="${nameOrProperty}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, nameOrProperty);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Standard Meta Tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'author', 'Église du Nazaréen de Damé');
    setMetaTag('name', 'robots', path.startsWith('/secretariat') ? 'noindex, nofollow' : 'index, follow');

    // 3. Open Graph Tags
    setMetaTag('property', 'og:site_name', 'Église du Nazaréen de Damé');
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:locale', 'fr_HT');
    setMetaTag('property', 'og:image', imageUrl);
    setMetaTag('property', 'og:image:alt', title);

    // 4. Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', imageUrl);
    setMetaTag('name', 'twitter:url', canonicalUrl);

    // 5. Canonical Link
    let canonicalElement = document.querySelector('link[rel="canonical"]');
    if (!canonicalElement) {
      canonicalElement = document.createElement('link');
      canonicalElement.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalElement);
    }
    canonicalElement.setAttribute('href', canonicalUrl);

    // 6. Dynamic Page Schema.org (ReligiousOrganization + WebPage)
    const pageSchemaId = 'seo-page-schema';
    let scriptElement = document.getElementById(pageSchemaId) as HTMLScriptElement | null;
    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.id = pageSchemaId;
      scriptElement.type = 'application/ld+json';
      document.head.appendChild(scriptElement);
    }

    const defaultPageSchema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'ReligiousOrganization',
          '@id': 'https://www.eglisedunazareendedame.org/#organization',
          'name': OFFICIAL_CHURCH_INFO.name,
          'alternateName': 'Église du Nazaréen de Damé',
          'url': 'https://www.eglisedunazareendedame.org',
          'logo': 'https://www.eglisedunazareendedame.org/images/eglise/sceau-officiel.svg',
          'image': 'https://www.eglisedunazareendedame.org/images/eglise/og-banner.svg',
          'slogan': OFFICIAL_CHURCH_INFO.motto,
          'foundingDate': '1979',
          'founder': {
            '@type': 'Person',
            'name': OFFICIAL_CHURCH_INFO.founder
          },
          'leader': {
            '@type': 'Person',
            'name': OFFICIAL_CHURCH_INFO.seniorPastor,
            'jobTitle': 'Pasteur Principal depuis 2003'
          },
          'address': {
            '@type': 'PostalAddress',
            'streetAddress': OFFICIAL_CHURCH_INFO.address.section,
            'addressLocality': OFFICIAL_CHURCH_INFO.address.commune,
            'addressRegion': OFFICIAL_CHURCH_INFO.address.department,
            'addressCountry': 'HT'
          },
          'telephone': OFFICIAL_CHURCH_INFO.phone,
          'email': OFFICIAL_CHURCH_INFO.email,
          'sameAs': [
            OFFICIAL_CHURCH_INFO.social.youtube,
            OFFICIAL_CHURCH_INFO.social.facebook
          ]
        },
        {
          '@type': 'WebPage',
          '@id': `${canonicalUrl}#webpage`,
          'url': canonicalUrl,
          'name': title,
          'description': description,
          'isPartOf': {
            '@id': 'https://www.eglisedunazareendedame.org/#website'
          },
          'about': {
            '@id': 'https://www.eglisedunazareendedame.org/#organization'
          },
          'inLanguage': 'fr-HT'
        },
        ...(structuredData ? [structuredData] : [])
      ]
    };

    scriptElement.textContent = JSON.stringify(defaultPageSchema);

  }, [title, description, path, image, type, publishedTime, structuredData]);

  return null;
};
