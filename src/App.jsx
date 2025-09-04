import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

// === MOCK DE DADOS INICIAIS ===
const mockTeams = [
  { id: 1, name: "Equipe Alpha", mentor: "Carlos", password: "123", total: 0, activities: [] },
  { id: 2, name: "Equipe Beta", mentor: "Ana", password: "123", total: 0, activities: [] },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState(mockTeams);
  const [pending, setPending] = useState([]);
  const [recent, setRecent] = useState([]);

  // === LOGIN ===
  const handleLogin = (role, name, password) => {
    if (role === "aluno") {
      const team = teams.find((t) => t.name.toLowerCase() === name.toLowerCase() && t.password === password);
      if (team) setUser({ role, teamId: team.id, name: "Aluno" });
      else alert("Equipe ou senha inválida!");
    }
    if (role === "mentor") {
      const mentorTeam = teams.find((t) => t.mentor.toLowerCase() === name.toLowerCase() && t.password === password);
      if (mentorTeam) setUser({ role, name, teamIds: [mentorTeam.id] });
      else alert("Mentor ou senha inválida!");
    }
    if (role === "admin") {
      if (name === "admin" && password === "123") setUser({ role, name: "Administrador" });
      else alert("Credenciais de administrador inválidas!");
    }
  };

  // === REGISTRO DE DOAÇÃO (Aluno) ===
  const registerActivity = (activity) => {
    const updatedTeams = teams.map((team) => {
      if (team.id === user.teamId) {
        return {
          ...team,
          activities: [...team.activities, { ...activity, status: "Pendente" }],
        };
      }
      return team;
    });
    setTeams(updatedTeams);
    setPending([...pending, { ...activity, teamId: user.teamId, teamName: teams.find((t) => t.id === user.teamId).name }]);
  };

  // === APROVAR OU REJEITAR (Mentor) ===
  const updateActivityStatus = (teamId, index, status, motivo = null) => {
    const updatedTeams = teams.map((team) => {
      if (team.id === teamId) {
        const newActivities = [...team.activities];
        newActivities[index].status = status;
        if (status === "Aprovada") {
          team.total += parseFloat(newActivities[index].valor);
          setRecent([{ ...newActivities[index], teamName: team.name }, ...recent]);
        }
        if (status === "Rejeitada") newActivities[index].motivo = motivo;
        return { ...team, activities: newActivities };
      }
      return team;
    });
    setTeams(updatedTeams);
    setPending(pending.filter((p) => p.teamId !== teamId));
  };

  // === TELAS ===
  if (!user) return <LoginScreen onLogin={handleLogin} />;

  if (user.role === "aluno") return <AlunoDashboard user={user} teams={teams} onRegister={registerActivity} />;
  if (user.role === "mentor") return <MentorDashboard user={user} teams={teams} pending={pending} updateActivityStatus={updateActivityStatus} />;
  if (user.role === "admin") return <AdminDashboard teams={teams} recent={recent} />;

  return null;
}

// === COMPONENTES ===

// LOGIN SCREEN
function LoginScreen({ onLogin }) {
  const [role, setRole] = useState("aluno");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        color: "#006400",
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: "700",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        textAlign: "center",
      }}
    >
      <h1>Plataforma de Gestão</h1>
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="aluno">Aluno</option>
        <option value="mentor">Mentor</option>
        <option value="admin">Administrador</option>
      </select>
      <input placeholder="Nome da equipe ou usuário" value={name} onChange={(e) => setName(e.target.value)} />
      <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} style={btnStyle} onClick={() => onLogin(role, name, password)}>
        Entrar
      </motion.button>
    </motion.div>
  );
}

