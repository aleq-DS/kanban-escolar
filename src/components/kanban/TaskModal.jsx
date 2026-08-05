import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext"; // <-- IMPORTA O VIGIA GLOBAL
import "../../styles/taskModal.css";

function TaskModal({ tarefa, fechar, onSalvar }) {
    const { usuario } = useAuth(); // Puxa os dados do perfil atual

    // Estados locais existentes
    const [comentario, setComentario] = useState("");
    const [status, setStatus] = useState("");
    const [aprovado, setAprovado] = useState(false);
    const [descricao, setDescricao] = useState("");
    const [linkDrive, setLinkDrive] = useState("");

    // Novos Estados locais para o finetuning solicitado
    const [responsavel, setResponsavel] = useState("");
    const [prioridade, setPrioridade] = useState("");
    const [dataEntrega, setDataEntrega] = useState("");

    useEffect(() => {
        if (tarefa) {
            setComentario(tarefa.comentarioProfessor || "");
            setStatus(tarefa.status || "todo");
            setAprovado(tarefa.aprovado || false);
            setDescricao(tarefa.descricao || "");
            setLinkDrive(tarefa.linkDrive || "");
            setResponsavel(tarefa.responsavel || "");
            setPrioridade(tarefa.prioridade || "Média");
            setDataEntrega(tarefa.dataEntrega || "");
        }
    }, [tarefa]);

    if (!tarefa) return null;

    // --- REGRAS DE PERMISSÃO EM VARIÁVEIS (ACL) ---
    // Extrai o papel aceitando 'papel' ou 'perfil' e padroniza para minúsculo
    const papelUsuario = String(usuario?.papel || usuario?.perfil || "").toLowerCase();

    // Habilita a visão docente/admin para variações de admin, professor e superadmin
    const ehProfessor = 
        papelUsuario.includes("prof") || 
        papelUsuario.includes("teacher") || 
        papelUsuario.includes("admin") || 
        papelUsuario.includes("super");

    const ehLider = papelUsuario.includes("lider") || papelUsuario.includes("leader");

    const ehAlunoComum = !ehProfessor && !ehLider;

    // Regra: Criador (Professor/Admin) e Líder alteram prioridade e data
    const podeAlterarMetadados = ehProfessor || ehLider;

    // Regra: Status pode ser alterado por todos
    const podeAlterarStatusGeral = true; 

    async function lidarComSalvar() {
        // 1. VALIDAÇÃO ANTES DE MONTAR O OBJETO (Opcional, mas boa prática no Front-end)
        if (!responsavel.trim() || responsavel.toLowerCase() === "a definir") {
            alert("⚠️ Por favor, informe o nome do membro que está a executar esta tarefa.");
            return;
        }

        if (!descricao.trim()) {
            alert("⚠️ A descrição da tarefa não pode ficar vazia.");
            return;
        }

        if (!dataEntrega) {
            alert("⚠️ Por favor, defina um Prazo de Entrega para esta tarefa.");
            return;
        }

        if (!linkDrive.trim()) {
            alert("⚠️ Por favor, forneça o Link do Google Drive / GitHub.");
            return;
        }

        if ((status === "done" || status === "testing") && !linkDrive.trim()) {
            alert("⚠️ Para mover a tarefa para validação ou conclusão, é obrigatório colar o Link do Google Drive / GitHub.");
            return;
        }

        if (ehAlunoComum && status === "return") {
            alert("Apenas o Professor ou o Líder do grupo podem mover uma tarefa para a coluna de Retorno.");
            return;
        }

        // 2. MONTAGEM DOS DADOS
        const dadosAtualizados = {
            descricao: descricao.trim(),
            linkDrive: linkDrive.trim(),
            status,
            responsavel: responsavel.trim(),
            comentarioProfessor: comentario,
            aprovado: status === "done" ? aprovado : false,
            aprovadoPor: status === "done" && aprovado ? "Professor" : "",
            dataAprovacao: status === "done" && aprovado ? new Date().toLocaleDateString("pt-BR") : null,
            prioridade: podeAlterarMetadados ? prioridade : (tarefa.prioridade || "Média"),
            dataEntrega: podeAlterarMetadados ? dataEntrega : (tarefa.dataEntrega || "")
        };

        // 3. TENTATIVA DE GRAVAÇÃO BLINDADA
        try {
            // Aguarda a resposta do useKanban -> taskService
            await onSalvar(tarefa.id, dadosAtualizados);
            
            // Se correu bem, fecha o modal com segurança
            fechar();
        } catch (error) {
            // Se falhou na validação do Service, o modal NÃO fecha e avisa o utilizador
            alert(`❌ Erro de Validação: ${error.message}`);
        }
    }

    return (
        <div className="modal-overlay">
            {/* Ajuste crítico de Layout: adicionado estilo inline para evitar estouro de tela */}
            <div className="task-modal" style={{ maxHeight: "88vh", overflowY: "auto", display: "flex", flexDirection: "column" }}>
                <button className="btn-fechar" onClick={fechar}>✖</button>
                
                <h2>{tarefa.titulo}</h2>
                <span className="task-id">ID da Tarefa: #{tarefa.id}</span>
                <hr />

                {/* Área de conteúdo interna */}
                <div className="modal-grid" style={{ flex: 1 }}>
                    {/* Coluna da Esquerda: Detalhes do Aluno */}
                    <div className="modal-main">
                        <section className="modal-section">
                            <h3>Descrição do Projeto / Tarefa</h3>
                            <textarea 
                                className="descricao-textarea"
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                                placeholder="Descreva os detalhes do progresso ou requisitos desta tarefa..."
                                rows={4}
                                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                            />
                        </section>

                        <section className="modal-section">
                            <h3>Membro Executando</h3>
                            <input 
                                type="text"
                                placeholder="Nome do aluno responsável pela execução..."
                                value={responsavel}
                                onChange={(e) => setResponsavel(e.target.value)}
                                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                            />
                        </section>

                        <section className="modal-section">
                            <h3>Entrega de Arquivos Externos</h3>
                            <label style={{ fontSize: "0.9rem", color: "#5e6c84" }}>Link do Google Drive / GitHub:</label>
                            <input 
                                type="url"
                                placeholder="https://drive.google.com/..."
                                value={linkDrive}
                                onChange={(e) => setLinkDrive(e.target.value)}
                                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", marginBottom: "10px" }}
                            />
                            {tarefa.linkDrive && (
                                <a href={tarefa.linkDrive} target="_blank" rel="noopener noreferrer" className="drive-link-btn" style={{ color: "#0052cc", fontWeight: "bold" }}>
                                    🔗 Abrir Pasta do Projeto no Drive
                                </a>
                            )}
                        </section>

                        <section className="modal-section">
                            <h3>Histórico de Evolução</h3>
                            <div className="historico-lista" style={{ maxHeight: "120px", overflowY: "auto" }}>
                                {tarefa.historico?.map((evento, index) => (
                                    <div key={index} className="historico-item">
                                        <small>{evento.data}</small>
                                        <p>{evento.evento}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                        
                        <button className="btn-salvar-geral" onClick={lidarComSalvar} style={{ width: "100%", padding: "10px", backgroundColor: "#0052cc", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", marginTop: "15px" }}>
                            Salvar Alterações da Tarefa
                        </button>
                    </div>

                    {/* Coluna da Direita: Painel de Avaliação e Metadados */}
                    <div className="modal-sidebar">
                        
                        {/* SEÇÃO 1: MUDANÇA DE COLUNA/STATUS */}
                        <section className="modal-section">
                            <h3>Fluxo do Kanban</h3>
                            <label>Alterar Status:</label>
                            <select 
                                value={status} 
                                onChange={(e) => setStatus(e.target.value)}
                                disabled={!podeAlterarStatusGeral}
                                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: "#fff" }}
                            >
                                <option value="todo">A Fazer</option>
                                <option value="doing">Em Andamento</option>
                                <option value="return" disabled={ehAlunoComum}>
                                    Retorno (Correção) {ehAlunoComum ? "🔒" : ""}
                                </option>
                                <option value="done">Concluído</option>
                            </select>
                        </section>

                        {/* SEÇÃO 2: METADADOS DINÂMICOS (Prioridade e Prazo) */}
                        <section className="modal-section">
                            <h3>Configurações do Cartão</h3>
                            
                            <label>Prioridade:</label>
                            <select 
                                value={prioridade} 
                                onChange={(e) => setPrioridade(e.target.value)} 
                                disabled={!podeAlterarMetadados}
                                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", marginBottom: "10px", backgroundColor: !podeAlterarMetadados ? "#f4f5f7" : "#fff" }}
                            >
                                <option value="Baixa">Baixa</option>
                                <option value="Média">Média</option>
                                <option value="Alta">Alta</option>
                            </select>

                            <label>Prazo de Entrega:</label>
                            <input 
                                type="date" 
                                value={dataEntrega} 
                                onChange={(e) => setDataEntrega(e.target.value)} 
                                disabled={!podeAlterarMetadados}
                                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: !podeAlterarMetadados ? "#f4f5f7" : "#fff" }}
                            />
                            {!podeAlterarMetadados && <p style={{ fontSize: "0.75rem", color: "#5e6c84", marginTop: "4px" }}>🔒 Apenas Professor ou Líder alteram prioridade/prazo.</p>}
                        </section>

                        {/* SEÇÃO 3: PAINEL EXCLUSIVO DO PROFESSOR */}
                        <section className={`modal-section avaliacao-box ${!ehProfessor ? "desabilitado" : ""}`} style={{ opacity: ehProfessor ? 1 : 0.75, backgroundColor: ehProfessor ? "#fff9e6" : "#f4f5f7" }}>
                            <h3>Avaliação Técnica (Docente)</h3>

                            {status === "done" && (
                                <div className="aprovacao-checkbox" style={{ marginBottom: "10px" }}>
                                    <input 
                                        type="checkbox" 
                                        id="aprovar" 
                                        checked={aprovado} 
                                        onChange={(e) => setAprovado(e.target.checked)} 
                                        disabled={!ehProfessor}
                                    />
                                    <label htmlFor="aprovar" style={{ fontWeight: "bold", marginLeft: "6px" }}>Dar o visto final (Aprovado)?</label>
                                </div>
                            )}

                            <label>Feedback / Orientação Pedagógica:</label>
                            <textarea
                                placeholder={ehProfessor ? "Digite aqui os pontos a corrigir..." : "Nenhuma orientação registrada pelo professor até o momento."}
                                value={comentario}
                                onChange={(e) => setComentario(e.target.value)}
                                rows={3}
                                disabled={!ehProfessor}
                                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", resize: "none" }}
                            />
                            
                            {!ehProfessor && <p style={{ fontSize: "0.8rem", color: "#de350b", marginTop: "5px", fontWeight: "500" }}>⚠️ Visão de leitura (Exclusivo do Professor).</p>}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TaskModal;