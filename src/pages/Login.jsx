import { useState } from "react";
import { authService } from "../services/authService";
import { useNavigate } from "react-router-dom";

function Login() {
  const [ehCadastro, setEhCadastro] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      if (ehCadastro) {
        if (!nome.trim()) throw new Error("O nome é obrigatório.");
        await authService.cadastrarComEmail(nome, email, senha);
      } else {
        await authService.loginComEmail(email, senha);
      }
      
      // Sempre direciona para o Dashboard (o Dashboard decide o que mostrar)
      navigate("/dashboard");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setErro("Este e-mail já está cadastrado.");
      } else if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/invalid-credential"
      ) {
        setErro("E-mail ou senha incorretos.");
      } else {
        setErro(err.message || "Ocorreu um erro. Tente novamente.");
      }
    } finally {
      setCarregando(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErro("");
    try {
      await authService.loginComGoogle();
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setErro("Falha ao entrar com o Google.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>{ehCadastro ? "Criar Conta Escolar" : "Acessar Kanban"}</h2>

        {erro && <p style={styles.error}>{erro}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {ehCadastro && (
            <input
              type="text"
              placeholder="Nome Completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              style={styles.input}
              required
            />
          )}
          <input
            type="email"
            placeholder="E-mail Institucional ou Pessoal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            style={styles.input}
            required
          />

          <button type="submit" disabled={carregando} style={styles.button}>
            {carregando ? "Processando..." : ehCadastro ? "Cadastrar" : "Entrar"}
          </button>
        </form>

        <div style={styles.divider}>ou</div>

        <button onClick={handleGoogleLogin} style={styles.googleButton}>
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            style={styles.googleIcon}
          />
          Entrar com o Google
        </button>

        <p style={styles.toggleText}>
          {ehCadastro ? "Já tem uma conta?" : "Novo por aqui?"}{" "}
          <span
            onClick={() => setEhCadastro(!ehCadastro)}
            style={styles.toggleLink}
          >
            {ehCadastro ? "Faça login" : "Cadastre-se"}
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f4f5f7" },
  card: { padding: "2.5rem", borderRadius: "8px", backgroundColor: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", width: "100%", maxWidth: "400px", textAlign: "center" },
  form: { display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" },
  input: { padding: "0.75rem", borderRadius: "4px", border: "1px solid #ccc", fontSize: "1rem" },
  button: { padding: "0.75rem", borderRadius: "4px", border: "none", backgroundColor: "#0052cc", color: "#fff", fontSize: "1rem", fontWeight: "bold", cursor: "pointer" },
  divider: { margin: "1.5rem 0", color: "#777", position: "relative" },
  googleButton: { display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", width: "100%", padding: "0.75rem", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: "#fff", fontSize: "1rem", cursor: "pointer" },
  googleIcon: { width: "18px", height: "18px" },
  error: { color: "#de350b", backgroundColor: "#ffebe6", padding: "0.5rem", borderRadius: "4px", fontSize: "0.9rem" },
  toggleText: { marginTop: "1.5rem", fontSize: "0.9rem", color: "#5e6c84" },
  toggleLink: { color: "#0052cc", cursor: "pointer", fontWeight: "bold", textDecoration: "underline" }
};

export default Login;