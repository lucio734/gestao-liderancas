import { motion } from "framer-motion";
import SectionCard from "./SectionCard";
import { stripEmojis, formatCurrencyBRL } from "../utils/format";
import { smallBtn } from "../utils/styles";

export default function MentorDashboard({ user, teams, pending, updateActivityStatus }) {
  const myTeams = teams.filter((t) => user.teamIds.includes(t.id));
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 1200, margin: "0 auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionCard>
        <h2 style={{ margin: 0, color: "#0f5132" }}>Mentor {user.name}</h2>
      </SectionCard>

      <SectionCard>
        <div style={{ fontWeight: 700, marginBottom: 8, color: "#0f5132" }}>Atualizações Pendentes</div>
        {pending.length === 0 && <p style={{ margin: 0, color: "#495057" }}>Nenhuma pendente.</p>}
        {pending.map((p, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, border: "1px solid #e9ecef", borderRadius: 8, marginBottom: 8 }}>
            <div><b>{p.teamName}</b> - {p.nome} ({p.data})</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={smallBtn} onClick={() => updateActivityStatus(p.id, "Aprovada")}>Aprovar</button>
              <button style={{ ...smallBtn, background: "#dc3545" }} onClick={() => updateActivityStatus(p.id, "Rejeitada", "Dados insuficientes")}>Rejeitar</button>
            </div>
          </div>
        ))}
      </SectionCard>

      <SectionCard>
        <div style={{ fontWeight: 700, marginBottom: 8, color: "#0f5132" }}>Visão Geral</div>
        <table width="100%" style={{ borderCollapse: "collapse" }}>
          <thead><tr style={{ textAlign: "left", color: "#495057" }}><th style={{ padding: 8 }}>Equipe</th><th style={{ padding: 8 }}>Total</th></tr></thead>
          <tbody>
            {myTeams.map((t) => (
              <tr key={t.id} style={{ borderTop: "1px solid #e9ecef" }}><td style={{ padding: 8 }}>{stripEmojis(t.name)}</td><td style={{ padding: 8 }}>{formatCurrencyBRL(t.total)}</td></tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
    </motion.div>
  );
}
