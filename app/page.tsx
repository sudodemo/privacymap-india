export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "80px 24px",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <div style={{ maxWidth: "760px" }}>
          <p
            style={{
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: "3px",
              color: "#1d4ed8",
              marginBottom: "20px",
            }}
          >
            PRIVACYMAP INDIA
          </p>

          <h1
            style={{
              fontSize: "52px",
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
            }}
          >
            Map your personal-data entry points, understand how information
            moves through your business, identify privacy risks, and create a
            practical data inventory.
          </p>

          <button
            style={{
              marginTop: "28px",
              background: "#1d4ed8",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "14px 24px",
              fontSize: "16px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Start Privacy Assessment
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "24px",
            marginTop: "80px",
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
        padding: "28px",
      }}
    >
      <h2 style={{ color: "#0f172a", marginTop: 0 }}>{title}</h2>

      <p
        style={{
          color: "#475569",
          lineHeight: 1.7,
        }}
      >
        {text}
      </p>
    </div>
  );
}
