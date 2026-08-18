export const PRIVACY_ASSURANCE_VERSION = "E5.1";

export const PRIVACY_ASSURANCE_STATEMENT =
  "PrivacyMap processes your assessment in your browser. Your assessment information is not intentionally uploaded to PrivacyMap servers.";

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
const EXPECTED_EXTERNAL_ORIGINS = new Set(["https://vercel.live"]);

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
      label: "Saving your assessment",
      status: "WARN",
      detail: "Your browser's storage can only be checked after the page has loaded.",
    };
  }

  const probeKey = "__privacymap_e5_probe__";

  try {
    window.localStorage.setItem(probeKey, "1");
    const readable = window.localStorage.getItem(probeKey) === "1";
    window.localStorage.removeItem(probeKey);

    return {
      id: "local-storage",
      label: "Saving your assessment",
      status: readable ? "PASS" : "FAIL",
      detail: readable
        ? "Your browser can save your assessment on this device."
        : "Your browser is currently preventing PrivacyMap from saving your assessment on this device.",
    };
  } catch {
    return {
      id: "local-storage",
      label: "Saving your assessment",
      status: "FAIL",
      detail: "Your browser is currently preventing PrivacyMap from saving your assessment on this device.",
    };
  }
}

function checkSecureContext(): PrivacyAssuranceCheck {
  if (typeof window === "undefined") {
    return {
      id: "secure-context",
      label: "Secure connection",
      status: "WARN",
      detail: "Your connection can only be checked after the page has loaded.",
    };
  }

  const isLocalDevelopment =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "[::1]";

  const secure = window.isSecureContext || isLocalDevelopment;

  return {
    id: "secure-context",
    label: "Secure connection",
    status: secure ? "PASS" : "FAIL",
    detail: secure
      ? "You are using a secure connection to PrivacyMap."
      : "PrivacyMap cannot confirm that this connection is secure. Please open PrivacyMap using HTTPS.",
  };
}

function checkUrlDataExposure(): PrivacyAssuranceCheck {
  if (typeof window === "undefined") {
    return {
      id: "url-data",
      label: "Assessment privacy",
      status: "WARN",
      detail: "Your web address can only be checked after the page has loaded.",
    };
  }

  const query = window.location.search;
  const suspiciousKeys = /(?:assessment|report|evidence|finding|personal.?data|email|phone|name|token|secret|password)=/i;
  const exposed = suspiciousKeys.test(query);

  return {
    id: "url-data",
    label: "Assessment privacy",
    status: exposed ? "WARN" : "PASS",
    detail: exposed
      ? "Some information in the web address may represent assessment or sensitive data. Please return to the assessment page and do not place assessment responses in the web address."
      : "Your assessment information is not included in the web address.",
  };
}

function checkThirdPartyResources(): PrivacyAssuranceCheck {
  if (typeof window === "undefined") {
    return {
      id: "third-party-resources",
      label: "Browser connection check",
      status: "WARN",
      detail: "Additional browser services can only be checked after the page has loaded.",
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

  const unexpectedOrigins = Array.from(externalOrigins).filter(
    (origin) => !EXPECTED_EXTERNAL_ORIGINS.has(origin)
  );

  return {
    id: "third-party-resources",
    label: "Browser connection check",
    status: unexpectedOrigins.length === 0 ? "PASS" : "WARN",
    detail:
      unexpectedOrigins.length === 0
        ? "Your browser is using the expected services for this page."
        : "PrivacyMap detected an additional website service being used by this page. This does not mean your assessment information has been shared.",
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
