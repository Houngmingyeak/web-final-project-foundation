import { useEffect } from "react";

/**
 * SEO component — updates <title> and key meta tags per page.
 * Usage: <SEO title="Questions" description="..." keywords="..." />
 */
export default function SEO({ title, description, keywords }) {
  useEffect(() => {
    // ── Snapshot previous values for cleanup ──────────────────────────
    const previousTitle = document.title;
    const metaDesc      = document.querySelector('meta[name="description"]');
    const metaTitle     = document.querySelector('meta[name="title"]');
    const ogTitle       = document.querySelector('meta[property="og:title"]');
    const ogDesc        = document.querySelector('meta[property="og:description"]');
    const ogUrl         = document.querySelector('meta[property="og:url"]');
    const twTitle       = document.querySelector('meta[name="twitter:title"]');
    const twDesc        = document.querySelector('meta[name="twitter:description"]');
    const twUrl         = document.querySelector('meta[name="twitter:url"]');
    const metaKeywords  = document.querySelector('meta[name="keywords"]');
    const canonical     = document.querySelector('link[rel="canonical"]');

    const prevDesc     = metaDesc?.getAttribute("content") ?? "";
    const prevKeywords = metaKeywords?.getAttribute("content") ?? "";

    // ── Canonical & OG URL → current page ─────────────────────────────
    const currentUrl = window.location.href;
    canonical?.setAttribute("href", currentUrl);
    ogUrl?.setAttribute("content", currentUrl);
    twUrl?.setAttribute("content", currentUrl);

    // ── Title (50-70 chars: "Page | MindStack — Gamified Q&A for Devs") ─
    if (title) {
      const fullTitle = `${title} | MindStack — Gamified Q&A for Developers`;
      document.title = fullTitle;
      metaTitle?.setAttribute("content", fullTitle);
      ogTitle?.setAttribute("content", fullTitle);
      twTitle?.setAttribute("content", `${title} | MindStack`);
    }

    // ── Description ────────────────────────────────────────────────────
    if (description) {
      metaDesc?.setAttribute("content", description);
      ogDesc?.setAttribute("content", description);
      twDesc?.setAttribute("content", description);
    }

    // ── Keywords ───────────────────────────────────────────────────────
    if (keywords) {
      metaKeywords?.setAttribute("content", keywords);
    }

    // ── Cleanup: restore defaults when navigating away ─────────────────
    return () => {
      document.title = previousTitle;
      if (metaDesc && prevDesc)     metaDesc.setAttribute("content", prevDesc);
      if (metaKeywords && prevKeywords) metaKeywords.setAttribute("content", prevKeywords);
    };
  }, [title, description, keywords]);

  return null;
}
