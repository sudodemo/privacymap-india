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

  const headings = Array.from(document.querySelectorAll<HTMLElement>("h3, h4"));
  for (const heading of headings) {
    if (report?.contains(heading)) continue;

    const title = heading.textContent?.trim();
    if (!title) continue;

    const sectionText = heading.closest("section")?.textContent || "";
    const stepMatch = sectionText.match(/\bSTEP\s+(7|8|9|10|11|12|13)\b/i);
    if (!stepMatch) continue;

    heading.id = heading.id || anchorId(Number(stepMatch[1]), title);
    heading.style.scrollMarginTop = "28px";
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
  const kicker = section.querySelector<HTMLElement>("div")?.textContent?.trim() || "";
  const match = REPORT_SECTION_STEPS.find(({ marker }) => marker.test(kicker));
  return match?.step ?? null;
}

function makeReportTitleClickable(heading: HTMLElement, step: number) {
  const title = heading.textContent?.trim();
  if (!title) return;

  const targetId = anchorId(step, title);
  const existingTarget = document.getElementById(targetId);
  const href = existingTarget ? `#${targetId}` : `#pm-step${step}`;

  const existingLink = heading.querySelector<HTMLAnchorElement>("a");
  if (existingLink) {
    existingLink.href = href;
    existingLink.style.color = "#1d4ed8";
    existingLink.style.textDecoration = "none";
    existingLink.style.fontWeight = "800";
    existingLink.style.cursor = "pointer";
    existingLink.setAttribute("aria-label", `Open ${title} in the assessment`);
    return;
  }

  const clickable = document.createElement("a");
  clickable.href = href;
  clickable.textContent = title;
  clickable.style.color = "#1d4ed8";
  clickable.style.textDecoration = "none";
  clickable.style.fontWeight = "800";
  clickable.style.cursor = "pointer";
  clickable.setAttribute("aria-label", `Open ${title} in the assessment`);
  heading.replaceChildren(clickable);
}

function enhanceReportLinks() {
  const report = document.getElementById("assessment-report");
  if (!report) return;

  // Finding titles are the navigation controls. This keeps the report clean
  // while retaining a direct path back to the corresponding assessment step.
  const reportSections = Array.from(report.querySelectorAll<HTMLElement>("section"));
  for (const section of reportSections) {
    const step = reportStepForSection(section);
    if (!step) continue;

    const headings = Array.from(section.querySelectorAll<HTMLElement>("h4"));
    for (const heading of headings) {
      makeReportTitleClickable(heading, step);
    }
  }

  // Remove any legacy standalone "Open in Step" controls left by older
  // report markup. The title itself now provides the navigation affordance.
  const legacyLinks = Array.from(
    report.querySelectorAll<HTMLAnchorElement>('a[href^="#pm-step"]')
  );

  for (const link of legacyLinks) {
    if (/Open in Step/i.test(link.textContent || "")) {
      link.remove();
    }
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
