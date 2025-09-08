import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  initializeDatabase,
  getAllTeams,
  getPendingActivities,
  getRecentActivities,
  authenticateUser,
  createUser,
  createActivity,
  updateActivityStatus,
  
} from "./database";

// === HELPERS ===
const formatNumberBR = (value, minFractionDigits = 0) =>
  Number(value).toLocaleString("pt-BR", { minimumFractionDigits: minFractionDigits });

const formatCurrencyBRL = (value) => `R$ ${formatNumberBR(value, 2)}`;

export default function App() {
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [pending, setPending] = useState([]);
  const [recent, setRecent] = useState([]);
  const [showRegister, setShowRegister] = useState(false);

  // === INICIALIZAR BANCO DE DADOS ===
  useEffect(() => {
    initializeDatabase();
    loadData();
  }, []);

  const loadData = () => {
    setTeams(getAllTeams());
    setPending(getPendingActivities());
    setRecent(getRecentActivities());
  };

  // === LOGIN COM BANCO DE DADOS ===
  const handleLogin = (email, password) => {
    const authenticatedUser = authenticateUser(email, password);
    if (authenticatedUser) {
      setUser(authenticatedUser);
      loadData();
    } else {
      alert("Email ou senha incorretos!");
    }
  };

  // === CADASTRO DE USUÁRIO ===
  const handleRegister = (userData) => {
    try {
      const newUser = createUser(userData);
      alert("Usuário cadastrado com sucesso!");
      setShowRegister(false);
      loadData();
    } catch (error) {
      alert("Erro ao cadastrar usuário: " + error.message);
    }
  };

  // === LOGOUT ===
  const handleLogout = () => setUser(null);

  // === REGISTRO DE DOAÇÃO (Aluno) ===
  const registerActivity = (activity) => {
    try {
      const team = teams.find(t => t.id === user.teamId);
      if (!team) {
        alert("Equipe não encontrada!");
        return;
      }

      const newActivity = createActivity({
        ...activity,
        teamId: user.teamId,
        teamName: team.name,
        userId: user.id
      });

      // Atualizar total da equipe se aprovada
      if (newActivity.status === "Aprovada") {
        const updatedTeams = teams.map(t => {
          if (t.id === user.teamId) {
            return { ...t, total: t.total + parseFloat(activity.valor) };
          }
          return t;
        });
        setTeams(updatedTeams);
      }

      loadData();
      alert("Atividade registrada com sucesso!");
    } catch (error) {
      alert("Erro ao registrar atividade: " + error.message);
    }
  };

  // === APROVAR OU REJEITAR (Mentor) ===
  const handleUpdateActivityStatus = (activityId, status, motivo = null) => {
    try {
      const updatedActivity = updateActivityStatus(activityId, status, motivo);
      
      if (updatedActivity && status === "Aprovada") {
        // Atualizar total da equipe
        const team = teams.find(t => t.id === updatedActivity.teamId);
        if (team) {
          const updatedTeams = teams.map(t => {
            if (t.id === updatedActivity.teamId) {
              return { ...t, total: t.total + parseFloat(updatedActivity.valor) };
            }
            return t;
          });
          setTeams(updatedTeams);
        }
      }

      loadData();
    } catch (error) {
      alert("Erro ao atualizar atividade: " + error.message);
    }
  };

  // === TELAS ===
  if (!user) {
    return showRegister ? 
      <RegisterScreen onRegister={handleRegister} onBackToLogin={() => setShowRegister(false)} /> :
      <LoginScreen onLogin={handleLogin} onShowRegister={() => setShowRegister(true)} />;
  }

  return (
    <div style={{ background: "#f8f9fa", minHeight: "100vh" }}>
      <NavBar user={user} onLogout={handleLogout} />
      {user.role === "aluno" && <AlunoDashboard user={user} teams={teams} onRegister={registerActivity} />}
      {user.role === "mentor" && <MentorDashboard user={user} teams={teams} pending={pending} updateActivityStatus={handleUpdateActivityStatus} />}
      {user.role === "admin" && <AdminDashboard teams={teams} recent={recent} />}
    </div>
  );
}