// DASHBOARD ALUNO
function AlunoDashboard({ user, teams, onRegister }) {
  const team = teams.find((t) => t.id === user.teamId);
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>{team.name} - {user.name}</h2>
      <div style={{ margin: "10px 0", padding: "10px", border: "1px solid #006400" }}>
        Total arrecadado: R$ {team.total}
      </div>
      <RegisterForm onSubmit={onRegister} />
      <h3>Histórico</h3>
      <table border="1" cellPadding="6" width="100%">
        <thead>
          <tr><th>Data</th><th>Atividade</th><th>Valor</th><th>Status</th></tr>
        </thead>
        <tbody>
          {team.activities.map((a, i) => (
            <tr key={i}>
              <td>{a.data}</td>
              <td>{a.nome}</td>
              <td>{a.tipo === "alimentos" ? `${a.valor} kg` : `R$ ${a.valor}`}</td>
              <td>{a.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// DASHBOARD MENTOR
function MentorDashboard({ user, teams, pending, updateActivityStatus }) {
  const myTeams = teams.filter((t) => user.teamIds.includes(t.id));
  return (
    <div style={{ padding: "20px" }}>
      <h2>Mentor {user.name}</h2>
      <h3>Atualizações Pendentes</h3>
      {pending.length === 0 && <p>Nenhuma pendente.</p>}
      {pending.map((p, i) => (
        <div key={i} style={{ border: "1px solid #ccc", margin: "5px 0", padding: "8px" }}>
          <p><b>{p.teamName}</b> - {p.nome} ({p.data})</p>
          <button onClick={() => updateActivityStatus(p.teamId, 0, "Aprovada")}>Aprovar</button>
          <button onClick={() => updateActivityStatus(p.teamId, 0, "Rejeitada", "Dados insuficientes")}>Rejeitar</button>
        </div>
      ))}
      <h3>Visão Geral</h3>
      <table border="1" cellPadding="6" width="100%">
        <thead><tr><th>Equipe</th><th>Total</th></tr></thead>
        <tbody>
          {myTeams.map((t) => (
            <tr key={t.id}><td>{t.name}</td><td>R$ {t.total}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// DASHBOARD ADMIN
function AdminDashboard({ teams, recent }) {
  const total = teams.reduce((acc, t) => acc + t.total, 0);
  const COLORS = ["#006400", "#00a000", "#00c000", "#00e000"];

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Dashboard do Administrador</h2>
      <div style={{ display: "flex", gap: "12px", margin: "12px 0", justifyContent: "center" }}>
        <div style={{ border: "1px solid #006400", padding: "8px" }}>Total Arrecadado: R$ {total}</div>
        <div style={{ border: "1px solid #006400", padding: "8px" }}>Equipes Ativas: {teams.length}</div>
        <div style={{ border: "1px solid #006400", padding: "8px" }}>Atividades Registradas: {teams.reduce((acc, t) => acc + t.activities.length, 0)}</div>
      </div>

      <h3>Ranking de Equipes</h3>
      <table border="1" cellPadding="6" width="100%">
        <thead><tr><th>#</th><th>Equipe</th><th>Mentor</th><th>Total</th></tr></thead>
        <tbody>
          {teams.sort((a, b) => b.total - a.total).map((t, i) => (
            <tr key={t.id}>
              <td>{i + 1}</td><td>{t.name}</td><td>{t.mentor}</td><td>R$ {t.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Gráfico de Totais</h3>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={teams}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#006400" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h3>Distribuição por Equipe</h3>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={teams} dataKey="total" nameKey="name" outerRadius={120} label>
              {teams.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <h3>Atividades Recentes</h3>
      <ul>
        {recent.map((r, i) => (
          <li key={i}>{r.teamName} - {r.nome} ({r.tipo === "alimentos" ? `${r.valor} kg` : `R$ ${r.valor}`})</li>
        ))}
      </ul>
    </div>
  );
}

// FORM DE REGISTRO DE DOAÇÃO
function RegisterForm({ onSubmit }) {
  const [form, setForm] = useState({ tipo: "", nome: "", valor: "", data: new Date().toLocaleDateString() });

  return (
    <div style={{ border: "1px solid #006400", padding: "12px", margin: "12px 0" }}>
      <h3>Registrar Atividade da Semana</h3>
      <select onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
        <option value="">Selecione o tipo</option>
        <option value="alimentos">Arrecadação de Alimentos</option>
        <option value="fundos">Arrecadação de Fundos</option>
        <option value="evento">Evento/Bazar</option>
      </select>
      <br />
      <input placeholder="Nome da Atividade" onChange={(e) => setForm({ ...form, nome: e.target.value })} />
      <br />
      {form.tipo === "alimentos" ? (
        <input type="number" placeholder="Peso em Kg" onChange={(e) => setForm({ ...form, valor: e.target.value })} />
      ) : (
        <input type="number" placeholder="Valor Arrecadado (R$)" onChange={(e) => setForm({ ...form, valor: e.target.value })} />
      )}
      <br />
      <button onClick={() => onSubmit(form)}>Enviar para Aprovação</button>
    </div>
  );
}

const btnStyle = {
  backgroundColor: "#006400",
  color: "#ffffff",
  border: "none",
  padding: "12px 20px",
  borderRadius: "12px",
  fontSize: "16px",
  cursor: "pointer",
  fontWeight: "700",
};
