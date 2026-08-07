import "../../styles/groupCard.css";
import { useNavigate } from "react-router-dom";

function GroupCard({ id, docId, nome, integrantes, progresso = 0, podeExcluir, onExcluir }) {
  const navigate = useNavigate();

  const handleExcluir = (e) => {
    e.stopPropagation();
    if (onExcluir) {
      onExcluir();
    }
  };

  // Garante que o valor fique entre 0 e 100
  const valorProgresso = Math.min(Math.max(Number(progresso) || 0, 0), 100);

  return (
    <div className="group-card">
      {podeExcluir && (
        <button
          className="btn-deletar"
          onClick={handleExcluir}
          title="Excluir grupo"
        >
          🗑️
        </button>
      )}

      <h2>{nome}</h2>
      <p><strong>Integrantes:</strong> {integrantes}</p>
      <p><strong>Progresso:</strong> {valorProgresso}%</p>
      
      <div className="progress">
        <div
          className="progress-bar"
          style={{ 
            width: `${valorProgresso}%`,
            transition: "width 0.4s ease-in-out"
          }}
        ></div>
      </div>
      
      <button className="btn-abrir" onClick={() => navigate(`/kanban/${docId}`)}>
        Abrir
      </button>
    </div>
  );
}

export default GroupCard;