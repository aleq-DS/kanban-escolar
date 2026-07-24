import { auth, db } from "../firebase/firebaseConfig";
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signOut 
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

const provider = new GoogleAuthProvider();

const EMAIL_SUPERADMIN = import.meta.env.VITE_SUPERADMIN_EMAIL?.toLowerCase();
const rawProfsEnv = import.meta.env.VITE_PROFESSORES_EMAILS || import.meta.env.VITE_PROFESSOR_EMAIL || "";
const EMAILS_PROFESSORES = rawProfsEnv
    .toLowerCase()
    .split(",")
    .map(email => email.trim())
    .filter(Boolean);

const salvarPerfilNoFirestore = async (user, nomeCustomizado = null) => {
    const userRef = doc(db, "usuarios", user.uid);
    const docSnap = await getDoc(userRef);
    const emailUser = user.email.toLowerCase();

    let papelEsperado = "aluno";
    if (emailUser === EMAIL_SUPERADMIN) {
        papelEsperado = "superadmin";
    } else if (EMAILS_PROFESSORES.includes(emailUser)) {
        papelEsperado = "professor";
    }

    if (docSnap.exists()) {
        const dadosExistentes = docSnap.data();
        const papelAtual = dadosExistentes.papel || dadosExistentes.perfil;

        if (papelAtual !== papelEsperado && papelEsperado !== "aluno") {
            const atualizacao = { 
                papel: papelEsperado,
                perfil: papelEsperado 
            };
            
            if (papelEsperado === "superadmin") {
                atualizacao.status = "aprovado";
                atualizacao.escolaId = "TODAS";
            }

            if (!dadosExistentes.nome) {
                atualizacao.nome = user.displayName || "Usuário";
            }

            await updateDoc(userRef, atualizacao);
            return { ...dadosExistentes, ...atualizacao };
        }

        return dadosExistentes;
    }

    const nomeFinal = nomeCustomizado || user.displayName || (
        papelEsperado === "professor" ? "Professor(a)" : 
        papelEsperado === "superadmin" ? "Super Admin" : "Estudante"
    );

    const ehSuperAdmin = papelEsperado === "superadmin";

    const dadosPerfil = {
        uid: user.uid,
        nome: nomeFinal,
        email: user.email,
        papel: papelEsperado,
        perfil: papelEsperado,
        status: ehSuperAdmin ? "aprovado" : "pendente",
        escolaSolicitadaId: null,
        escolaId: ehSuperAdmin ? "TODAS" : null,
        escolas: ehSuperAdmin ? ["TODAS"] : [],
        grupoId: null,
        criadoEm: new Date().toISOString()
    };

    await setDoc(userRef, dadosPerfil);
    return dadosPerfil;
};

export const authService = {
    cadastrarComEmail: async (nome, email, senha) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        const perfil = await salvarPerfilNoFirestore(userCredential.user, nome);
        return { user: userCredential.user, perfil };
    },

    loginComEmail: async (email, senha) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, senha);
        const perfil = await salvarPerfilNoFirestore(userCredential.user);
        return { user: userCredential.user, perfil };
    },

    loginComGoogle: async () => {
        const result = await signInWithPopup(auth, provider);
        const perfil = await salvarPerfilNoFirestore(result.user);
        return { user: result.user, perfil };
    },

    deslogar: async () => {
        await signOut(auth);
    }
};