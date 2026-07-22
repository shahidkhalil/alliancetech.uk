import type { Metadata } from "next";
import PageWrapper from "@/components/PageWrapper";
import BlogCard from "@/components/BlogCard";
import FinalCTA from "@/components/FinalCTA";
import { BreadcrumbSchema } from "@/components/StructuredData";
import { blogPosts, getBlogBySlug } from "@/lib/blogData";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const post = getBlogBySlug(params.slug);
  if (!post) return { title: "Blog | Alliance Tech" };

  const title = post.metaTitle || `${post.title} | Alliance Tech`;
  const description = post.metaDescription || post.excerpt;
  const url = `https://alliancetechltd.com/blog/${post.slug}`;

  return {
    title,
    description,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      url,
      locale: "en_GB",
      siteName: "Alliance Tech",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogBySlug(params.slug);
  if (!post) notFound();

  const related = blogPosts
    .filter((p) => p.slug !== post.slug)
    .sort((a, b) => {
      const aH = a.location === "Blackburn" || a.location === "Manchester" ? 0 : 1;
      const bH = b.location === "Blackburn" || b.location === "Manchester" ? 0 : 1;
      return aH - bH;
    })
    .slice(0, 2);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    datePublished: post.date,
    author: {
      "@type": "Organization",
      name: "Alliance Tech",
      url: "https://alliancetechltd.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Alliance Tech",
      url: "https://alliancetechltd.com",
      logo: {
        "@type": "ImageObject",
        url: "https://alliancetechltd.com/logo-horizontal.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://alliancetechltd.com/blog/${post.slug}`,
    },
    about: {
      "@type": "Place",
      name: `${post.location}, ${post.state}`,
    },
    keywords: (post.keywords || []).join(", "),
  };

  return (
    <PageWrapper>
      <BreadcrumbSchema
        items={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <article itemScope itemType="https://schema.org/Article">
        <header
          className="pt-28 pb-14"
          style={{ background: post.imageGradient }}
        >
          <div className="max-w-3xl mx-auto px-6">
            <a href="/blog" className="text-sm font-semibold text-white/70 hover:text-white transition-colors">
              ← All blogs
            </a>
            <p className="mt-6 inline-flex text-[10px] font-bold uppercase tracking-widest text-white/80 bg-white/15 px-2.5 py-1 rounded-full">
              <span itemProp="contentLocation">{post.location}, {post.state}</span>
            </p>
            <h1
              itemProp="headline"
              className="mt-4 text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight"
            >
              {post.title}
            </h1>
            <p className="mt-4 text-white/70 text-sm">
              <time itemProp="datePublished">{post.date}</time> · {post.readTime}
            </p>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-6 py-12">
          <p itemProp="description" className="text-lg text-gray-600 leading-relaxed mb-8 border-l-4 border-[#0077A8] pl-4">
            {post.excerpt}
          </p>

          <div itemProp="articleBody" className="space-y-8">
            {post.sections?.length
              ? post.sections.map((section) => (
                  <section key={section.heading}>
                    <h2 className="text-xl font-bold text-[#00283C] mb-3 tracking-tight">
                      {section.heading}
                    </h2>
                    <div className="space-y-4">
                      {section.paragraphs.map((para) => (
                        <p key={para.slice(0, 48)} className="text-gray-600 leading-relaxed">
                          {para}
                        </p>
                      ))}
                    </div>
                  </section>
                ))
              : post.content.map((para) => (
                  <p key={para.slice(0, 40)} className="text-gray-600 leading-relaxed">
                    {para}
                  </p>
                ))}
          </div>

          {post.serviceLink && (
            <aside className="mt-10 rounded-2xl border border-[#0077A8]/15 bg-[#F0FAFD] p-6">
              <p className="text-sm leading-relaxed text-gray-600">
                {post.serviceLink.description}
              </p>
              <a
                href={post.serviceLink.href}
                className="mt-4 inline-flex items-center font-bold text-[#0077A8] hover:text-[#00283C] transition-colors"
              >
                {post.serviceLink.label} →
              </a>
            </aside>
          )}
        </div>
      </article>

      {related.length > 0 && (
        <section className="py-12 bg-[#F8FAFC] border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-xl font-bold text-[#00283C] mb-6">
              {post.location === "Blackburn" || post.location === "Manchester"
                ? "More North West clinic insights"
                : "More from the UK"}
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {related.map((p) => (
                <BlogCard key={p.slug} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <FinalCTA />
    </PageWrapper>
  );
}
