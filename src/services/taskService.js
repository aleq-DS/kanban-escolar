import { db } from "../firebase/firebaseConfig";
import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    doc, 
    updateDoc 
} from "firebase/firestore";

const COLECAO_TAREFAS = "tarefas";

export const taskService = {
    // 1. Buscar tarefas aceitando tanto ID numérico quanto ID texto (String) das novas escolas
    buscarPorGrupo: async (grupoId) => {
        try {
            const tarefasRef = collection(db, COLECAO_TAREFAS);
            
            // Busca por String (padrão atual)
            const qString = query(tarefasRef, where("grupo", "==", String(grupoId)));
            const snapshotString = await getDocs(qString);
            
            const tarefas = [];
            snapshotString.forEach((doc) => {
                tarefas.push({ id: doc.id, ...doc.data() });
            });

            // Fallback para grupos legados salvos como Number
            if (tarefas.length === 0 && !isNaN(grupoId)) {
                const qNum = query(tarefasRef, where("grupo", "==", Number(grupoId)));
                const snapshotNum = await getDocs(qNum);
                snapshotNum.forEach((doc) => {
                    tarefas.push({ id: doc.id, ...doc.data() });
                });
            }
            
            return tarefas;
        } catch (error) {
            console.error("Erro ao buscar tarefas:", error);
            throw error;
        }
    },

    // 2. Salvar (Criação leve e rápida)
    salvar: async (novaTarefa) => {
        try {
            const tarefasRef = collection(db, COLECAO_TAREFAS);
            const { id, ...dadosParaSalvar } = novaTarefa; // Descarta id local/temporário
            
            const docRef = await addDoc(tarefasRef, dadosParaSalvar);
            
            return {
                id: docRef.id,
                ...dadosParaSalvar
            };
        } catch (error) {
            console.error("Erro ao salvar tarefa:", error);
            throw error;
        }
    },

    // 3. Atualização com Validações Técnicas e Regras de Negócio
    atualizar: async (tarefaId, dadosAtualizados) => {
        // Validação 1: Responsável é obrigatório caso a tarefa saia do "A Fazer" (todo)
        if (dadosAtualizados.responsavel !== undefined) {
            const resp = dadosAtualizados.responsavel?.trim() || "";
            const movendoParaOutraColuna = dadosAtualizados.status && dadosAtualizados.status !== "todo";

            if ((!resp || resp.toLowerCase() === "a definir") && movendoParaOutraColuna) {
                throw new Error("Defina um responsável válido antes de iniciar a tarefa.");
            }
        }

        // Validação 2: Descrição não pode ser enviada vazia ou só com espaços
        if (dadosAtualizados.descricao !== undefined && !dadosAtualizados.descricao?.trim()) {
            throw new Error("A descrição do projeto/tarefa não pode ficar vazia.");
        }

        // Validação 3: Data de entrega (Ajustada a condição para validar string vazia)
        if (dadosAtualizados.dataEntrega !== undefined && !dadosAtualizados.dataEntrega?.trim()) {
            throw new Error("O prazo de entrega é obrigatório.");
        }

        try {
            const tarefaDocRef = doc(db, COLECAO_TAREFAS, tarefaId);
            await updateDoc(tarefaDocRef, dadosAtualizados);
            
            return {
                id: tarefaId,
                ...dadosAtualizados
            };
        } catch (error) {
            console.error("Erro ao atualizar tarefa no Firestore:", error);
            throw error;
        }
    }
};