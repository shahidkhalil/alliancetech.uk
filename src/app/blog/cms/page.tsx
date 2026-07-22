"use client";

import { useEffect, useMemo, useState } from "react";
import PageWrapper from "@/components/PageWrapper";
import FinalCTA from "@/components/FinalCTA";
import { listenPublishedBlogPosts } from "@/lib/blogCms";
import type { BlogPost } from "@/lib/blogData";
import { Loader2 } from "lucide-react";

export default function CmsBlogPostPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [ready, setReady] = useState(false);
  const [slug, setSlug] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSlug(params.get("slug") || "");
    return listenPublishedBlogPosts(
      (list) => {
        setPosts(list);
        setReady(true);
      },
      () => setReady(true)
    );
  }, []);

  const post = useMemo(() => posts.find((p) => p.slug === slug), [posts, slug]);

  return (
    <PageWrapper>
      <section className="pt-28 pb-16 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          {!ready ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-[#0077A8]" />
            </div>
          ) : !post ? (
            <div className="text-center py-20">
              <h1 className="text-2xl font-extrabold text-[#00283C] mb-2">Post not found</h1>
              <p className="text-gray-500 text-sm mb-6">This CMS article may be unpublished or the link is wrong.</p>
              <a href="/blog" className="text-[#0077A8] font-semibold text-sm hover:underline">
                ← Back to blog
              </a>
            </div>
          ) : (
            <article>
              {post.coverImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.coverImageUrl}
                  alt={post.title}
                  className="w-full h-56 lg:h-72 object-cover rounded-2xl mb-8"
                />
              )}
              <p className="text-xs font-bold uppercase tracking-widest text-[#0077A8] mb-3">
                {post.location}, {post.state}
              </p>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-[#00283C] tracking-tight mb-4">
                {post.title}
              </h1>
              <p className="text-sm text-gray-400 mb-8">
                {post.date} · {post.readTime}
              </p>
              <p className="text-lg text-gray-600 leading-relaxed mb-10">{post.excerpt}</p>
              <div className="space-y-8">
                {(post.sections || []).map((section) => (
                  <div key={section.heading}>
                    <h2 className="text-xl font-bold text-[#00283C] mb-3">{section.heading}</h2>
                    {section.paragraphs.map((p) => (
                      <p key={p.slice(0, 24)} className="text-gray-600 leading-relaxed mb-3">
                        {p}
                      </p>
                    ))}
                  </div>
                ))}
                {(post.content || []).map((p) => (
                  <p key={p.slice(0, 24)} className="text-gray-600 leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            </article>
          )}
        </div>
      </section>
      <FinalCTA />
    </PageWrapper>
  );
}
