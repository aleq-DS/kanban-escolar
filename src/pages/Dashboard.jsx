import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

import Header from "../components/layout/Header";
import GroupCard from "../components/dashboard/GroupCard";
import SchoolSelectorTabs from "../components/dashboard/SchoolSelectorTabs";
import StudentPendingView from "../components/dashboard/StudentPendingView";
import PendingStudentsTable from "../components/dashboard/PendingStudentsTable";
import ActiveStudentsTable from "../components/dashboard/ActiveStudentsTable";
import TeacherManagement from "../components/dashboard/TeacherManagement";

function Dashboard() {
  const { usuario } = useAuth();
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [listaGrupos, setListaGrupos] = useState([]);
  const [listaEscolas, setListaEscolas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [escolaAtiva, setEscolaAtiva] = useState("");
  const [escolaEscolhidaAluno, setEscolaEscolhidaAluno] = useState("");
  const [salvandoVinculo, setSalvandoVinculo] = useState(false);

  const papelUsuario = usuario?.papel || usuario?.perfil;
  const ehSuperAdmin = papelUsuario === "superadmin";
  const ehProfessor = papelUsuario === "professor" || ehSuperAdmin;
  const temGrupo = Boolean(usuario?.grupoId);

  // 1. Firebase - Escolas
  useEffect(() => {
    const unsubscribeEscolas = onSnapshot(
      collection(db, "escolas"),
      async (snapshot) => {
        const escolasData = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        if (escolasData.length === 0 && ehProfessor) {
          try {
            await setDoc(doc(db, "escolas", "escola-padrao"), { nome: "Escola Padrão" });
          } catch (err) {
            console.error("Erro ao inicializar escola padrão:", err);
          }
          return;
        }

        setListaEscolas(escolasData);

        if (escolasData.length > 0) {
          setEscolaAtiva((prev) => {
            if (prev && escolasData.some((e) => e.id === prev)) return prev;
            if (ehSuperAdmin) return escolasData[0].id;
            
            // Garante que o professor comece em uma escola à qual pertence
            const primeiraDoProf = escolasData.find((e) =>
              usuario?.escolas?.includes(e.id) || e.id === usuario?.escolaId
            );
            return primeiraDoProf ? primeiraDoProf.id : escolasData[0].id;
          });
          setEscolaEscolhidaAluno((prev) => prev || escolasData[0].id);
        }
      },
      (error) => console.error("Erro ao buscar escolas:", error)
    );

    return () => unsubscribeEscolas();
  }, [ehProfessor, ehSuperAdmin, usuario]);

  // 2. Firebase - Grupos
  useEffect(() => {
    const unsubscribeGrupos = onSnapshot(
      collection(db, "grupos"),
      (snapshot) => {
        const groupsData = snapshot.docs.map((docSnap) => ({
          docId: docSnap.id,
          id: docSnap.data().id || docSnap.id,
          ...docSnap.data(),
        }));

        groupsData.sort((a, b) => {
          const numA = Number(a.id);
          const numB = Number(b.id);
          if (!isNaN(numA) && !isNaN(numB) && numA !== numB) return numA - numB;
          return String(a.docId).localeCompare(String(b.docId));
        });

        setListaGrupos(groupsData);
      },
      (error) => console.error("Erro ao buscar grupos:", error)
    );

    return () => unsubscribeGrupos();
  }, []);

  // 3. Firebase - Usuários
  useEffect(() => {
    const unsubscribeUsuarios = onSnapshot(
      collection(db, "usuarios"),
      (snapshot) => {
        const users = snapshot.docs.map((docSnap) => ({
          uid: docSnap.id,
          ...docSnap.data(),
        }));
        setListaUsuarios(users);
        setCarregando(false);
      },
      (error) => {
        console.error("Erro ao buscar usuários:", error);
        setCarregando(false);
      }
    );

    return () => unsubscribeUsuarios();
  }, []);

  // Contagem de Integrantes por Grupo
  const contagemIntegrantesPorGrupo = useMemo(() => {
    const mapa = {};
    listaUsuarios.forEach((usr) => {
      if (usr.grupoId) {
        const gId = String(usr.grupoId);
        mapa[gId] = (mapa[gId] || 0) + 1;
      }
    });
    return mapa;
  }, [listaUsuarios]);

  // Salvar Escolha do Aluno
  const salvarEscolaDoAluno = async (e) => {
    e.preventDefault();
    if (!escolaEscolhidaAluno || !usuario?.uid) return;

    setSalvandoVinculo(true);
    try {
      await updateDoc(doc(db, "usuarios", usuario.uid), {
        escolaSolicitadaId: escolaEscolhidaAluno,
        escolaId: escolaEscolhidaAluno,
        status: "pendente",
      });
    } catch (error) {
      console.error("Erro ao vincular escola:", error);
      alert("Falha ao selecionar escola. Tente novamente.");
    } finally {
      setSalvandoVinculo(false);
    }
  };

  // Funções de Gerenciamento do Professor / SuperAdmin
  const editarNomeEscola = async () => {
    if (!escolaAtiva) return;
    const escolaAtual = listaEscolas.find((e) => e.id === escolaAtiva);
    const novoNome = prompt("Digite o novo nome para esta Unidade Escolar:", escolaAtual?.nome || "");
    if (!novoNome || !novoNome.trim()) return;

    try {
      await updateDoc(doc(db, "escolas", escolaAtiva), { nome: novoNome.trim() });
    } catch (error) {
      console.error("Erro ao atualizar escola:", error);
    }
  };

  const adicionarNovaEscola = async () => {
    const nomeEscola = prompt("Digite o nome da nova Unidade Escolar:");
    if (!nomeEscola || !nomeEscola.trim()) return;

    const escolaId = nomeEscola
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 ]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    try {
      await setDoc(doc(db, "escolas", escolaId), { nome: nomeEscola.trim() });
      setEscolaAtiva(escolaId);
    } catch (error) {
      console.error("Erro ao adicionar escola:", error);
    }
  };

  const criarNovoGrupo = async () => {
    if (!escolaAtiva) return;
    const gruposDaEscolaAtual = listaGrupos.filter((g) => String(g.escolaId) === String(escolaAtiva));
    const proximoId =
      gruposDaEscolaAtual.length > 0
        ? Number(gruposDaEscolaAtual[gruposDaEscolaAtual.length - 1].id) + 1
        : 1;

    try {
      await setDoc(doc(db, "grupos", `${escolaAtiva}_${proximoId}`), {
        id: String(proximoId),
        nome: `Grupo ${proximoId} - Novo Projeto`,
        integrantes: "A definir",
        progresso: 0,
        escolaId: escolaAtiva,
      });
    } catch (error) {
      console.error("Erro ao instanciar novo grupo:", error);
    }
  };

  const atualizarAcessoAluno = useCallback(
    async (uid, novaEscolaId, novoGrupoDocId, tornarLider) => {
      try {
        const userRef = doc(db, "usuarios", uid);
        const grupoDocId = novoGrupoDocId === "" ? null : novoGrupoDocId;
        const novoPapel = tornarLider ? "lider" : "aluno";

        await updateDoc(userRef, {
          grupoId: grupoDocId,
          escolaId: novaEscolaId || escolaAtiva,
          escolaSolicitadaId: novaEscolaId || escolaAtiva,
          papel: novoPapel,
          perfil: novoPapel,
          status: grupoDocId ? "aprovado" : "pendente",
        });
        alert("Permissões do estudante atualizadas!");
      } catch (error) {
        console.error("Erro ao atualizar aluno:", error);
      }
    },
    [escolaAtiva]
  );

  const atualizarAcessoProfessor = useCallback(
    async (uid, listaEscolasSelecionadas) => {
      try {
        await updateDoc(doc(db, "usuarios", uid), {
          escolas: listaEscolasSelecionadas,
          escolaId: listaEscolasSelecionadas[0] || "escola-padrao",
          papel: "professor",
          perfil: "professor",
          status: "aprovado",
        });
        alert("Atribuições docentes salvas com sucesso!");
      } catch (error) {
        console.error("Erro ao atualizar professor:", error);
      }
    },
    []
  );

  const excluirUsuario = async (uid, nome) => {
    if (window.confirm(`Tem certeza que deseja excluir o cadastro de "${nome || "este usuário"}"?`)) {
      try {
        await deleteDoc(doc(db, "usuarios", uid));
        alert("Usuário excluído!");
      } catch (error) {
        console.error("Erro ao excluir usuário:", error);
      }
    }
  };

  // Regras de Visibilidade
  const escolasVisiveisDoProfessor = useMemo(() => {
    if (ehSuperAdmin) return listaEscolas;
    return listaEscolas.filter(
      (e) => usuario?.escolas?.includes(e.id) || e.id === usuario?.escolaId
    );
  }, [listaEscolas, ehSuperAdmin, usuario]);

  const gruposVisiveis = useMemo(() => {
    if (ehProfessor) {
      return listaGrupos.filter((g) => String(g.escolaId) === String(escolaAtiva));
    }
    return listaGrupos.filter((g) => String(g.docId) === String(usuario?.grupoId));
  }, [listaGrupos, ehProfessor, escolaAtiva, usuario]);

  // CORREÇÃO DO BUG DE VISIBILIDADE:
  // Filtra alunos pendentes comparando String de ID da escola ativa corrente
  const alunosPendentes = useMemo(() => {
    return listaUsuarios.filter((usr) => {
      const papel = usr.papel || usr.perfil;
      const ehDocente = papel === "professor" || papel === "superadmin";
      if (ehDocente) return false;

      const estaPendente = !usr.grupoId || usr.status === "pendente";
      if (!estaPendente) return false;

      const escolaDoAluno = String(usr.escolaSolicitadaId || usr.escolaId || "");
      return escolaDoAluno === String(escolaAtiva);
    });
  }, [listaUsuarios, escolaAtiva]);

  const alunosAtivosNaEscola = useMemo(() => {
    return listaUsuarios.filter((usr) => {
      const papel = usr.papel || usr.perfil;
      const ehDocente = papel === "professor" || papel === "superadmin";
      if (ehDocente) return false;

      const escolaDoAluno = String(usr.escolaId || usr.escolaSolicitadaId || "");
      return usr.grupoId && escolaDoAluno === String(escolaAtiva);
    });
  }, [listaUsuarios, escolaAtiva]);

  const listaDocentes = useMemo(() => {
    return listaUsuarios.filter((usr) => {
      const papel = usr.papel || usr.perfil;
      return (papel === "professor" || papel === "superadmin") && usr.uid !== usuario?.uid;
    });
  }, [listaUsuarios, usuario]);

  const nomeDaEscolaAtual =
    listaEscolas.find((e) => String(e.id) === String(escolaAtiva))?.nome || "Unidade Escolar";

  if (carregando) {
    return (
      <>
        <Header />
        <div style={{ padding: "40px", textAlign: "center" }}>
          <h2>Carregando painel...</h2>
        </div>
      </>
    );
  }

  if (!ehProfessor && !temGrupo) {
    return (
      <>
        <Header />
        <StudentPendingView
          usuario={usuario}
          listaEscolas={listaEscolas}
          escolaEscolhida={escolaEscolhidaAluno}
          onSelectEscolaChange={setEscolaEscolhidaAluno}
          onSalvar={salvarEscolaDoAluno}
          salvando={salvandoVinculo}
        />
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={{ padding: "40px" }}>
        {ehProfessor && (
          <SchoolSelectorTabs
            escolasVisiveis={escolasVisiveisDoProfessor}
            escolaAtiva={escolaAtiva}
            onSelectEscola={setEscolaAtiva}
            ehSuperAdmin={ehSuperAdmin}
            onAddEscola={adicionarNovaEscola}
          />
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <h1 style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {ehProfessor ? `Painel Docente — ${nomeDaEscolaAtual}` : "Seu Projeto Multidisciplinar"}
            {ehProfessor && (
              <button onClick={editarNomeEscola} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem" }}>
                ✏️
              </button>
            )}
          </h1>
          {ehProfessor && (
            <button
              onClick={criarNovoGrupo}
              style={{
                padding: "10px 20px",
                backgroundColor: "#00875a",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              ➕ Criar Novo Grupo nesta Escola
            </button>
          )}
        </div>

        {/* Cards dos Grupos */}
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          {gruposVisiveis.length === 0 ? (
            <p style={{ color: "#5e6c84", fontStyle: "italic" }}>
              Nenhum grupo instanciado para esta unidade escolar.
            </p>
          ) : (
            gruposVisiveis.map((grupo) => (
              <GroupCard
                key={grupo.docId}
                docId={grupo.docId}
                id={grupo.id}
                nome={grupo.nome}
                integrantes={`${contagemIntegrantesPorGrupo[String(grupo.docId)] || 0} estudante(s)`}
                progresso={grupo.progresso}
              />
            ))
          )}
        </div>

        {/* Seções de Gestão */}
        {ehProfessor && (
          <div style={{ marginTop: "50px", display: "flex", flexDirection: "column", gap: "30px" }}>
            <PendingStudentsTable
              alunosPendentes={alunosPendentes}
              listaEscolas={listaEscolas}
              listaGrupos={listaGrupos}
              escolaAtiva={escolaAtiva}
              ehSuperAdmin={ehSuperAdmin}
              escolasDoProf={usuario?.escolas || []}
              onSalvarAluno={atualizarAcessoAluno}
              onExcluir={excluirUsuario}
            />

            <ActiveStudentsTable
              alunosAtivos={alunosAtivosNaEscola}
              gruposVisiveis={gruposVisiveis}
              escolaAtiva={escolaAtiva}
              nomeDaEscola={nomeDaEscolaAtual}
              onSalvarAluno={atualizarAcessoAluno}
              onExcluir={excluirUsuario}
            />

            {ehSuperAdmin && (
              <TeacherManagement
                listaDocentes={listaDocentes}
                listaEscolas={listaEscolas}
                onSalvarProfessor={atualizarAcessoProfessor}
                onExcluir={excluirUsuario}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default Dashboard;