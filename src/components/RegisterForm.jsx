import { useState } from "react";
import { motion } from "framer-motion";

export default function RegisterForm({ onSubmit }) {
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
