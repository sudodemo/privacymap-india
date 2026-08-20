import Link from "next/link";
import DpdpReadinessTicker, {
  DpdpEnforcementTimeline,
} from "./assessment/components/DpdpReadinessTicker";

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc", padding: "56px 20px 80px", fontFamily: "Arial, Helvetica, sans-serif" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <section style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 20, padding: "36px clamp(22px, 5vw, 56px) 42px", boxShadow: "0 12px 30px rgba(15, 23, 42, 0.05)" }}>
          <header style={{ textAlign: "center" }}>
            <p style={{ fontSize: 14, fontWeight: 800, letterSpacing: 3, color: "#1d4ed8", margin: 0 }}>PRIVACYMAP INDIA</p>
            <p style={{ margin: "8px 0 0", color: "#64748b", fontSize: 14, fontWeight: 700 }}>आत्मनिर्भर DPDP Assessment</p>
          </header>

          <div style={{ maxWidth: 820, margin: "30px auto 0", textAlign: "center" }}>
            <h1 style={{ fontSize: "clamp(36px, 6vw, 52px)", lineHeight: 1.08, color: "#0f172a", margin: 0 }}>Prepare your organisation for DPDP readiness.</h1>
            <p style={{ fontSize: 18, lineHeight: 1.65, color: "#475569", margin: "18px auto 0", maxWidth: 700 }}>Discover how personal data moves through your organisation, identify privacy risks, and build a practical readiness plan.</p>
          </div>

          <div style={{ maxWidth: 620, margin: "28px auto 0" }}><DpdpReadinessTicker /></div>

          <div style={{ textAlign: "center" }}>
            <Link href="/assessment" style={{ display: "inline-block", marginTop: 24, background: "#1d4ed8", color: "white", borderRadius: 9, padding: "14px 26px", fontSize: 16, fontWeight: 800, textDecoration: "none" }}>Start New Assessment</Link>
            <p style={{ margin: "14px 0 0", color: "#475569", fontSize: 14, fontWeight: 700 }}>Your assessment. Your browser. Your control.</p>
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
            <Link href="/faq" style={{ color: "#1d4ed8", fontSize: 14, fontWeight: 800, textDecoration: "none" }}>FAQ & Terminology</Link>
          </div>
        </section>

        <DpdpEnforcementTimeline />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginTop: 42 }}>
          <Feature title="Discover" text="Find the forms, apps, messages, systems and processes where personal data enters your organisation." />
          <Feature title="Map" text="Understand what data is collected, who handles it, where it is stored and who it is shared with." />
          <Feature title="Improve" text="Identify privacy risks and generate practical reports for management and compliance teams." />
          <Feature title="Secure" text="No need to login or save your assessment on the platform. Assessment responses can remain in your browser locally." />
          <Feature title="Trust" text="Built with Privacy and Security by Design. Export the assessment package or report for your own reference and improvement." />
        </div>

        <div style={{ marginTop: 34, padding: "18px 20px", background: "#ffffff", border: "1px solid #dbeafe", borderRadius: 12, color: "#334155", lineHeight: 1.6, fontSize: 13 }}><strong>Why start now?</strong> The DPDP readiness countdown is a practical reminder to identify personal-data processing gaps before the reference readiness date. The countdown is a product planning aid and is not presented as a legal opinion or universal compliance deadline.</div>
      </div>
    </main>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "26px" }}><h2 style={{ color: "#0f172a", marginTop: 0 }}>{title}</h2><p style={{ color: "#475569", lineHeight: 1.7, marginBottom: 0 }}>{text}</p></div>;
}
