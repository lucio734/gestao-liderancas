export default function SectionCard({ children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.06)", padding: 16 }}>
      {children}
    </div>
  );
}
