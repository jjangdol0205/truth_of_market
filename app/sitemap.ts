import { MetadataRoute } from 'next';
import { supabase } from './lib/supabase';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://truthofmarket.com';

    // Fetch reports
    const { data: reports } = await supabase
        .from('reports')
        .select('id, created_at')
        .order('created_at', { ascending: false });

    const reportUrls = (reports || []).map((report) => ({
        url: `${baseUrl}/report/${report.id}`,
        lastModified: new Date(report.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    // Fetch blog posts
    const { data: blogPosts } = await supabase
        .from('blog_posts')
        .select('slug, created_at')
        .order('created_at', { ascending: false });

    const blogUrls = (blogPosts || []).map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/hub`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/pricing`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/methodology`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/disclaimer`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        ...reportUrls,
        ...blogUrls,
    ];
}
