import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; 
import Header from "../components/layout/Header";
import KanbanColumn from "../components/kanban/KanbanColumn";
import TaskCard from "../components/kanban/TaskCard";
import NewTask from "../components/kanban/NewTask";
import TaskModal from "../components/kanban/TaskModal";
import columns from "../data/columns";
import useKanban from "../hooks/useKanban";
import "../styles/kanban.css";

function Kanban() {
    // Pegamos o grupoDocId diretamente da URL configurada no App.jsx
    const { grupoDocId } = useParams(); 
    const { usuario } = useAuth();
    
    const {
        grupo,
        listaTarefas,
        tarefaSelecionada,
        setTarefaSelecionada,
        adicionarTarefa,
        atualizarTarefa,
        atualizarNomeGrupo,
        carregando
    } = useKanban(grupoDocId);

    const [editandoNome, setEditandoNome] = useState(false);
    const [novoNomeProjeto, setNovoNomeProjeto] = useState("");

    // Sincroniza o input com o nome atual do grupo vindo do banco
    useEffect(() => {
        if (grupo && !editandoNome) {
            setNovoNomeProjeto(grupo.nome);
        }
    }, [grupo, editandoNome]);

    if (!grupo && !carregando) {
        return (
            <>
                <Header />
                <h1 style={{ padding: "40px" }}>Grupo não encontrado.</h1>
            </>
        );
    }

    if (carregando) {
        return (
            <>
                <Header />
                <div style={{ padding: "40px", textAlign: "center" }}>
                    <h2>Carregando tarefas do projeto...</h2>
                </div>
            </>
        );
    }

    // Permissão: Superadmin, Professor ou Líder do respectivo grupo
    const podeEditarNome = 
        usuario?.perfil === "superadmin" ||
        usuario?.perfil === "professor" || 
        (usuario?.perfil === "lider" && (
            String(usuario?.grupoId) === String(grupoDocId) || 
            String(usuario?.grupoId) === String(grupo?.id)
        ));

    function salvarNomeProjeto() {
        if (novoNomeProjeto.trim() !== "") {
            atualizarNomeGrupo(novoNomeProjeto);
            setEditandoNome(false);
        }
    }

    return (
        <>
            <Header />
            <div className="kanban-page">
                <div className="kanban-info">
                    <div>
                        {editandoNome ? (
                            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                <input 
                                    type="text" 
                                    value={novoNomeProjeto} 
                                    onChange={(e) => setNovoNomeProjeto(e.target.value)}
                                    style={{ fontSize: "1.8rem", fontWeight: "bold", padding: "4px" }}
                                />
                                <button 
                                    onClick={salvarNomeProjeto} 
                                    style={{ padding: "6px 12px", backgroundColor: "#00875a", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
                                >
                                    Salvar
                                </button>
                                <button 
                                    onClick={() => setEditandoNome(false)} 
                                    style={{ padding: "6px 12px", backgroundColor: "#de350b", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                <h1>{grupo?.nome || novoNomeProjeto}</h1>
                                {podeEditarNome && (
                                    <button 
                                        onClick={() => setEditandoNome(true)} 
                                        style={{ background: "none", border: "none", color: "#0052cc", cursor: "pointer", textDecoration: "underline", fontSize: "0.9rem" }}
                                    >
                                        ✏️ Renomear Projeto
                                    </button>
                                )}
                            </div>
                        )}
                        <span>Plataforma SpreadsProject • KanbanMulti</span>
                    </div>
                    <NewTask adicionarTarefa={adicionarTarefa} />
                </div>

                <div className="kanban-board">
                    {columns.map((coluna) => (
                        <KanbanColumn key={coluna.id} titulo={coluna.titulo}>
                            {listaTarefas
                                .filter((tarefa) => tarefa.status === coluna.status)
                                .map((tarefa) => (
                                    <TaskCard key={tarefa.id} tarefa={tarefa} selecionar={setTarefaSelecionada} />
                                ))}
                        </KanbanColumn>
                    ))}
                </div>
            </div>

            <TaskModal tarefa={tarefaSelecionada} fechar={() => setTarefaSelecionada(null)} onSalvar={atualizarTarefa} />
        </>
    );
}

export default Kanban;