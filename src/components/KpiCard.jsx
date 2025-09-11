export default function KpiCard({ title, value, selectorLabel, rightLogo }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.06)", padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ color: "#495057", fontSize: 14 }}>{title}</div>
        <div style={{ color: "#0f5132", fontSize: 28, fontWeight: 800 }}>{value}</div>
        <select style={{ border: "1px solid #e9ecef", borderRadius: 8, padding: "8px 10px", width: 180 }}>
          <option>{selectorLabel}</option>
        </select>
      </div>
      {rightLogo && <img src={rightLogo} alt="logo" style={{ height: 28 }} />}
    </div>
  );
}
