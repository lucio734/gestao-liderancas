import { useState } from "react";
import { motion } from "framer-motion";

// Mock data inicial
const mockTeams = [
  { id: 1, name: "Equipe Alpha", mentor: "Carlos", total: 0, activities: [] },
  { id: 2, name: "Equipe Beta", mentor: "Ana", total: 0, activities: [] },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState(mockTeams);

  // Função para login rápido (temporário, até colocarmos senha e grupo)
  const loginAs = (role) => {
    if (role === "aluno") setUser({ role, teamId: 1, name: "João" });
    if (role === "mentor") setUser({ role, name: "Carlos", teamIds: [1] });
    if (role === "admin") setUser({ role, name: "Administrador" });
  };

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
        padding: "20px",
      }}
    >
      {!user && (
        <>
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            Plataforma de Gestão Lideranças Empáticas
          </motion.h1>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            style={btnStyle}
            onClick={() => loginAs("aluno")}
          >
            Logar como Aluno
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            style={btnStyle}
            onClick={() => loginAs("mentor")}
          >
            Logar como Mentor
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            style={btnStyle}
            onClick={() => loginAs("admin")}
          >
            Logar como Administrador
          </motion.button>
        </>
      )}

      {user && (
        <motion.h2
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Bem-vindo, {user.name}! ({user.role})
        </motion.h2>
      )}
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
