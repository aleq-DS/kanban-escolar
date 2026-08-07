import React, { useState, useEffect } from "react";

function LinhaDocente({ usuarioItem, listaEscolas, onSalvarProfessor, onExcluir }) {
  const [escolasSelecionadas, setEscolasSelecionadas] = useState(usuarioItem.escolas || []);

  useEffect(() => {
    setEscolasSelecionadas(usuarioItem.escolas || []);
  }, [usuarioItem]);

  const toggleEscola = (escolaId) => {
    setEscolasSelecionadas((prev) =>
      prev.includes(escolaId)
        ? prev.filter((id) => id !== escolaId)
        : [...prev, escolaId]
    );
  };

  return (
    <tr style={{ borderBottom: "1px solid #f4f5f7" }}>
      <td style={{ padding: "12px 10px", fontWeight: "500" }}>
        {usuarioItem.nome || usuarioItem.displayName || "Docente"}
      </td>
      <td style={{ padding: "12px 10px", color: "#5e6c84" }}>{usuarioItem.email}</td>
      <td style={{ padding: "12px 10px" }}>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {listaEscolas.map((e) => (
            <label
              key={e.id}
              style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "4px" }}
            >
              <input
                type="checkbox"
                checked={escolasSelecionadas.includes(e.id)}
                onChange={() => toggleEscola(e.id)}
              />{" "}
              {e.nome}
            </label>
          ))}
        </div>
      </td>
      <td style={{ padding: "12px 10px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => onSalvarProfessor(usuarioItem.uid, escolasSelecionadas)}
            style={{
              padding: "6px 12px",
              backgroundColor: "#0052cc",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Salvar
          </button>
          <button
            onClick={() => onExcluir(usuarioItem.uid, usuarioItem.nome || usuarioItem.email)}
            style={{
              padding: "6px 10px",
              backgroundColor: "#de350b",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            title="Excluir Docente"
          >
            🗑️
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function TeacherManagement({
  listaDocentes,
  listaEscolas,
  onSalvarProfessor,
  onExcluir,
}) {
  return (
    <div
      style={{
        backgroundColor: "#f4f5f7",
        padding: "25px",
        borderRadius: "8px",
        border: "1px solid #dfe1e6",
      }}
    >
      <h2 style={{ color: "#0052cc", marginBottom: "15px", fontSize: "1.2rem" }}>
        🛡️ Painel Admin: Atribuição de Unidades para Docentes
      </h2>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          backgroundColor: "#fff",
          borderRadius: "6px",
        }}
      >
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #eaeaea", color: "#5e6c84" }}>
            <th style={{ padding: "10px" }}>Professor(a)</th>
            <th style={{ padding: "10px" }}>E-mail</th>
            <th style={{ padding: "10px" }}>Unidades Permitidas</th>
            <th style={{ padding: "10px" }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {listaDocentes.map((usr) => (
            <LinhaDocente
              key={usr.uid}
              usuarioItem={usr}
              listaEscolas={listaEscolas}
              onSalvarProfessor={onSalvarProfessor}
              onExcluir={onExcluir}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}