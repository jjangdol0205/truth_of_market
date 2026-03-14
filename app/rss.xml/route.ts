import { supabase } from '../lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://truthofmarket.com';

  const { data: reports } = await supabase
    .from('reports')
    .select('id, ticker, one_line_summary, created_at')
    .order('created_at', { ascending: false })
    .limit(50); // Fetch latest 50 for RSS

  const itemsXml = (reports || [])
    .map((report) => {
      let descriptionText = `Deep analysis for ${report.ticker}`;
      if (report.one_line_summary) {
        if (Array.isArray(report.one_line_summary)) {
          descriptionText = report.one_line_summary.join(' ');
        } else if (typeof report.one_line_summary === 'string') {
          try {
            const parsed = JSON.parse(report.one_line_summary);
            if (Array.isArray(parsed)) {
              descriptionText = parsed.join(' ');
            } else {
              descriptionText = report.one_line_summary;
            }
          } catch (e) {
            descriptionText = report.one_line_summary;
          }
        }
      }

      return `
    <item>
      <title><![CDATA[${report.ticker} AI Deep Analysis Report]]></title>
      <link>${baseUrl}/report/${report.id}</link>
      <description><![CDATA[${descriptionText}]]></description>
      <pubDate>${new Date(report.created_at).toUTCString()}</pubDate>
      <guid>${baseUrl}/report/${report.id}</guid>
    </item>`;
    })
    .join('');

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Truth of Market | Wall Street Lies Exposed</title>
    <link>${baseUrl}</link>
    <description>Data-driven financial analysis powered by AI.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>${itemsXml}
  </channel>
</rss>`;

  return new Response(rssFeed, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}
