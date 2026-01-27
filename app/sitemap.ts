import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://netsellersheet.com'
    const currentDate = new Date()

    return [
        // Homepage - Highest Priority
        {
            url: baseUrl,
            lastModified: currentDate,
            changeFrequency: 'daily',
            priority: 1.0,
        },
        // Next Home / Mortgage Calculator - High Priority SEO Target
        {
            url: `${baseUrl}/resources/mortgage-relevance`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.9,
        },
    ]
}
