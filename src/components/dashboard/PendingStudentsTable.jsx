// src/components/dashboard/PendingStudentsTable.jsx
import React, { useState, useMemo, useEffect } from "react";

function LinhaAlunoPendente({
  usuarioItem,
  listaEscolas,
  listaGrupos,
  escolaAtivaInicial,
  exibirEscolaSelect,
  onSalvarAluno,
  onExcluir,
}) {
  const [escolaSelecionada, setEscolaSelecionada] = useState(
    usuarioItem.escolaSolicitadaId || usuarioItem.escolaId || escolaAtivaInicial || ""
  );
  const [grupoSelecionado, setGrupoSelecionado] = useState("");
  const [ehLider, setEhLider] = useState(false);

  useEffect(() => {
    setEscolaSelecionada(
      usuarioItem.escolaSolicitadaId || usuarioItem.escolaId || escolaAtivaInicial || ""
    );
  }, [escolaAtivaInicial, usuarioItem]);

  const gruposDaEscola = useMemo(() => {
    // Se a coluna de escolha estiver oculta, filtra os grupos diretamente pela escola ativa do painel
    const escolaAlvo = exibirEscolaSelect ? escolaSelecionada : escolaAtivaInicial;
    return listaGrupos.filter((g) => String(g.escolaId) === String(escolaAlvo));
  }, [listaGrupos, escolaSelecionada, escolaAtivaInicial, exibirEscolaSelect]);

  const lidarComSalvar = () => {
    // Se o dropdown de escolas estiver oculto, força a escola ativa atual
    const escolaFinal = exibirEscolaSelect ? escolaSelecionada : escolaAtivaInicial;
    onSalvarAluno(usuarioItem.uid, escolaFinal, grupoSelecionado, ehLider);
  };

  return (
    <tr style={{ borderBottom: "1px solid #f4f5f7" }}>
      <td style={{ padding: "12px 10px", fontWeight: "500" }}>
        {usuarioItem.nome || usuarioItem.displayName || "Estudante"}
      </td>
      <td style={{ padding: "12px 10px", color: "#5e6c84" }}>{usuarioItem.email}</td>
      
      {/* Exibe o select de escola APENAS se houver múltiplas escolas / for SuperAdmin */}
      {exibirEscolaSelect && (
        <td style={{ padding: "12px 10px" }}>
          <select
            value={escolaSelecionada}
            onChange={(e) => {
              setEscolaSelecionada(e.target.value);
              setGrupoSelecionado("");
            }}
            style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc" }}
          >
            {listaEscolas.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nome}
              </option>
            ))}
          </select>
        </td>
      )}

      <td style={{ padding: "12px 10px" }}>
        <select
          value={grupoSelecionado}
          onChange={(e) => setGrupoSelecionado(e.target.value)}
          style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc" }}
        >
          <option value="">-- Selecione o Grupo --</option>
          {gruposDaEscola.map((g) => (
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
            disabled={!grupoSelecionado}
            onClick={() =>
              onSalvarAluno(usuarioItem.uid, escolaSelecionada, grupoSelecionado, ehLider)
            }
            style={{
              padding: "6px 12px",
              backgroundColor: grupoSelecionado ? "#00875a" : "#ccc",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: grupoSelecionado ? "pointer" : "not-allowed",
            }}
          >
            Aprovar e Vincular
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
            title="Excluir Usuário"
          >
            🗑️
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function PendingStudentsTable({
  alunosPendentes,
  listaEscolas,
  listaGrupos,
  escolaAtiva,
  ehSuperAdmin,
  escolasDoProf = [],
  onSalvarAluno,
  onExcluir,
}) {
  // Mostra a coluna de escola APENAS se for SuperAdmin OU se a lista de escolas for maior que 1
  const exibirEscolaSelect = ehSuperAdmin || escolasDoProf.length > 1;

  return (
    <div
      style={{
        backgroundColor: "#fff",
        padding: "25px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        borderLeft: "5px solid #ffab00",
      }}
    >
      <h2 style={{ color: "#172b4d", marginBottom: "15px", fontSize: "1.25rem" }}>
        ⏳ Solicitações Pendentes (Estudantes Desta Unidade)
      </h2>
      {alunosPendentes.length === 0 ? (
        <p style={{ color: "#6b778c", fontSize: "0.95rem" }}>
          Nenhum estudante aguardando aprovação nesta unidade escolar no momento.
        </p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #eaeaea", color: "#5e6c84" }}>
              <th style={{ padding: "10px" }}>Estudante</th>
              <th style={{ padding: "10px" }}>E-mail</th>
              {exibirEscolaSelect && <th style={{ padding: "10px" }}>Unidade Escolar</th>}
              <th style={{ padding: "10px" }}>Atribuir Grupo</th>
              <th style={{ padding: "10px" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {alunosPendentes.map((usr) => (
              <LinhaAlunoPendente
                key={usr.uid}
                usuarioItem={usr}
                listaEscolas={listaEscolas}
                listaGrupos={listaGrupos}
                escolaAtivaInicial={escolaAtiva}
                exibirEscolaSelect={exibirEscolaSelect}
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