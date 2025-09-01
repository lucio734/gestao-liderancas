import { useState } from "react";

// Mock data inicial
const mockTeams = [
  { id: 1, name: "Equipe Alpha", mentor: "Carlos", total: 0, activities: [] },
  { id: 2, name: "Equipe Beta", mentor: "Ana", total: 0, activities: [] },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState(mockTeams);
  const [pending, setPending] = useState([]);
  const [recent, setRecent] = useState([]);

  // Função para login rápido (mock)
  const loginAs = (role) => {
    if (role === "aluno") setUser({ role, teamId: 1, name: "João" });
    if (role === "mentor") setUser({ role, name: "Carlos", teamIds: [1] });
    if (role === "admin") setUser({ role, name: "Administrador" });
  };

  // Registrar atividade (Aluno)
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
    setPending([...pending, { ...activity, teamId: user.teamId, teamName: "Equipe Alpha" }]);
  };

  // Aprovar ou rejeitar atividade (Mentor)
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
  if (!user) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: "12px" }}>
        <h1>Plataforma de Gestão Lideranças Empáticas</h1>
        <button onClick={() => loginAs("aluno")}>Logar como Aluno</button>
        <button onClick={() => loginAs("mentor")}>Logar como Mentor</button>
        <button onClick={() => loginAs("admin")}>Logar como Administrador</button>
        <p style={{ marginTop: "20px", maxWidth: "400px", textAlign: "center", fontSize: "14px", color: "#555" }}>
          💡 Para publicar este projeto online de forma gratuita, você pode usar o <b>Vercel</b> ou o <b>Netlify</b>. Basta criar uma conta, conectar seu repositório do GitHub onde está este código e clicar em "Deploy". Em poucos segundos, você terá um link acessível para compartilhar com qualquer pessoa.
        </p>
      </div>
    );
  }

  // === DASHBOARD ALUNO ===
  if (user.role === "aluno") {
    const team = teams.find((t) => t.id === user.teamId);
    return (
      <div style={{ padding: "20px" }}>
        <h2>{team.name} - {user.name}</h2>
        <div style={{ margin: "10px 0", padding: "10px", border: "1px solid #ccc" }}>
          Total arrecadado: R$ {team.total}
        </div>
        <RegisterForm onSubmit={registerActivity} />
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
                <td>R$ {a.valor}</td>
                <td>{a.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // === DASHBOARD MENTOR ===
  if (user.role === "mentor") {
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

  // === DASHBOARD ADMIN ===
  if (user.role === "admin") {
    const total = teams.reduce((acc, t) => acc + t.total, 0);
    return (
      <div style={{ padding: "20px" }}>
        <h2>Dashboard do Administrador</h2>
        <div style={{ display: "flex", gap: "12px", margin: "12px 0" }}>
          <div style={{ border: "1px solid #ccc", padding: "8px" }}>Total Arrecadado: R$ {total}</div>
          <div style={{ border: "1px solid #ccc", padding: "8px" }}>Equipes Ativas: {teams.length}</div>
          <div style={{ border: "1px solid #ccc", padding: "8px" }}>Atividades Registradas: {teams.reduce((acc, t) => acc + t.activities.length, 0)}</div>
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
        <h3>Atividades Recentes</h3>
        <ul>
          {recent.map((r, i) => (
            <li key={i}>{r.teamName} - {r.nome} (R$ {r.valor})</li>
          ))}
        </ul>
      </div>
    );
  }
}

// === FORMULÁRIO DE REGISTRO (Aluno) ===
function RegisterForm({ onSubmit }) {
  const [form, setForm] = useState({ tipo: "", nome: "", valor: "", data: new Date().toLocaleDateString() });

  return (
    <div style={{ border: "1px solid #ccc", padding: "12px", margin: "12px 0" }}>
      <h3>Registrar Atividade da Semana</h3>
      <select onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
        <option value="">Selecione o tipo</option>
        <option value="alimentos">Arrecadação de Alimentos</option>
        <option value="fundos">Arrecadação de Fundos</option>
        <option value="evento">Evento/Bazar</option>
        <option value="outro">Outro</option>
      </select>
      <br />
      <input placeholder="Nome da Atividade" onChange={(e) => setForm({ ...form, nome: e.target.value })} />
      <br />
      <input type="number" placeholder="Valor Arrecadado (R$)" onChange={(e) => setForm({ ...form, valor: e.target.value })} />
      <br />
      <button onClick={() => onSubmit(form)}>Enviar para Aprovação</button>
    </div>
  );
}
