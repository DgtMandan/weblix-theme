import { useEffect, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { SEO } from '../../utils/seo.jsx';

export function ScheduledPosts() {
  const [posts, setPosts] = useState([]);
  useEffect(() => { api.get('/trends/scheduled').then(({ data }) => setPosts(data)).catch(() => setPosts([])); }, []);
  return (
    <section className="min-h-screen bg-[#0d0d0d] px-4 py-8 text-white">
      <SEO title="Scheduled Posts" />
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font900 uppercase tracking-[0.18em] text-[#4F7BFF]">Scheduled Posts</p>
        <h1 className="mt-2 text-3xl font-black">Publishing calendar</h1>
        <div className="mt-6 grid gap-4">
          {posts.length === 0 && <div className="rounded-[18px] border border-white/10 bg-[#171717] p-8 text-white/45">No scheduled posts yet.</div>}
          {posts.map((post) => (
            <div key={post._id} className="flex flex-col gap-4 rounded-[18px] border border-white/10 bg-[#171717] p-5 md:flex-row md:items-center md:justify-between">
              <div><h2 className="text-xl font-black">{post.title}</h2><p className="mt-2 text-sm text-white/45">{post.seoDescription || post.excerpt}</p></div>
              <div className="flex items-center gap-3 text-sm font900 text-[#4F7BFF]"><CalendarClock size={18} /> {post.scheduledAt ? new Date(post.scheduledAt).toLocaleString() : 'Not set'}</div>
              <Link to="/admin/blogs" className="rounded-[10px] bg-[#2155FF] px-4 py-2 text-sm font900 hover:bg-[#4F7BFF]">Edit</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
