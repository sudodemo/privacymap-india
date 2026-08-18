import Link from "next/link";
import DpdpReadinessTicker from "./assessment/components/DpdpReadinessTicker";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "56px 20px 80px",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "24px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "14px",
                fontWeight: 700,
                letterSpacing: "3px",
                color: "#1d4ed8",
                margin: 0,
              }}
            >
              PRIVACYMAP INDIA
            </p>
            <p
              style={{
                margin: "8px 0 0",
                color: "#64748b",
                fontSize: "13px",
                fontWeight: 700,
              }}
            >
              आत्मनिर्भर DPDP Assessment
            </p>
          </div>

          <DpdpReadinessTicker />
        </header>

        <section
          style={{
            marginTop: "34px",
            maxWidth: "820px",
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "8px 12px",
              borderRadius: "999px",
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              color: "#1e40af",
              fontSize: "13px",
              fontWeight: 700,
              marginBottom: "18px",
            }}
          >
            Your data. Your browser. Your assessment.
          </div>

          <h1
            style={{
              fontSize: "clamp(38px, 6vw, 52px)",
              lineHeight: 1.1,
              color: "#0f172a",
              margin: 0,
            }}
          >
            Discover where your business collects personal data.
          </h1>

          <p
            style={{
              fontSize: "20px",
              lineHeight: 1.7,
              color: "#475569",
              marginTop: "28px",
              marginBottom: 0,
            }}
          >
            Map your personal-data entry points, understand how information
            moves through your business, identify privacy risks, and create a
            practical data inventory. You don&apos;t need to login or save your
            assessment on the platform. Your assessment can remain in your
            browser locally, and you can export it for your reference.
          </p>

          <Link
            href="/assessment"
            style={{
              display: "inline-block",
              marginTop: "28px",
              background: "#1d4ed8",
              color: "white",
              borderRadius: "8px",
              padding: "14px 24px",
              fontSize: "16px",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Start Privacy Assessment
          </Link>
        </section>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
            marginTop: "64px",
          }}
        >
          <Feature
            title="Discover"
            text="Find the forms, apps, messages, systems and processes where personal data enters your organisation."
          />

          <Feature
            title="Map"
            text="Understand what data is collected, who handles it, where it is stored and who it is shared with."
          />

          <Feature
            title="Improve"
            text="Identify privacy risks and generate practical reports for management and compliance teams."
          />

          <Feature
            title="Secure"
            text="No need to login or save your assessment on the platform. Assessment responses can remain in your browser locally."
          />

          <Feature
            title="Trust"
            text="Built with Privacy and Security by Design. Export the assessment package or report for your own reference and improvement."
          />
        </div>

        <div
          style={{
            marginTop: "34px",
            padding: "18px 20px",
            background: "#ffffff",
            border: "1px solid #dbeafe",
            borderRadius: "12px",
            color: "#334155",
            lineHeight: 1.6,
            fontSize: "13px",
          }}
        >
          <strong>Why start now?</strong> The DPDP readiness countdown is a
          practical reminder to identify personal-data processing gaps before
          the reference readiness date. The countdown is a product planning
          aid and is not presented as a legal opinion or universal compliance
          deadline.
        </div>
      </div>
    </main>
  );
}

function Feature({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "26px",
      }}
    >
      <h2 style={{ color: "#0f172a", marginTop: 0 }}>{title}</h2>

      <p
        style={{
          color: "#475569",
          lineHeight: 1.7,
          marginBottom: 0,
        }}
      >
        {text}
      </p>
    </div>
  );
}
