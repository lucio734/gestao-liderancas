import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
} from "recharts";
import KpiCard from "./KpiCard";
import { formatCurrencyBRL, formatNumberBR, stripEmojis } from "../utils/format";

export default function AdminDashboard({ teams, recent }) {
  const total = teams.reduce((acc, t) => acc + t.total, 0);
  const COLORS = ["#006400", "#0E7A0D", "#1E9E1B", "#2ECF25", "#65DB6B"];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{
        width: "100%",
        background: "linear-gradient(90deg, #0f5132, #198754)",
        color: "#fff",
        borderRadius: "14px",
        padding: "28px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 34, fontWeight: 800 }}>Resultados das Últimas Edições</div>
          <div style={{ opacity: 0.9 }}>Baixe os relatórios das últimas edições</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <img src="/logos/liderancas-empaticas.png" alt="Lideranças Empáticas" style={{ height: 64 }} />
          <img src="/logos/logo fecap.webp" alt="FECAP" style={{ height: 42 }} />
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <KpiCard title="Arrecadação Total em Kg" value={formatNumberBR(total, 2)} selectorLabel="Edição" />
        <KpiCard title="Arrecadação Média | Edição" value={formatNumberBR(total / Math.max(teams.length, 1), 2)} selectorLabel="Semestre" />
        <KpiCard title="Pessoas Atendidas | 6 Meses" value={formatNumberBR(1300)} selectorLabel="Selecionar período" rightLogo="/logos/logo fecap.webp" />
      </div>

      {/* Charts Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Left: Pie */}
        <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.06)", padding: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 8, color: "#0f5132" }}>Distribuição por Equipe</div>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={teams} dataKey="total" nameKey="name" outerRadius={120} label>
                  {teams.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <ReTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Bar */}
        <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.06)", padding: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 8, color: "#0f5132" }}>Arrecadação Total</div>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={teams}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ReTooltip />
                <Bar dataKey="total" fill="#198754" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table: Ranking */}
      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.06)", padding: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 8, color: "#0f5132" }}>Ranking de Equipes</div>
        <table width="100%" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "#495057" }}>
              <th style={{ padding: 8 }}>#</th>
              <th style={{ padding: 8 }}>Equipe</th>
              <th style={{ padding: 8 }}>Mentor</th>
              <th style={{ padding: 8 }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {teams.slice().sort((a, b) => b.total - a.total).map((t, i) => (
              <tr key={t.id} style={{ borderTop: "1px solid #e9ecef" }}>
                <td style={{ padding: 8 }}>{i + 1}</td>
                <td style={{ padding: 8 }}>{stripEmojis(t.name)}</td>
                <td style={{ padding: 8 }}>{stripEmojis(t.mentor)}</td>
                <td style={{ padding: 8 }}>{formatCurrencyBRL(t.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
