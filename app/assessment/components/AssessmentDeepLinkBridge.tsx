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

function normalizeTitle(value: string): string {
  return String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function ensureAssessmentStepAnchors() {
  const report = document.getElementById("assessment-report");
  const sections = Array.from(document.querySelectorAll<HTMLElement>("section"));

  for (let step = 7; step <= 13; step += 1) {
    const existing = document.getElementById(`pm-step${step}`);
    if (existing) continue;

    const target = sections.find((section) => {
      if (report?.contains(section)) return false;
      return new RegExp(`\\bSTEP\\s+${step}\\b`, "i").test(section.textContent || "");
    });

    if (target) {
      target.id = `pm-step${step}`;
      target.style.scrollMarginTop = "28px";
    }
  }
}

const REPORT_SECTION_STEPS: Array<{ marker: RegExp; step: number }> = [
  { marker: /\bRISK\s+ASSESSMENT\b/i, step: 7 },
  { marker: /\bRISK\s+TREATMENT\b/i, step: 8 },
  { marker: /\bRESIDUAL\s+RISK\b/i, step: 9 },
  { marker: /\bDPDP\s+MAPPING\b/i, step: 10 },
  { marker: /\bRISK\s+GOVERNANCE\b/i, step: 11 },
  { marker: /\bREMEDIATION\b/i, step: 12 },
  { marker: /\bEVIDENCE\s+&\s+CLOSURE\b/i, step: 13 },
];

function reportStepForSection(section: HTMLElement): number | null {
  const text = section.textContent || "";
  const match = REPORT_SECTION_STEPS.find(({ marker }) => marker.test(text));
  return match?.step ?? null;
}

function findExactAssessmentFinding(step: number, title: string): HTMLElement | null {
  const report = document.getElementById("assessment-report");
  const stepContainer = document.getElementById(`pm-step${step}`);
  if (!stepContainer || !title) return null;

  const wanted = normalizeTitle(title);
  const candidates = Array.from(
    stepContainer.querySelectorAll<HTMLElement>("h2, h3, h4, h5, button, label, strong, p, div, span")
  );

  const exact = candidates.find((candidate) => {
    if (report?.contains(candidate)) return false;
    return normalizeTitle(candidate.textContent || "") === wanted;
  });

  return exact ?? null;
}

function ensureFindingTarget(step: number, title: string): string | null {
  const targetId = anchorId(step, title);
  const existing = document.getElementById(targetId);
  if (existing) return targetId;

  const target = findExactAssessmentFinding(step, title);
  if (!target) return null;

  target.id = targetId;
  target.style.scrollMarginTop = "28px";
  return targetId;
}

function makeReportTitleClickable(heading: HTMLElement, step: number) {
  const title = heading.textContent?.trim();
  if (!title) return;

  const targetId = ensureFindingTarget(step, title);
  if (!targetId) {
    // Keep the title visible even when the corresponding finding has not
    // rendered yet. The MutationObserver will retry after rendering changes.
    return;
  }

  const href = `#${targetId}`;
  const existingLink = heading.querySelector<HTMLAnchorElement>("a");
  const clickable = existingLink ?? document.createElement("a");

  clickable.href = href;
  clickable.textContent = title;
  clickable.style.color = "#1d4ed8";
  clickable.style.textDecoration = "none";
  clickable.style.fontWeight = "800";
  clickable.style.cursor = "pointer";
  clickable.setAttribute("aria-label", `Open ${title} in the assessment`);

  if (!existingLink) heading.replaceChildren(clickable);
}

function enhanceReportLinks() {
  const report = document.getElementById("assessment-report");
  if (!report) return;

  const reportSections = Array.from(report.querySelectorAll<HTMLElement>("section"));
  for (const section of reportSections) {
    const step = reportStepForSection(section);
    if (!step) continue;

    const headings = Array.from(section.querySelectorAll<HTMLElement>("h3, h4, h5"));
    for (const heading of headings) {
      makeReportTitleClickable(heading, step);
    }
  }

  const legacyLinks = Array.from(
    report.querySelectorAll<HTMLAnchorElement>('a[href^="#pm-step"]')
  );
  for (const link of legacyLinks) {
    if (/Open in Step/i.test(link.textContent || "")) link.remove();
  }
}

function enhance() {
  ensureAssessmentStepAnchors();
  enhanceReportLinks();
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
        onClick={() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" })}
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

    const observer = new MutationObserver(() => enhance());
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return <ScrollControls />;
}
