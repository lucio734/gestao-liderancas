import { motion } from "framer-motion";
import SectionCard from "./SectionCard";
import RegisterForm from "./RegisterForm";
import { stripEmojis, formatCurrencyBRL } from "../utils/format";

export default function AlunoDashboard({ user, teams, onRegister }) {
  const team = teams.find((t) => t.id === user.teamId);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 1200, margin: "0 auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionCard>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, color: "#0f5132" }}>{stripEmojis(team.name)} - {stripEmojis(user.name)}</h2>
          <div style={{ color: "#0f5132", fontWeight: 800 }}>Total: {formatCurrencyBRL(team.total)}</div>
        </div>
      </SectionCard>

      <SectionCard>
        <RegisterForm onSubmit={onRegister} />
      </SectionCard>

      <SectionCard>
        <div style={{ fontWeight: 700, marginBottom: 8, color: "#0f5132" }}>Histórico</div>
        <table width="100%" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "#495057" }}>
              <th style={{ padding: 8 }}>Data</th>
              <th style={{ padding: 8 }}>Atividade</th>
              <th style={{ padding: 8 }}>Valor</th>
              <th style={{ padding: 8 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {team.activities.map((a, i) => (
              <tr key={i} style={{ borderTop: "1px solid #e9ecef" }}>
                <td style={{ padding: 8 }}>{a.data}</td>
                <td style={{ padding: 8 }}>{stripEmojis(a.nome)}</td>
                <td style={{ padding: 8 }}>{a.tipo === "alimentos" ? `${a.valor} kg` : formatCurrencyBRL(a.valor)}</td>
                <td style={{ padding: 8 }}>{a.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
    </motion.div>
  );
}
