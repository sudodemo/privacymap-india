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

function normalizeTitle(value: string): string {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function findingAnchorId(title: string): string {
  return `pm-key-finding-${slugify(title) || "item"}`;
}

function findKeyPrivacyFindingsSection(): HTMLElement | null {
  const headings = Array.from(
    document.querySelectorAll<HTMLElement>("h2, h3")
  );
  const heading = headings.find(
    (element) => normalizeTitle(element.textContent || "") === "key privacy findings"
  );
  return heading?.closest("section") ?? null;
}

function ensureKeyPrivacyFindingTargets(): Map<string, string> {
  const targets = new Map<string, string>();
  const section = findKeyPrivacyFindingsSection();
  if (!section) return targets;

  const findingHeadings = Array.from(
    section.querySelectorAll<HTMLElement>("h3, h4, h5")
  );

  for (const heading of findingHeadings) {
    const title = heading.textContent?.trim();
    if (!title) continue;

    const normalized = normalizeTitle(title);
    if (!normalized || normalized === "key privacy findings") continue;

    const targetId = findingAnchorId(title);
    heading.id = targetId;
    heading.style.scrollMarginTop = "28px";
    targets.set(normalized, targetId);
  }

  return targets;
}

function removeLegacyOpenInStepLinks() {
  for (const link of Array.from(
    document.querySelectorAll<HTMLAnchorElement>("a")
  )) {
    if (/open\s+in\s+step/i.test(link.textContent || "")) {
      link.remove();
    }
  }
}

function makeFindingReferenceClickable(
  element: HTMLElement,
  title: string,
  targetId: string
) {
  if (element.closest("[data-pm-key-finding-target]")?.id === targetId) return;
  if (element.closest("[data-pm-finding-reference]")?.getAttribute("href") === `#${targetId}`) return;

  const existingAnchor = element.tagName === "A"
    ? (element as HTMLAnchorElement)
    : element.querySelector<HTMLAnchorElement>(":scope > a");

  if (existingAnchor) {
    existingAnchor.href = `#${targetId}`;
    existingAnchor.setAttribute(
      "aria-label",
      `Go to ${title} in Key Privacy Findings`
    );
    existingAnchor.setAttribute("data-pm-finding-reference", "true");
    return;
  }

  const anchor = document.createElement("a");
  anchor.href = `#${targetId}`;
  anchor.textContent = title;
  anchor.setAttribute("data-pm-finding-reference", "true");
  anchor.setAttribute(
    "aria-label",
    `Go to ${title} in Key Privacy Findings`
  );
  anchor.style.color = "#1d4ed8";
  anchor.style.textDecoration = "none";
  anchor.style.fontWeight = "inherit";
  anchor.style.cursor = "pointer";

  element.replaceChildren(anchor);
}

function enhanceFindingReferences() {
  const targets = ensureKeyPrivacyFindingTargets();
  if (targets.size === 0) return;

  const canonicalSection = findKeyPrivacyFindingsSection();
  const candidates = Array.from(
    document.querySelectorAll<HTMLElement>(
      "h3, h4, h5, h6, strong, [data-finding-title]"
    )
  );

  for (const element of candidates) {
    if (canonicalSection?.contains(element)) continue;
    if (element.closest("[data-pm-finding-reference]")) continue;

    const title = element.textContent?.trim() || "";
    const targetId = targets.get(normalizeTitle(title));
    if (!targetId) continue;

    makeFindingReferenceClickable(element, title, targetId);
  }
}

function enhance() {
  removeLegacyOpenInStepLinks();
  enhanceFindingReferences();
}

function scrollToHashTarget() {
  const hash = window.location.hash;
  if (!hash) return;

  const id = decodeURIComponent(hash.slice(1));
  const target = document.getElementById(id);
  if (!target) return;

  window.requestAnimationFrame(() => {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function ScrollControls() {
  return (
    <div
      aria-label="Page navigation"
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        style={{
          border: "1px solid #bfdbfe",
          borderRadius: 999,
          background: "white",
          color: "#1d4ed8",
          padding: "9px 13px",
          fontSize: 12,
          fontWeight: 800,
          boxShadow: "0 4px 14px rgba(15,23,42,0.12)",
          cursor: "pointer",
        }}
      >
        ↑ Go to Top
      </button>
      <button
        type="button"
        onClick={() =>
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: "smooth",
          })
        }
        style={{
          border: "1px solid #cbd5e1",
          borderRadius: 999,
          background: "white",
          color: "#334155",
          padding: "9px 13px",
          fontSize: 12,
          fontWeight: 800,
          boxShadow: "0 4px 14px rgba(15,23,42,0.12)",
          cursor: "pointer",
        }}
      >
        ↓ Go to Bottom
      </button>
    </div>
  );
}

export default function AssessmentDeepLinkBridge() {
  useEffect(() => {
    enhance();
    scrollToHashTarget();

    const observer = new MutationObserver(() => enhance());
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    const handleHashChange = () => scrollToHashTarget();
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return <ScrollControls />;
}
