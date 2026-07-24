import React from "react";

export default function StudentPendingView({
  usuario,
  listaEscolas,
  escolaEscolhida,
  onSelectEscolaChange,
  onSalvar,
  salvando,
}) {
  const jaEscolheuEscola = usuario?.escolaSolicitadaId || usuario?.escolaId;

  return (
    <div
      style={{
        padding: "60px 20px",
        textAlign: "center",
        maxWidth: "550px",
        margin: "0 auto",
      }}
    >
      {!jaEscolheuEscola ? (
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #dfe1e6",
            padding: "30px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <h2 style={{ color: "#172b4d", marginBottom: "10px" }}>
            Qual a sua Unidade Escolar? 🏫
          </h2>
          <p style={{ color: "#5e6c84", marginBottom: "20px" }}>
            Olá, <strong>{usuario?.nome || "Estudante"}</strong>! Selecione abaixo a escola em que você estuda para enviar sua solicitação de acesso.
          </p>
          <form onSubmit={onSalvar} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <select
              value={escolaEscolhida}
              onChange={(e) => onSelectEscolaChange(e.target.value)}
              style={{
                padding: "12px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                fontSize: "1rem",
                backgroundColor: "#fff",
              }}
              required
            >
              {listaEscolas.map((escola) => (
                <option key={escola.id} value={escola.id}>
                  {escola.nome}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={salvando || listaEscolas.length === 0}
              style={{
                padding: "12px",
                backgroundColor: "#0052cc",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                fontWeight: "bold",
                fontSize: "1rem",
                cursor: "pointer",
              }}
            >
              {salvando ? "Enviando..." : "Confirmar Unidade Escolar"}
            </button>
          </form>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "#fffae6",
            border: "1px solid #ffe380",
            padding: "30px",
            borderRadius: "8px",
          }}
        >
          <h2 style={{ color: "#ff8b00", marginBottom: "15px" }}>
            Acesso em Análise ⏳
          </h2>
          <p>
            Olá, <strong>{usuario?.nome || "Estudante"}</strong>!
          </p>
          <p style={{ marginTop: "10px", color: "#5e6c84" }}>
            Sua solicitação foi enviada para a unidade escolar selecionada. Aguarde a liberação da sua conta e vinculação a um Grupo pelo seu professor.
          </p>
        </div>
      )}
    </div>
  );
}