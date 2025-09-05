import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

// === MOCK DE DADOS INICIAIS ===
const mockTeams = [
  { id: 1, name: "Equipe Alpha", mentor: "Carlos", total: 0, activities: [] },
  { id: 2, name: "Equipe Beta", mentor: "Ana", total: 0, activities: [] },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState(mockTeams);
  const [pending, setPending] = useState([]);
  const [recent, setRecent] = useState([]);

  // === LOGIN FLEXÍVEL ===
  const handleLogin = (role, name, password) => {
    if (role === "aluno") setUser({ role, teamId: 1, name: name || "Aluno" });
    if (role === "mentor") setUser({ role, name: name || "Mentor", teamIds: [1] });
    if (role === "admin") setUser({ role, name: "Administrador" });
  };

  // === LOGOUT ===
  const handleLogout = () => setUser(null);

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

  return (
    <div>
      <NavBar user={user} onLogout={handleLogout} />
      {user.role === "aluno" && <AlunoDashboard user={user} teams={teams} onRegister={registerActivity} />}
      {user.role === "mentor" && <MentorDashboard user={user} teams={teams} pending={pending} updateActivityStatus={updateActivityStatus} />}
      {user.role === "admin" && <AdminDashboard teams={teams} recent={recent} />}
    </div>
  );
}

// === NAVBAR ===
function NavBar({ user, onLogout }) {
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (error) {
      // Silent fail; some browsers may block or throw
    }
  };

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{
        width: "100%",
        backgroundColor: "#006400",
        color: "#ffffff",
        padding: "12px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: "700",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <span>🌱 Gestão de Lideranças</span>
      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <span>{user.role.toUpperCase()} - {user.name}</span>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{
            backgroundColor: "#ffffff",
            color: "#006400",
            border: "none",
            padding: "8px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "700",
          }}
          onClick={toggleFullscreen}
        >
          {isFullscreen ? "Sair tela cheia" : "Tela cheia"}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{
            backgroundColor: "#ffffff",
            color: "#006400",
            border: "none",
            padding: "8px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "700",
          }}
          onClick={onLogout}
        >
          Sair
        </motion.button>
      </div>
    </motion.div>
  );
}

// === LOGIN SCREEN
function LoginScreen({ onLogin }) {
  const [role, setRole] = useState("aluno");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (error) {
      // Silent fail
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
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
      <motion.h1 initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
        Plataforma de Gestão
      </motion.h1>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        style={{
          backgroundColor: "#006400",
          color: "#ffffff",
          border: "none",
          padding: "8px 16px",
          borderRadius: "10px",
          cursor: "pointer",
          fontWeight: "700",
        }}
        onClick={toggleFullscreen}
      >
        {isFullscreen ? "Sair tela cheia" : "Tela cheia"}
      </motion.button>
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="aluno">Aluno</option>
        <option value="mentor">Mentor</option>
        <option value="admin">Administrador</option>
      </select>
      <input placeholder="Nome da equipe ou usuário" value={name} onChange={(e) => setName(e.target.value)} />
      <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={btnStyle}
        onClick={() => onLogin(role, name, password)}
      >
        Entrar
      </motion.button>
    </motion.div>
  );
}

// === DASHBOARD ALUNO
function AlunoDashboard({ user, teams, onRegister }) {
  const team = teams.find((t) => t.id === user.teamId);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: "20px", textAlign: "center" }}>
      <h2>{team.name} - {user.name}</h2>
      <motion.div whileHover={{ scale: 1.02 }} style={{ margin: "10px 0", padding: "10px", border: "1px solid #006400" }}>
        Total arrecadado: R$ {team.total}
      </motion.div>
      <RegisterForm onSubmit={onRegister} />
      <h3>Histórico</h3>
      <table border="1" cellPadding="6" width="100%">
        <thead>
          <tr><th>Data</th><th>Atividade</th><th>Valor</th><th>Status</th></tr>
        </thead>
        <tbody>
          {team.activities.map((a, i) => (
            <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <td>{a.data}</td>
              <td>{a.nome}</td>
              <td>{a.tipo === "alimentos" ? `${a.valor} kg` : `R$ ${a.valor}`}</td>
              <td>{a.status}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}

// === DASHBOARD MENTOR
function MentorDashboard({ user, teams, pending, updateActivityStatus }) {
  const myTeams = teams.filter((t) => user.teamIds.includes(t.id));
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: "20px" }}>
      <h2>Mentor {user.name}</h2>
      <h3>Atualizações Pendentes</h3>
      {pending.length === 0 && <p>Nenhuma pendente.</p>}
      {pending.map((p, i) => (
        <motion.div
          key={i}
          whileHover={{ scale: 1.02 }}
          style={{ border: "1px solid #ccc", margin: "5px 0", padding: "8px" }}
        >
          <p><b>{p.teamName}</b> - {p.nome} ({p.data})</p>
          <button onClick={() => updateActivityStatus(p.teamId, 0, "Aprovada")}>Aprovar</button>
          <button onClick={() => updateActivityStatus(p.teamId, 0, "Rejeitada", "Dados insuficientes")}>Rejeitar</button>
        </motion.div>
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
    </motion.div>
  );
}

// === DASHBOARD ADMIN
function AdminDashboard({ teams, recent }) {
  const total = teams.reduce((acc, t) => acc + t.total, 0);
  const COLORS = ["#006400", "#00a000", "#00c000", "#00e000"];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: "20px", textAlign: "center" }}>
      <h2>Dashboard do Administrador</h2>
      <motion.div style={{ display: "flex", gap: "12px", margin: "12px 0", justifyContent: "center" }}>
        <motion.div whileHover={{ scale: 1.05 }} style={{ border: "1px solid #006400", padding: "8px" }}>
          Total Arrecadado: R$ {total}
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} style={{ border: "1px solid #006400", padding: "8px" }}>
          Equipes Ativas: {teams.length}
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} style={{ border: "1px solid #006400", padding: "8px" }}>
          Atividades Registradas: {teams.reduce((acc, t) => acc + t.activities.length, 0)}
        </motion.div>
      </motion.div>

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
    </motion.div>
  );
}

// === FORM DE REGISTRO DE DOAÇÃO
function RegisterForm({ onSubmit }) {
  const [form, setForm] = useState({ tipo: "", nome: "", valor: "", data: new Date().toLocaleDateString() });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ border: "1px solid #006400", padding: "12px", margin: "12px 0" }}>
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
      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} style={btnStyle} onClick={() => onSubmit(form)}>
        Enviar para Aprovação
      </motion.button>
    </motion.div>
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
