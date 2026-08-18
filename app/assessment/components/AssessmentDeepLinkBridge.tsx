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

function treatmentAnchorId(title: string): string {
  return `pm-treatment-${slugify(title) || "item"}`;
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

function ensureRecommendedTreatmentTargets(): Map<string, string> {
  const targets = new Map<string, string>();
  const report = document.getElementById("assessment-report");
  const sections = Array.from(document.querySelectorAll<HTMLElement>("section"));

  const treatmentSection = sections.find((section) => {
    if (report?.contains(section)) return false;
    return /\bRECOMMENDED\s+RISK\s+TREATMENTS\b/i.test(section.textContent || "");
  });

  if (!treatmentSection) return targets;

  const headings = Array.from(treatmentSection.querySelectorAll<HTMLElement>("h3"));
  for (const heading of headings) {
    const title = heading.textContent?.trim();
    if (!title || /^Recommended Risk Treatments$/i.test(title)) continue;

    const targetId = treatmentAnchorId(title);
    const existing = document.getElementById(targetId);
    const target = existing ?? heading;
    target.id = targetId;
    target.style.scrollMarginTop = "28px";
    targets.set(normalizeTitle(title), targetId);
  }

  return targets;
}

const REPORT_SECTION_MARKERS = [
  /\bRISK\s+ASSESSMENT\b/i,
  /\bRISK\s+TREATMENT\b/i,
  /\bRESIDUAL\s+RISK\b/i,
  /\bDPDP\s+MAPPING\b/i,
  /\bRISK\s+GOVERNANCE\b/i,
  /\bREMEDIATION\b/i,
  /\bEVIDENCE\s+&\s+CLOSURE\b/i,
];

function isReportSection(section: HTMLElement): boolean {
  const text = section.textContent || "";
  return REPORT_SECTION_MARKERS.some((marker) => marker.test(text));
}

function makeReportTitleClickable(heading: HTMLElement, targetId: string) {
  const title = heading.textContent?.trim();
  if (!title) return;

  const existingLink = heading.querySelector<HTMLAnchorElement>("a");
  const clickable = existingLink ?? document.createElement("a");

  clickable.href = `#${targetId}`;
  clickable.textContent = title;
  clickable.style.color = "#1d4ed8";
  clickable.style.textDecoration = "none";
  clickable.style.fontWeight = "800";
  clickable.style.cursor = "pointer";
  clickable.setAttribute("aria-label", `Go to ${title} in Recommended Risk Treatments`);

  if (!existingLink) heading.replaceChildren(clickable);
}

function enhanceReportLinks() {
  const report = document.getElementById("assessment-report");
  if (!report) return;

  const treatmentTargets = ensureRecommendedTreatmentTargets();
  if (treatmentTargets.size === 0) return;

  const reportSections = Array.from(report.querySelectorAll<HTMLElement>("section"));
  for (const section of reportSections) {
    if (!isReportSection(section)) continue;

    const headings = Array.from(section.querySelectorAll<HTMLElement>("h4, h5"));
    for (const heading of headings) {
      const title = normalizeTitle(heading.textContent || "");
      const targetId = treatmentTargets.get(title);
      if (targetId) makeReportTitleClickable(heading, targetId);
    }
  }

  const legacyLinks = Array.from(report.querySelectorAll<HTMLAnchorElement>("a"));
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
