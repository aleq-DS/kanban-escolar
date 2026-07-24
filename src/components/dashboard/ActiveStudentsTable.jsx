import React, { useState, useEffect } from "react";

function LinhaAlunoAtivo({
  usuarioItem,
  gruposVisiveis,
  escolaAtiva,
  onSalvarAluno,
  onExcluir,
}) {
  const papel = usuarioItem.papel || usuarioItem.perfil;
  const [grupoSelecionado, setGrupoSelecionado] = useState(usuarioItem.grupoId || "");
  const [ehLider, setEhLider] = useState(papel === "lider");

  useEffect(() => {
    setGrupoSelecionado(usuarioItem.grupoId || "");
    setEhLider(papel === "lider");
  }, [usuarioItem, papel]);

  return (
    <tr style={{ borderBottom: "1px solid #f4f5f7" }}>
      <td style={{ padding: "12px 10px", fontWeight: "500" }}>
        {usuarioItem.nome || usuarioItem.displayName || "Estudante"}
      </td>
      <td style={{ padding: "12px 10px", color: "#5e6c84" }}>{usuarioItem.email}</td>
      <td style={{ padding: "12px 10px" }}>
        <select
          value={grupoSelecionado}
          onChange={(e) => setGrupoSelecionado(e.target.value)}
          style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc" }}
        >
          <option value="">-- Remover do Grupo --</option>
          {gruposVisiveis.map((g) => (
            <option key={g.docId} value={g.docId}>
              Grupo {g.id} - {g.nome}
            </option>
          ))}
        </select>
      </td>
      <td style={{ padding: "12px 10px" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <label style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "4px" }}>
            <input
              type="checkbox"
              checked={ehLider}
              onChange={(e) => setEhLider(e.target.checked)}
            />{" "}
            Líder
          </label>
          <button
            onClick={() =>
              onSalvarAluno(usuarioItem.uid, escolaAtiva, grupoSelecionado, ehLider)
            }
            style={{
              padding: "6px 12px",
              backgroundColor: "#0052cc",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Atualizar
          </button>
        </div>
      </td>
      <td style={{ padding: "12px 10px" }}>
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
          title="Excluir Estudante"
        >
          🗑️
        </button>
      </td>
    </tr>
  );
}

export default function ActiveStudentsTable({
  alunosAtivos,
  gruposVisiveis,
  escolaAtiva,
  nomeDaEscola,
  onSalvarAluno,
  onExcluir,
}) {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        padding: "25px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        borderLeft: "5px solid #00875a",
      }}
    >
      <h2 style={{ color: "#172b4d", marginBottom: "15px", fontSize: "1.25rem" }}>
        👥 Estudantes Ativos — {nomeDaEscola}
      </h2>
      {alunosAtivos.length === 0 ? (
        <p style={{ color: "#6b778c", fontSize: "0.95rem" }}>
          Nenhum estudante vinculado nesta escola até o momento.
        </p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #eaeaea", color: "#5e6c84" }}>
              <th style={{ padding: "10px" }}>Nome</th>
              <th style={{ padding: "10px" }}>E-mail</th>
              <th style={{ padding: "10px" }}>Grupo Atual</th>
              <th style={{ padding: "10px" }}>Função / Alterar</th>
              <th style={{ padding: "10px" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {alunosAtivos.map((usr) => (
              <LinhaAlunoAtivo
                key={usr.uid}
                usuarioItem={usr}
                gruposVisiveis={gruposVisiveis}
                escolaAtiva={escolaAtiva}
                onSalvarAluno={onSalvarAluno}
                onExcluir={onExcluir}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}