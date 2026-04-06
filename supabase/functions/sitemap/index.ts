import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE_URL = "https://prime-herb-gateway.lovable.app";

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: articles } = await supabase
    .from("articles")
    .select("slug, updated_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  const staticPages = [
    { loc: "/", priority: "1.0", changefreq: "weekly" },
    { loc: "/articles", priority: "0.8", changefreq: "daily" },
    { loc: "/brand-story", priority: "0.6", changefreq: "monthly" },
    { loc: "/privacy", priority: "0.3", changefreq: "yearly" },
    { loc: "/terms", priority: "0.3", changefreq: "yearly" },
    { loc: "/order-tracking", priority: "0.5", changefreq: "monthly" },
  ];

  const urls = staticPages.map(
    (p) => `
  <url>
    <loc>${SITE_URL}${p.loc}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  );

  if (articles) {
    for (const a of articles) {
      urls.push(`
  <url>
    <loc>${SITE_URL}/articles/${a.slug}</loc>
    <lastmod>${new Date(a.updated_at).toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
});
