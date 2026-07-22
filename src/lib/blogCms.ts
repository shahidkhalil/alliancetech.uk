"use client";

import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { CmsBlogPost } from "@/lib/adminTypes";
import type { BlogPost } from "@/lib/blogData";

export function listenPublishedBlogPosts(
  onData: (posts: BlogPost[]) => void,
  onError?: () => void
): Unsubscribe {
  const q = query(
    collection(getDb(), "blog_posts"),
    where("status", "==", "published"),
    orderBy("updatedAt", "desc")
  );
  return onSnapshot(
    q,
    (snap) => {
      const posts = snap.docs.map((d) => {
        const data = d.data() as Omit<CmsBlogPost, "id">;
        return {
          slug: data.slug,
          title: data.title,
          excerpt: data.excerpt || "",
          location: data.location || "Blackburn",
          state: data.state || "England",
          readTime: data.readTime || "5 min read",
          date:
            data.date ||
            new Date().toLocaleDateString("en-GB", {
              month: "long",
              day: "numeric",
              year: "numeric",
            }),
          imageGradient:
            data.imageGradient ||
            "linear-gradient(135deg, #00283C 0%, #005C7A 50%, #00B4D8 100%)",
          coverImageUrl: data.coverImageUrl,
          content: data.content || [],
          sections: data.sections,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          keywords: data.keywords,
          serviceLink: data.serviceLink,
        } satisfies BlogPost;
      });
      onData(posts);
    },
    () => onError?.()
  );
}