// === NAVBAR ===
function NavBar({ user, onLogout }) {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{
        width: "100%",
        background: "linear-gradient(90deg, #0f5132, #198754)",
        color: "#ffffff",
        padding: "14px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: "700",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      }}
    >
      <span>Gestão de Lideranças</span>
      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        <span style={{ opacity: 0.95 }}>{user.role.toUpperCase()} - {user.name}</span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          style={{
            backgroundColor: "#ffffff",
            color: "#0f5132",
            border: "none",
            padding: "8px 16px",
            borderRadius: "10px",
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
function LoginScreen({ onLogin, onShowRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#f8f9fa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 20px 40px rgba(0, 100, 0, 0.1)",
          padding: "60px 50px",
          maxWidth: "500px",
          width: "100%",
          textAlign: "center",
        }}
      >
        {/* Logos Section */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "40px",
            marginBottom: "40px",
          }}
        >
          <img
            src="/logos/liderancas-empaticas.png"
            alt="Lideranças Empáticas"
            style={{ width: 140, height: 140, objectFit: "contain", display: "block" }}
          />
          <img
            src="/logos/logo fecap.webp"
            alt="FECAP"
            style={{ width: 140, height: 140, objectFit: "contain", display: "block" }}
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          style={{
            color: "#006400",
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: "700",
            fontSize: "28px",
            marginBottom: "10px",
            margin: "0 0 10px 0",
          }}
        >
          Plataforma de Gestão
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          style={{
            color: "#666",
            fontSize: "16px",
            marginBottom: "40px",
            margin: "0 0 40px 0",
          }}
        >
          Sistema de Gestão de Lideranças Empáticas
        </motion.p>

        {/* Form */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: "15px 20px",
              borderRadius: "12px",
              border: "2px solid #e1e5e9",
              fontSize: "16px",
              fontFamily: "'Montserrat', sans-serif",
              backgroundColor: "#ffffff",
              color: "#333",
              outline: "none",
              transition: "border-color 0.3s ease",
            }}
            onFocus={(e) => e.target.style.borderColor = "#006400"}
            onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
          />

          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: "15px 20px",
              borderRadius: "12px",
              border: "2px solid #e1e5e9",
              fontSize: "16px",
              fontFamily: "'Montserrat', sans-serif",
              backgroundColor: "#ffffff",
              color: "#333",
              outline: "none",
              transition: "border-color 0.3s ease",
            }}
            onFocus={(e) => e.target.style.borderColor = "#006400"}
            onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
          />

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(0, 100, 0, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            style={{
              ...btnStyle,
              padding: "18px 30px",
              fontSize: "18px",
              borderRadius: "12px",
              marginTop: "10px",
              boxShadow: "0 5px 15px rgba(0, 100, 0, 0.2)",
              transition: "all 0.3s ease",
            }}
            onClick={() => onLogin(email, password)}
          >
            Entrar no Sistema
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              background: "transparent",
              color: "#006400",
              border: "2px solid #006400",
              padding: "12px 20px",
              borderRadius: "12px",
              fontSize: "16px",
              cursor: "pointer",
              fontWeight: "700",
              transition: "all 0.3s ease",
            }}
            onClick={onShowRegister}
          >
            Criar Conta
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// === REGISTER SCREEN
function RegisterScreen({ onRegister, onBackToLogin }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "aluno",
    teamId: 1
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }

    if (formData.password.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres!");
      return;
    }

    const { confirmPassword, ...userData } = formData;
    onRegister(userData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#f8f9fa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 20px 40px rgba(0, 100, 0, 0.1)",
          padding: "60px 50px",
          maxWidth: "560px",
          width: "100%",
          textAlign: "center",
        }}
      >
        {/* Logos Section */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "40px",
            marginBottom: "40px",
          }}
        >
          <img
            src="/logos/liderancas-empaticas.png"
            alt="Lideranças Empáticas"
            style={{ width: 140, height: 140, objectFit: "contain", display: "block" }}
          />
          <img
            src="/logos/logo fecap.webp"
            alt="FECAP"
            style={{ width: 140, height: 140, objectFit: "contain", display: "block" }}
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          style={{
            color: "#006400",
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: "700",
            fontSize: "28px",
            marginBottom: "10px",
            margin: "0 0 10px 0",
          }}
        >
          Criar Conta
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          style={{
            color: "#666",
            fontSize: "16px",
            marginBottom: "40px",
            margin: "0 0 40px 0",
          }}
        >
          Cadastre-se na plataforma
        </motion.p>

        {/* Form */}
        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          onSubmit={handleSubmit}
        >
          <input
            placeholder="Nome completo"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            style={{
              padding: "15px 20px",
              borderRadius: "12px",
              border: "2px solid #e1e5e9",
              fontSize: "16px",
              fontFamily: "'Montserrat', sans-serif",
              backgroundColor: "#ffffff",
              color: "#333",
              outline: "none",
              transition: "border-color 0.3s ease",
            }}
            onFocus={(e) => e.target.style.borderColor = "#006400"}
            onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
          />

          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            style={{
              padding: "15px 20px",
              borderRadius: "12px",
              border: "2px solid #e1e5e9",
              fontSize: "16px",
              fontFamily: "'Montserrat', sans-serif",
              backgroundColor: "#ffffff",
              color: "#333",
              outline: "none",
              transition: "border-color 0.3s ease",
            }}
            onFocus={(e) => e.target.style.borderColor = "#006400"}
            onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
          />

          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            style={{
              padding: "15px 20px",
              borderRadius: "12px",
              border: "2px solid #e1e5e9",
              fontSize: "16px",
              fontFamily: "'Montserrat', sans-serif",
              backgroundColor: "#ffffff",
              color: "#333",
              outline: "none",
              transition: "border-color 0.3s ease",
            }}
            onFocus={(e) => e.target.style.borderColor = "#006400"}
            onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
          >
            <option value="aluno">Aluno</option>
            <option value="mentor">Mentor</option>
            <option value="admin">Administrador</option>
          </select>

          <input
            type="password"
            placeholder="Senha"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            style={{
              padding: "15px 20px",
              borderRadius: "12px",
              border: "2px solid #e1e5e9",
              fontSize: "16px",
              fontFamily: "'Montserrat', sans-serif",
              backgroundColor: "#ffffff",
              color: "#333",
              outline: "none",
              transition: "border-color 0.3s ease",
            }}
            onFocus={(e) => e.target.style.borderColor = "#006400"}
            onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
          />

          <input
            type="password"
            placeholder="Confirmar senha"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
            style={{
              padding: "15px 20px",
              borderRadius: "12px",
              border: "2px solid #e1e5e9",
              fontSize: "16px",
              fontFamily: "'Montserrat', sans-serif",
              backgroundColor: "#ffffff",
              color: "#333",
              outline: "none",
              transition: "border-color 0.3s ease",
            }}
            onFocus={(e) => e.target.style.borderColor = "#006400"}
            onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
          />

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(0, 100, 0, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            style={{
              ...btnStyle,
              padding: "18px 30px",
              fontSize: "18px",
              borderRadius: "12px",
              marginTop: "10px",
              boxShadow: "0 5px 15px rgba(0, 100, 0, 0.2)",
              transition: "all 0.3s ease",
            }}
          >
            Criar Conta
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              background: "transparent",
              color: "#006400",
              border: "2px solid #006400",
              padding: "12px 20px",
              borderRadius: "12px",
              fontSize: "16px",
              cursor: "pointer",
              fontWeight: "700",
              transition: "all 0.3s ease",
            }}
            onClick={onBackToLogin}
          >
            Voltar ao Login
          </motion.button>
        </motion.form>
      </motion.div>
    </motion.div>
  );
}

