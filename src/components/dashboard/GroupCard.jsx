import "../../styles/groupCard.css";
import { useNavigate } from "react-router-dom";

function GroupCard({ id, docId, nome, integrantes, progresso, podeExcluir, onExcluir }) {
    const navigate = useNavigate();

    const handleExcluir = (e) => {
        e.stopPropagation();
        if (onExcluir) {
            onExcluir();
        }
    };

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
            <p><strong>Progresso:</strong> {progresso}%</p>
            
            <div className="progress">
                <div
                    className="progress-bar"
                    style={{ width: `${progresso}%` }}
                ></div>
            </div>
            
            <button className="btn-abrir" onClick={() => navigate(`/kanban/${docId}`)}>
                Abrir
            </button>
        </div>
    );
}

export default GroupCard;