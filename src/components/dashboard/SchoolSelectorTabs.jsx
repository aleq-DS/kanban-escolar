import React from "react";

export default function SchoolSelectorTabs({
  escolasVisiveis,
  escolaAtiva,
  onSelectEscola,
  ehSuperAdmin,
  onAddEscola,
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        marginBottom: "30px",
        borderBottom: "2px solid #dfe1e6",
        paddingBottom: "10px",
        flexWrap: "wrap",
      }}
    >
      {escolasVisiveis.map((escola) => (
        <button
          key={escola.id}
          onClick={() => onSelectEscola(escola.id)}
          style={{
            padding: "10px 20px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
            backgroundColor: escolaAtiva === escola.id ? "#0052cc" : "#f4f5f7",
            color: escolaAtiva === escola.id ? "#fff" : "#172b4d",
          }}
        >
          🏫 {escola.nome}
        </button>
      ))}
      {ehSuperAdmin && (
        <button
          onClick={onAddEscola}
          style={{
            padding: "10px 15px",
            border: "1px dashed #0052cc",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
            backgroundColor: "#fff",
            color: "#0052cc",
          }}
        >
          ➕ Add Unidade Escolar
        </button>
      )}
    </div>
  );
}