// === DASHBOARD ALUNO
function AlunoDashboard({ user, teams, onRegister }) {
  const team = teams.find((t) => t.id === user.teamId);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 1200, margin: "0 auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionCard>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, color: "#0f5132" }}>{team.name} - {user.name}</h2>
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
                <td style={{ padding: 8 }}>{a.nome}</td>
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

// === DASHBOARD MENTOR
function MentorDashboard({ user, teams, pending, updateActivityStatus }) {
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
              <tr key={t.id} style={{ borderTop: "1px solid #e9ecef" }}><td style={{ padding: 8 }}>{t.name}</td><td style={{ padding: 8 }}>{formatCurrencyBRL(t.total)}</td></tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
    </motion.div>
  );
}

// === DASHBOARD ADMIN
function AdminDashboard({ teams, recent }) {
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
                <Tooltip />
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
                <Tooltip />
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
                <td style={{ padding: 8 }}>{t.name}</td>
                <td style={{ padding: 8 }}>{t.mentor}</td>
                <td style={{ padding: 8 }}>{formatCurrencyBRL(t.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function KpiCard({ title, value, selectorLabel, rightLogo }) {
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

// === FORM DE REGISTRO DE DOAÇÃO
function RegisterForm({ onSubmit }) {
  const [form, setForm] = useState({ tipo: "", nome: "", valor: "", data: new Date().toLocaleDateString() });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h3 style={{ margin: 0, color: "#0f5132" }}>Registrar Atividade da Semana</h3>

      <select
        onChange={(e) => setForm({ ...form, tipo: e.target.value })}
        style={{
          padding: "14px 16px",
          borderRadius: 10,
          border: "1px solid #e9ecef",
          background: "#fff",
          color: "#212529",
          outline: "none",
          transition: "border-color .2s ease",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#198754")}
        onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
      >
        <option value="">Selecione o tipo</option>
        <option value="alimentos">Arrecadação de Alimentos</option>
        <option value="fundos">Arrecadação de Fundos</option>
        <option value="evento">Evento/Bazar</option>
      </select>

      <input
        placeholder="Nome da Atividade"
        onChange={(e) => setForm({ ...form, nome: e.target.value })}
        style={{
          padding: "14px 16px",
          borderRadius: 10,
          border: "1px solid #e9ecef",
          background: "#fff",
          color: "#212529",
          outline: "none",
          transition: "border-color .2s ease",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#198754")}
        onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
      />

      {form.tipo === "alimentos" ? (
        <input
          type="number"
          placeholder="Peso em Kg"
          onChange={(e) => setForm({ ...form, valor: e.target.value })}
          style={{
            padding: "14px 16px",
            borderRadius: 10,
            border: "1px solid #e9ecef",
            background: "#fff",
            color: "#212529",
            outline: "none",
            transition: "border-color .2s ease",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#198754")}
          onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
        />
      ) : (
        <input
          type="number"
          placeholder="Valor Arrecadado (R$)"
          onChange={(e) => setForm({ ...form, valor: e.target.value })}
          style={{
            padding: "14px 16px",
            borderRadius: 10,
            border: "1px solid #e9ecef",
            background: "#fff",
            color: "#212529",
            outline: "none",
            transition: "border-color .2s ease",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#198754")}
          onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
        />
      )}

      <motion.button
        whileHover={{ scale: 1.01, boxShadow: "0 10px 25px rgba(25, 135, 84, .35)" }}
        whileTap={{ scale: 0.99 }}
        style={{
          background: "linear-gradient(90deg, #198754, #2ca06e)",
          color: "#fff",
          border: "none",
          padding: "14px 18px",
          borderRadius: 12,
          fontSize: 16,
          fontWeight: 800,
          cursor: "pointer",
          transition: "all .2s ease",
        }}
        onClick={() => onSubmit(form)}
      >
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

const smallBtn = {
  background: "#198754",
  color: "#fff",
  border: "none",
  padding: "8px 12px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
};

function SectionCard({ children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.06)", padding: 16 }}>
      {children}
    </div>
  );
}
