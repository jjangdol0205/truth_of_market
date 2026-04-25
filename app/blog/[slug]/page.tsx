import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import { supabase } from '../../lib/supabase';
import AffiliateBanner from '../../components/AffiliateBanner';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: post } = await supabase.from('blog_posts').select('*').eq('slug', slug).single();
  if (!post) return { title: 'Post Not Found' };
  
  return {
    title: `${post.title} | Truth of Market Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: post } = await supabase.from('blog_posts').select('*').eq('slug', slug).single();
  
  if (!post) {
    notFound();
  }

  const { data: recentPosts } = await supabase
    .from('blog_posts')
    .select('title, slug, created_at, read_time')
    .neq('slug', slug)
    .order('created_at', { ascending: false })
    .limit(3);

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 mb-20 text-gray-200">
      <Link href="/blog" className="flex items-center text-emerald-500 hover:text-emerald-400 font-mono text-sm mb-8 group w-fit">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        BACK TO BLOG
      </Link>

      <header className="mb-12 border-b border-zinc-800 pb-8">
        <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight tracking-tight text-white">
          {post.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-6 text-zinc-400 font-mono text-sm">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-500" />
            <span>{post.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-500" />
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-500" />
            <span>{post.read_time}</span>
          </div>
        </div>
      </header>

      <article className="prose prose-invert prose-lg max-w-none prose-emerald prose-headings:font-black prose-headings:tracking-tight prose-a:text-emerald-400 prose-img:rounded-xl">
        <ReactMarkdown remarkPlugins={[remarkBreaks]}>
          {post.content}
        </ReactMarkdown>
      </article>

      {/* Affiliate Marketing Integration (CPA) */}
      <AffiliateBanner />

      {/* Author Bio Box */}
      <div className="mt-12 p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex flex-col md:flex-row gap-6 items-center md:items-start">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 shrink-0">
          <User className="w-8 h-8 text-emerald-500" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Written by Truth of Market Quant Team</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Our content is generated through a rigorous fusion of algorithmic data processing and fundamental financial analysis. We process SEC filings, technical indicators, and institutional money flow to deliver emotionless, actionable insights.
          </p>
        </div>
      </div>

      <div className="mt-16 pt-8 border-t border-zinc-800 text-center">
        <p className="text-zinc-400 mb-6 text-lg">Did you find this analysis helpful?</p>
        <Link href="/" className="inline-block bg-emerald-500 text-black font-bold px-8 py-4 rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20">
          Try Our AI Stock Analyzer
        </Link>
      </div>

      {/* Related Posts */}
      {recentPosts && recentPosts.length > 0 && (
        <div className="mt-20 pt-12 border-t border-zinc-800">
          <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-2">
            <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
            Recent Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentPosts.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="block group">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-emerald-500/50 transition-colors h-full flex flex-col justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors mb-3 line-clamp-3">
                      {p.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono text-zinc-500 mt-4">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {new Date(p.created_at).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {p.read_time}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
