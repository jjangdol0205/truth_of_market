import Link from 'next/link';
import { BookOpen, Clock, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const metadata = {
  title: 'Insights & Research Blog | Truth of Market',
  description: 'Deep dive into market mechanics, quantitative analysis, and institutional trading strategies.',
};

export const revalidate = 3600; // Revalidate every hour

export default async function BlogList() {
  const { data: blogPosts, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching blog posts:", error);
  }

  const posts = blogPosts || [];

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 mb-20 text-gray-200">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black mb-4 tracking-tighter">
          Market <span className="text-emerald-500">Insights</span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          Deep dives, methodology explanations, and expert commentary on the hidden mechanics of the stock market.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {posts.length > 0 ? (
          posts.map((post) => (
            <Link href={`/blog/${post.slug}`} key={post.slug} className="group">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 hover:border-emerald-500/50 transition-all duration-300 h-full flex flex-col shadow-lg">
                <div className="flex items-center gap-4 text-xs font-mono text-zinc-500 mb-4">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(post.created_at).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {post.read_time}</span>
                </div>
                <h2 className="text-2xl font-bold mb-3 group-hover:text-emerald-400 transition-colors">
                  {post.title}
                </h2>
                <p className="text-zinc-400 mb-6 flex-grow leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-zinc-800">
                  <div className="w-8 h-8 rounded-full bg-emerald-900 flex items-center justify-center">
                    <User className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-sm font-medium text-zinc-300">{post.author}</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-1 md:col-span-2 text-center p-12 border border-zinc-800 rounded-xl text-zinc-500 font-mono text-sm bg-black/50">
            NO RESEARCH POSTS FOUND.
          </div>
        )}
      </div>
    </div>
  );
}
