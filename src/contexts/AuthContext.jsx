import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { authService } from "../services/authService";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // Função de logout utilizando o serviço configurado no projeto
  const logout = async () => {
    try {
      await authService.deslogar();
    } catch (error) {
      console.error("Erro ao deslogar pelo contexto:", error);
    }
  };

  // Função para registrar papel e escola solicitada no primeiro acesso (Onboarding)
  const salvarSolicitacaoAcesso = async (papelEscolhido, escolaIdEscolhida) => {
    if (!usuario?.uid) return;

    try {
      const userRef = doc(db, "usuarios", usuario.uid);
      await setDoc(
        userRef,
        {
          papel: papelEscolhido,
          escolaSolicitadaId: escolaIdEscolhida,
          status: "pendente",
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Erro ao salvar solicitação de acesso:", error);
      throw error;
    }
  };

  useEffect(() => {
    let unsubscribeFirestore = null;

    // Monitora autenticação no Firebase Auth
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, "usuarios", firebaseUser.uid);

        // Escuta atualizações do perfil no Firestore em tempo real (ex: aprovação de acesso)
        unsubscribeFirestore = onSnapshot(
          userRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const dadosBanco = docSnap.data();
              setUsuario({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                ...dadosBanco,
                // Retrocompatibilidade caso o campo 'perfil' antigo exista
                papel: dadosBanco.papel || dadosBanco.perfil || null,
                status: dadosBanco.status || (dadosBanco.grupoId ? "aprovado" : "pendente"),
              });
            } else {
              // Estrutura inicial para novos cadastros aguardando onboarding
              setUsuario({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                papel: null,
                status: "pendente",
                escolaSolicitadaId: null,
                escolaId: null,
                grupoId: null,
              });
            }
            setCarregando(false);
          },
          (error) => {
            console.error("Erro ao buscar perfil do usuário no Firestore:", error);
            setCarregando(false);
          }
        );
      } else {
        setUsuario(null);
        if (unsubscribeFirestore) unsubscribeFirestore();
        setCarregando(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        logado: !!usuario,
        carregando,
        logout,
        salvarSolicitacaoAcesso,
      }}
    >
      {!carregando && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}