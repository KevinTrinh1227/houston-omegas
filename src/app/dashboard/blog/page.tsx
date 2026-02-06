'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/dashboard/AuthProvider';
import { isExecRole } from '@/lib/roles';

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  status: string;
  published_at: string | null;
  views: number;
  created_at: string;
  first_name: string;
  last_name: string;
  author_id: string;
}

export default function BlogListPage() {
  const { member } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      // Fetch all posts (including drafts) for dashboard
      const res = await fetch('/api/dashboard/blog-posts', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || data);
      }
    } catch { /* */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = async (slug: string) => {
    if (!confirm('Delete this post?')) return;
    try {
      await fetch(`/api/blog/${slug}`, { method: 'DELETE', credentials: 'include' });
      fetchPosts();
    } catch { /* */ }
  };

  const statusColor: Record<string, string> = {
    published: 'bg-green-100 text-green-700',
    draft: 'bg-yellow-100 text-yellow-700',
    archived: 'bg-gray-100 text-gray-600',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Blog Posts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your blog content</p>
        </div>
        {(isExecRole(member?.role || '') || member?.role === 'active') && (
          <Link href="/dashboard/blog/new" className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-all">
            New Post
          </Link>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-48 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-72" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm mb-4">No blog posts yet.</p>
          <Link href="/dashboard/blog/new" className="text-gray-600 text-xs hover:underline">Create your first post</Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-[10px] text-gray-400 uppercase tracking-wider font-medium px-5 py-3">Title</th>
                <th className="text-left text-[10px] text-gray-400 uppercase tracking-wider font-medium px-5 py-3 hidden sm:table-cell">Author</th>
                <th className="text-left text-[10px] text-gray-400 uppercase tracking-wider font-medium px-5 py-3">Status</th>
                <th className="text-right text-[10px] text-gray-400 uppercase tracking-wider font-medium px-5 py-3 hidden sm:table-cell">Views</th>
                <th className="text-right text-[10px] text-gray-400 uppercase tracking-wider font-medium px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{post.title}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{post.published_at ? new Date(post.published_at + 'Z').toLocaleDateString() : 'Not published'}</p>
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    <p className="text-xs text-gray-500">{post.first_name} {post.last_name}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${statusColor[post.status]}`}>{post.status}</span>
                  </td>
                  <td className="px-5 py-3 text-right hidden sm:table-cell">
                    <span className="text-xs text-gray-500">{post.views}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/dashboard/blog/edit?slug=${post.slug}`} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Edit</Link>
                      {(post.author_id === member?.id || isExecRole(member?.role || '')) && (
                        <button onClick={() => handleDelete(post.slug)} className="text-xs text-red-400 hover:text-red-600 transition-colors">Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
