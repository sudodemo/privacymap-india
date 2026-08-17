"use client";

import { useEffect } from "react";

function slugify(value: string): string {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

function anchorId(step: number, title: string): string {
  return `pm-step${step}-${slugify(title) || "item"}`;
}

function enhanceReportLinks() {
  const report = document.getElementById("assessment-report");
  if (!report) return;

  const links = Array.from(
    report.querySelectorAll<HTMLAnchorElement>('a[href^="#pm-step"]')
  );

  for (const link of links) {
    const card = link.closest("div");
    if (!card) continue;

    const heading = card.querySelector<HTMLElement>("h4");
    if (!heading) continue;

    const title = heading.textContent?.trim();
    const href = link.getAttribute("href");
    if (!title || !href) continue;

    const existing = heading.querySelector<HTMLAnchorElement>(
      `a[href="${href}"]`
    );

    if (!existing) {
      const clickable = document.createElement("a");
      clickable.href = href;
      clickable.textContent = title;
      clickable.style.color = "#1d4ed8";
      clickable.style.textDecoration = "none";
      clickable.style.fontWeight = "800";
      clickable.style.cursor = "pointer";
      clickable.setAttribute(
        "aria-label",
        `Open ${title} in the assessment`
      );
      heading.replaceChildren(clickable);
    }

    // Keep the old "Open in Step X" control out of the way.
    link.style.display = "none";
  }
}

function enhanceAssessmentAnchors() {
  const headings = Array.from(
    document.querySelectorAll<HTMLElement>("h3")
  );

  for (const heading of headings) {
    if (heading.closest("#assessment-report")) continue;

    const title = heading.textContent?.trim();
    if (!title) continue;

    const containerText =
      heading.parentElement?.parentElement?.textContent || "";
    const sectionText =
      heading.closest("section")?.textContent || "";

    const isStep8 =
      containerText.includes("Recommended treatment") ||
      containerText.includes("Treatment status");

    const isStep7 = sectionText.includes("Key Privacy Findings");

    if (isStep7 || isStep8) {
      heading.id = anchorId(isStep8 ? 8 : 7, title);
      heading.style.scrollMarginTop = "28px";
    }
  }
}

function enhance() {
  enhanceAssessmentAnchors();
  enhanceReportLinks();
}

export default function AssessmentDeepLinkBridge() {
  useEffect(() => {
    enhance();

    const observer = new MutationObserver(() => enhance());
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
