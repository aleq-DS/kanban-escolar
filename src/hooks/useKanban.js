import { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { taskService } from "../services/taskService";

export default function useKanban(id) {
    const [grupo, setGrupo] = useState(null);
    const [listaTarefas, setListaTarefas] = useState([]);
    const [tarefaSelecionada, setTarefaSelecionada] = useState(null);
    const [carregando, setCarregando] = useState(true);

    // Carrega tanto os dados do Grupo quanto as Tarefas vindas do Firestore
    useEffect(() => {
        async function carregarDadosDoBanco() {
            if (!id) return;
            setCarregando(true);
            try {
                // 1. Busca os metadados do grupo no Firestore usando o ID composto da URL (ex: paulo-mendes_1)
                const grupoRef = doc(db, "grupos", String(id));
                const grupoSnap = await getDoc(grupoRef);

                if (grupoSnap.exists()) {
                    setGrupo({ ...grupoSnap.data(), id: grupoSnap.id });

                    // 2. Tendo o grupo verificado, busca suas tarefas atreladas a esse ID composto
                    const tarefasDoGrupo = await taskService.buscarPorGrupo(id);
                    setListaTarefas(tarefasDoGrupo);
                } else {
                    console.warn(`Grupo com ID composto ${id} não foi encontrado no Firestore.`);
                    setGrupo(null);
                }
            } catch (error) {
                console.error("Erro ao carregar dados do Kanban do banco:", error);
            } finally {
                setCarregando(false);
            }
        }
        carregarDadosDoBanco();
    }, [id]);

    // Permite ao Professor ou Líder salvar o novo nome do projeto de TCC
    async function atualizarNomeGrupo(novoNome) {
        if (!grupo) return;
        const nomeLimpo = novoNome.trim();
        if (!nomeLimpo) return;

        try {
            // Utilizamos o ID composto original para garantir que a gravação ocorra no documento certo
            const grupoRef = doc(db, "grupos", String(grupo.id));
            await updateDoc(grupoRef, { nome: nomeLimpo });
            
            // Atualiza localmente o estado para sincronizar a interface de forma reativa
            setGrupo((anterior) => ({ ...anterior, nome: nomeLimpo }));
        } catch (error) {
            console.error("Erro ao renomear grupo no Firestore:", error);
            alert("Erro ao salvar novo nome do projeto.");
        }
    }

    // Função de Adicionar corrigida: Simples e direta (Apenas Título e Responsável)
    async function adicionarTarefa(dadosNovaTarefa) {
        if (!grupo) return;

        const tituloLimpo = dadosNovaTarefa?.titulo?.trim() || "";
        if (!tituloLimpo) {
            alert("⚠️ Não é possível criar uma tarefa sem um Título!");
            return;
        }

        const novaTarefaCompleta = {
            grupo: String(grupo?.id || id), // Garante salvamento como string compatível com as abas
            status: "todo",
            aprovado: false,
            comentarioProfessor: "",
            aprovadoPor: "",
            dataAprovacao: null,
            prioridade: dadosNovaTarefa.prioridade || "Média",
            dataEntrega: dadosNovaTarefa.dataEntrega || "",
            titulo: tituloLimpo,
            descricao: dadosNovaTarefa.descricao?.trim() || "",
            responsavel: dadosNovaTarefa.responsavel?.trim() || "A definir",
            linkDrive: "",
            historico: [
                {
                    data: new Date().toLocaleDateString("pt-BR"),
                    evento: "Tarefa criada no sistema."
                }
            ]
        };

        try {
            // O segredo está aqui: o service retorna o id gerado pelo Firebase (ex: "XyZ123")
            const tarefaSalva = await taskService.salvar(novaTarefaCompleta);
            
            // Adiciona na lista com o ID definitivo do banco. Nunca mais vai sumir ou dar conflito!
            setListaTarefas((anteriores) => [...anteriores, tarefaSalva]);
        } catch (error) {
            console.error("Erro ao instanciar tarefa:", error);
        }
    }

    // Função de Atualizar conectada ao serviço
    async function atualizarTarefa(tarefaId, dadosAtualizados) {
        try {
            const tarefaOriginal = listaTarefas.find(t => t.id === tarefaId);
            if (!tarefaOriginal) return;

            const novoHistorico = [...tarefaOriginal.historico];
            if (dadosAtualizados.status && dadosAtualizados.status !== tarefaOriginal.status) {
                novoHistorico.push({
                    data: new Date().toLocaleDateString("pt-BR"),
                    evento: `Status alterado para: ${dadosAtualizados.status}`
                });
            }
            if (dadosAtualizados.comentarioProfessor && dadosAtualizados.comentarioProfessor !== tarefaOriginal.comentarioProfessor) {
                novoHistorico.push({
                    data: new Date().toLocaleDateString("pt-BR"),
                    evento: "Professor adicionou uma orientação pedagógica."
                });
            }

            const dadosComHistorico = { ...dadosAtualizados, historico: novoHistorico };

            // Se o taskService detetar campos vazios, ele vai lançar um erro aqui
            await taskService.atualizar(tarefaId, dadosComHistorico);
            
            // Só atualiza o estado local se a gravação no Firestore correu a 100%
            setListaTarefas((anteriores) =>
                anteriores.map((t) => t.id === tarefaId ? { ...t, ...dadosComHistorico } : t)
            );
        } catch (error) {
            console.error("Erro ao atualizar tarefa:", error);
            // Lança o erro para a frente para que o Modal consiga travar o fecho da janela
            throw error;
        }
    }

    return {
        //grupo: grupo ? { ...grupo, atualizarNomeGrupo } : null, // Acopla a função de atualizar nome ao objeto retornado
        grupo,
        listaTarefas,
        tarefaSelecionada,
        setTarefaSelecionada,
        adicionarTarefa,
        atualizarTarefa,
        atualizarNomeGrupo,
        carregando
    };
}