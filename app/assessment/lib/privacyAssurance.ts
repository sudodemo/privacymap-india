export const PRIVACY_ASSURANCE_VERSION = "E5.1";

export const PRIVACY_ASSURANCE_STATEMENT =
  "PrivacyMap processes assessment responses locally in the browser. Assessment data is not intentionally uploaded to PrivacyMap servers.";

export interface PrivacyAssuranceCheck {
  id: string;
  label: string;
  status: "PASS" | "WARN" | "FAIL";
  detail: string;
}

export interface PrivacyAssuranceResult {
  checkedAt: string;
  checks: PrivacyAssuranceCheck[];
}

const ASSESSMENT_STORAGE_KEY = "privacymap.assessments.v1";

function bytesFor(value: string): number {
  try {
    return new Blob([value]).size;
  } catch {
    return value.length * 2;
  }
}

export function getAssessmentStorageKey(): string {
  return ASSESSMENT_STORAGE_KEY;
}

export function getLocalAssessmentStorageUsage(): number {
  if (typeof window === "undefined") return 0;

  try {
    return bytesFor(window.localStorage.getItem(ASSESSMENT_STORAGE_KEY) ?? "");
  } catch {
    return 0;
  }
}

export function clearLocalAssessmentData(): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(ASSESSMENT_STORAGE_KEY);
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Unable to clear local assessment data: ${error.message}`
        : "Unable to clear local assessment data."
    );
  }
}

function checkLocalStorage(): PrivacyAssuranceCheck {
  if (typeof window === "undefined") {
    return {
      id: "local-storage",
      label: "Assessment storage",
      status: "WARN",
      detail: "Browser storage is only available after the page loads in the browser.",
    };
  }

  const probeKey = "__privacymap_e5_probe__";

  try {
    window.localStorage.setItem(probeKey, "1");
    const readable = window.localStorage.getItem(probeKey) === "1";
    window.localStorage.removeItem(probeKey);

    return {
      id: "local-storage",
      label: "Assessment storage",
      status: readable ? "PASS" : "FAIL",
      detail: readable
        ? "Browser-local storage is available for the local assessment lifecycle."
        : "Browser-local storage could not be verified.",
    };
  } catch {
    return {
      id: "local-storage",
      label: "Assessment storage",
      status: "FAIL",
      detail: "Browser-local storage is unavailable or blocked.",
    };
  }
}

function checkSecureContext(): PrivacyAssuranceCheck {
  if (typeof window === "undefined") {
    return {
      id: "secure-context",
      label: "Secure browser context",
      status: "WARN",
      detail: "Secure-context status is checked in the browser.",
    };
  }

  const isLocalDevelopment =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "[::1]";

  const secure = window.isSecureContext || isLocalDevelopment;

  return {
    id: "secure-context",
    label: "Secure browser context",
    status: secure ? "PASS" : "FAIL",
    detail: secure
      ? "The assessment is running in a secure browser context."
      : "The assessment is not running in a secure browser context.",
  };
}

function checkUrlDataExposure(): PrivacyAssuranceCheck {
  if (typeof window === "undefined") {
    return {
      id: "url-data",
      label: "URL data exposure",
      status: "WARN",
      detail: "URL inspection is only available in the browser.",
    };
  }

  const query = window.location.search;
  const suspiciousKeys = /(?:assessment|report|evidence|finding|personal.?data|email|phone|name|token|secret|password)=/i;

  return {
    id: "url-data",
    label: "URL data exposure",
    status: suspiciousKeys.test(query) ? "WARN" : "PASS",
    detail: suspiciousKeys.test(query)
      ? "The current URL contains a parameter that may represent assessment or sensitive data. Do not place assessment responses in URLs."
      : "No obvious assessment-data parameter was detected in the current URL.",
  };
}

function checkThirdPartyResources(): PrivacyAssuranceCheck {
  if (typeof window === "undefined") {
    return {
      id: "third-party-resources",
      label: "Third-party resources",
      status: "WARN",
      detail: "Resource inspection is only available in the browser.",
    };
  }

  const currentOrigin = window.location.origin;
  const resources = Array.from(
    document.querySelectorAll("script[src], iframe[src], img[src], link[href]")
  );
  const externalOrigins = new Set<string>();

  for (const element of resources) {
    const raw = element.getAttribute("src") ?? element.getAttribute("href");
    if (!raw) continue;

    try {
      const url = new URL(raw, window.location.href);
      if (url.origin !== currentOrigin) externalOrigins.add(url.origin);
    } catch {
      // Ignore non-URL resource references.
    }
  }

  return {
    id: "third-party-resources",
    label: "Third-party resources",
    status: externalOrigins.size === 0 ? "PASS" : "WARN",
    detail:
      externalOrigins.size === 0
        ? "No external script, iframe, image or stylesheet origins were detected by the browser self-check."
        : `External browser resources detected: ${Array.from(externalOrigins).join(", ")}. This does not by itself mean assessment data is transmitted.`,
  };
}

export function runPrivacyAssuranceCheck(): PrivacyAssuranceResult {
  return {
    checkedAt: new Date().toISOString(),
    checks: [
      checkLocalStorage(),
      checkSecureContext(),
      checkUrlDataExposure(),
      checkThirdPartyResources(),
    ],
  };
}

export function formatStorageUsage(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
