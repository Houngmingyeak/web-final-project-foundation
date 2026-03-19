import { useEffect } from "react";

export default function SEO({ title, description, keywords }) {
  useEffect(() => {
    const previousTitle = document.title;
    let metaDesc = document.querySelector('meta[name="description"]');
    let ogDesc = document.querySelector('meta[property="og:description"]');
    let ogTitle = document.querySelector('meta[property="og:title"]');
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    let canonical = document.querySelector('link[rel="canonical"]');

    const previousDesc = metaDesc ? metaDesc.getAttribute("content") : "";
    const previousKeywords = metaKeywords ? metaKeywords.getAttribute("content") : "";

    if (canonical) {
      canonical.setAttribute("href", window.location.href);
    }

    if (title) {
      const fullTitle = `${title} | MindStack`;
      document.title = fullTitle;
      if (ogTitle) ogTitle.setAttribute("content", fullTitle);
    }

    if (description) {
      if (metaDesc) metaDesc.setAttribute("content", description);
      if (ogDesc) ogDesc.setAttribute("content", description);
    }

    if (keywords) {
      if (metaKeywords) metaKeywords.setAttribute("content", keywords);
    }

    // Cleanup when unmounting or changing page to fallback to index defaults
    return () => {
      document.title = previousTitle;
      if (metaDesc && previousDesc) metaDesc.setAttribute("content", previousDesc);
      if (metaKeywords && previousKeywords) metaKeywords.setAttribute("content", previousKeywords);
    };
  }, [title, description, keywords]);

  return null;
}
