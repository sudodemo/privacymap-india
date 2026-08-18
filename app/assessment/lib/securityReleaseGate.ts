/*
 * PrivacyMap E6 — Security Assurance & Release Gate
 *
 * This module intentionally separates browser-observable checks from controls
 * that must be verified from the deployed response/build. A browser cannot
 * reliably inspect HTTP response headers such as CSP or HSTS after the fact.
 */

export const E6_VERSION = "E6.1";

export type ReleaseGateStatus = "PASS" | "WARN" | "FAIL" | "MANUAL";

export type ReleaseGateCheck = {
  id: string;
  area: string;
  label: string;
  status: ReleaseGateStatus;
  detail: string;
};

export type SecurityReleaseGateResult = {
  version: string;
  checks: ReleaseGateCheck[];
  automatedPassed: number;
  automatedFailed: number;
  manualChecks: number;
  overall: "READY" | "CONDITIONAL" | "BLOCKED";
  generatedAt: string;
};

const checksForRuntime = (): ReleaseGateCheck[] => {
  if (typeof window === "undefined") return [];

  const checks: ReleaseGateCheck[] = [];

  checks.push({
    id: "E6-RUNTIME-HTTPS",
    area: "Transport",
    label: "HTTPS / secure browser context",
    status: window.isSecureContext ? "PASS" : "FAIL",
    detail: window.isSecureContext
      ? "The deployed page is running in a secure browser context."
      : "The page is not running in a secure browser context.",
  });

  let storageStatus: ReleaseGateStatus = "PASS";
  let storageDetail = "Browser localStorage is available for local assessment continuity.";
  try {
    const key = "__privacymap_e6_storage_probe__";
    window.localStorage.setItem(key, "1");
    window.localStorage.removeItem(key);
  } catch {
    storageStatus = "FAIL";
    storageDetail = "Browser localStorage is unavailable or blocked; local continuity cannot be relied upon.";
  }
  checks.push({
    id: "E6-RUNTIME-STORAGE",
    area: "Data locality",
    label: "Local storage availability",
    status: storageStatus,
    detail: storageDetail,
  });

  const hasCrypto = Boolean(window.crypto?.getRandomValues);
  checks.push({
    id: "E6-RUNTIME-CRYPTO",
    area: "Platform security",
    label: "Web Crypto availability",
    status: hasCrypto ? "PASS" : "WARN",
    detail: hasCrypto
      ? "Web Crypto is available to browser-side security utilities."
      : "Web Crypto is unavailable; browser-side cryptographic helpers should not be assumed available.",
  });

  const hasOrigin = Boolean(window.location.origin && window.location.origin !== "null");
  checks.push({
    id: "E6-RUNTIME-ORIGIN",
    area: "Browser isolation",
    label: "Valid application origin",
    status: hasOrigin ? "PASS" : "FAIL",
    detail: hasOrigin
      ? `Application origin is ${window.location.origin}.`
      : "The application does not expose a normal origin.",
  });

  return checks;
};

const deploymentChecks: ReleaseGateCheck[] = [
  {
    id: "E6-DEPLOY-CSP",
    area: "HTTP security headers",
    label: "Content-Security-Policy",
    status: "MANUAL",
    detail: "Verify the deployed /assessment response contains the intended CSP header from next.config.ts.",
  },
  {
    id: "E6-DEPLOY-HSTS",
    area: "HTTP security headers",
    label: "Strict-Transport-Security",
    status: "MANUAL",
    detail: "Verify production HTTPS responses contain HSTS with the configured max-age and includeSubDomains.",
  },
  {
    id: "E6-DEPLOY-FRAME",
    area: "HTTP security headers",
    label: "Clickjacking protection",
    status: "MANUAL",
    detail: "Verify X-Frame-Options: DENY and CSP frame-ancestors 'none' are present in production.",
  },
  {
    id: "E6-DEPLOY-CONTENT",
    area: "HTTP security headers",
    label: "Content-type / referrer protections",
    status: "MANUAL",
    detail: "Verify X-Content-Type-Options: nosniff and the configured Referrer-Policy are present.",
  },
  {
    id: "E6-DEPLOY-BUILD",
    area: "Build integrity",
    label: "Production build",
    status: "MANUAL",
    detail: "Run npm run build on the exact commit intended for production and confirm zero TypeScript/build errors.",
  },
  {
    id: "E6-DEPLOY-SECRETS",
    area: "Build integrity",
    label: "Client bundle secret review",
    status: "MANUAL",
    detail: "Confirm no API keys, private credentials, tokens, assessment payloads, or server secrets are embedded in the client bundle.",
  },
  {
    id: "E6-DEPLOY-DATAFLOW",
    area: "Data locality",
    label: "Production data-flow verification",
    status: "MANUAL",
    detail: "Use browser DevTools Network to confirm assessment responses are not transmitted to an application endpoint during normal assessment, autosave, import, or export.",
  },
  {
    id: "E6-DEPLOY-IMPORT",
    area: "Import security",
    label: "Malformed / oversized package testing",
    status: "MANUAL",
    detail: "Test corrupted JSON, oversized packages, unexpected properties, deep nesting, invalid identifiers, and unsupported values before release.",
  },
  {
    id: "E6-DEPLOY-OUTPUT",
    area: "Output security",
    label: "Export injection testing",
    status: "MANUAL",
    detail: "Test CSV formula prefixes, XML special characters, Markdown delimiters, unsafe filenames, and report anchor values using hostile input.",
  },
  {
    id: "E6-DEPLOY-DEPENDENCY",
    area: "Supply chain",
    label: "Dependency vulnerability review",
    status: "MANUAL",
    detail: "Run npm audit (or the organisation's approved dependency scanner) against the exact production lockfile and review high/critical findings.",
  },
];

export function runSecurityReleaseGate(): SecurityReleaseGateResult {
  const checks = [...checksForRuntime(), ...deploymentChecks];
  const automated = checks.filter((check) => check.status === "PASS" || check.status === "FAIL" || check.status === "WARN");
  const automatedFailed = automated.filter((check) => check.status === "FAIL").length;
  const manualChecks = checks.filter((check) => check.status === "MANUAL").length;

  const overall: SecurityReleaseGateResult["overall"] =
    automatedFailed > 0 ? "BLOCKED" : manualChecks > 0 ? "CONDITIONAL" : "READY";

  return {
    version: E6_VERSION,
    checks,
    automatedPassed: automated.filter((check) => check.status === "PASS").length,
    automatedFailed,
    manualChecks,
    overall,
    generatedAt: new Date().toISOString(),
  };
}

export function getE6ReleaseGateSummary(result: SecurityReleaseGateResult): string {
  if (result.overall === "READY") return "E6 Security Assurance Release Gate: READY";
  if (result.overall === "BLOCKED") return "E6 Security Assurance Release Gate: BLOCKED — resolve failed automated checks.";
  return "E6 Security Assurance Release Gate: CONDITIONAL — complete the deployment verification checklist before release sign-off.";
}
