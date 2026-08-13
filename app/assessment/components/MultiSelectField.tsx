import React from "react";

export default function MultiSelectField({ label, values, options, onToggle }: { label: string; values: string[]; options: string[]; onToggle: (value: string) => void }) {
  return <div style={{ marginBottom: "24px" }}>
    <label style={{ display: "block", fontWeight: 700, color: "#0f172a", marginBottom: "10px" }}>{label}</label>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "8px" }}>
      {options.map(option => {
        const selected = values.includes(option);
        return <label key={option} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 12px", border: selected ? "2px solid #1d4ed8" : "1px solid #cbd5e1", borderRadius: "8px", background: selected ? "#eff6ff" : "white", cursor: "pointer" }}>
          <input type="checkbox" checked={selected} onChange={() => onToggle(option)} style={{ width: "17px", height: "17px" }} />
          <span style={{ fontSize: "14px", color: "#334155" }}>{option}</span>
        </label>;
      })}
    </div>
    {values.length > 0 && <div style={{ marginTop: "8px", fontSize: "12px", color: "#64748b" }}>{values.length} selected</div>}
  </div>;
}
