import "../../styles/groupCard.css";
import { useNavigate } from "react-router-dom";

// Mantemos o id apenas se precisar exibir visualmente (ex: "Grupo 1")
function GroupCard({ id, docId, nome, integrantes, progresso, podeExcluir, onExcluir }) {
    const navigate = useNavigate();

    const handleExcluir = (e) => {
        e.stopPropagation(); // Impede event bubbling caso o card tenha cliques globais
        if (onExcluir) {
            onExcluir();
        }
    };

    return (
        <div className="group-card" style={{ position: "relative" }}>
            {/* Botão de Exclusão (Visível apenas para quem tem permissão) */}
            {podeExcluir && (
                <button
                    onClick={handleExcluir}
                    title="Excluir grupo"
                    style={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "1.2rem",
                        padding: "4px",
                        lineHeight: 1,
                        zIndex: 2,
                    }}
                >
                    🗑️
                </button>
            )}

            <h2>{nome}</h2>
            <p><strong>Integrantes:</strong> {integrantes}</p>
            <p><strong>Progresso:</strong> {progresso}%</p>
            <div className="progress">
                <div
                    className="progress-bar"
                    style={{ width: `${progresso}%` }}
                ></div>
            </div>
            
            {/* Usa o docId composto para a rota do Kanban */}
            <button onClick={() => navigate(`/kanban/${docId}`)}>
                Abrir
            </button>
        </div>
    );
}

export default GroupCard;