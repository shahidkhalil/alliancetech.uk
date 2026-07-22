"use client";

import { useEffect, useMemo, useState } from "react";
import BlogCard from "@/components/BlogCard";
import { blogPosts } from "@/lib/blogData";
import { listenPublishedBlogPosts } from "@/lib/blogCms";
import type { BlogPost } from "@/lib/blogData";

/** Merges static posts with CMS-published Firestore posts (CMS wins on same slug). */
export default function BlogPostsGrid() {
  const [cmsPosts, setCmsPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    return listenPublishedBlogPosts(setCmsPosts);
  }, []);

  const posts = useMemo(() => {
    type Row = BlogPost & { href: string };
    const map = new Map<string, Row>();
    for (const p of blogPosts) {
      map.set(p.slug, { ...p, href: `/blog/${p.slug}` });
    }
    for (const p of cmsPosts) {
      const isStatic = blogPosts.some((s) => s.slug === p.slug);
      map.set(p.slug, {
        ...p,
        href: isStatic ? `/blog/${p.slug}` : `/blog/cms?slug=${encodeURIComponent(p.slug)}`,
      });
    }
    return Array.from(map.values());
  }, [cmsPosts]);

  return (
    <div className="max-w-6xl mx-auto px-6 grid sm:grid-cols-2 gap-6">
      {posts.map((post, i) => (
        <BlogCard key={post.slug} post={post} delay={i * 0.08} href={post.href} />
      ))}
    </div>
  );
}
