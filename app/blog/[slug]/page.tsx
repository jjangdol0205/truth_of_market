import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import { supabase } from '../../lib/supabase';

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

      <div className="mt-16 pt-8 border-t border-zinc-800 text-center">
        <p className="text-zinc-400 mb-6 text-lg">Did you find this analysis helpful?</p>
        <Link href="/" className="inline-block bg-emerald-500 text-black font-bold px-8 py-4 rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20">
          Try Our AI Stock Analyzer
        </Link>
      </div>
    </div>
  );
}
