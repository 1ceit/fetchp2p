import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/send', '/receive', '/terms', '/privacy', '/r/'],
    },
    sitemap: 'https://fetch.1ceit.com/sitemap.xml',
  }
}
