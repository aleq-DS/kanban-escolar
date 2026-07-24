import "../../styles/header.css";
import logo from "../../assets/logo/logo.svg";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function Header() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const lidarComBotaoAcesso = () => {
    if (usuario) {
      logout();
      navigate("/");
    } else {
      navigate("/login");
    }
  };

  // Identifica o papel do usuário priorizando 'papel' ou 'perfil'
  const papel = usuario?.papel || usuario?.perfil;

  // Lógica de ícone condicional por função
  const obterIconeEPerfil = () => {
    if (papel === "superadmin") {
      return { icone: "👑", titulo: "SuperAdmin" };
    }
    if (papel === "professor") {
      return { icone: "👨‍🏫", titulo: "Professor" };
    }
    if (papel === "lider") {
      return { icone: "⭐", titulo: "Líder de Grupo" };
    }
    return { icone: "🎓", titulo: "Estudante" };
  };

  const { icone, titulo } = obterIconeEPerfil();

  return (
    <header className="header">
      <div className="logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
        <img
          src={logo}
          alt="SpreadsProject"
          className="logo-image"
        />
        <div>
          <h1>SpreadsProject</h1>
          <span>KanbanMulti</span>
        </div>
      </div>

      <nav style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Informações de Perfil do Usuário Logado */}
        {usuario && (
          <div className="user-profile" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="user-name" style={{ fontWeight: "500", color: "#f9fafc", fontSize: "0.85rem" }}>
              Olá, {(usuario.nome || usuario.displayName || "Usuário").split(" ")[0]}
            </span>

            {/* ÍCONE CONDICIONAL COM COROA PARA SUPERADMIN */}
            <span 
              title={titulo} 
              style={{ fontSize: "1rem", cursor: "help", display: "flex", alignItems: "center" }}
            >
              {icone}
            </span>
            
            {/* Renderização da Foto Real ou Inicial Alternativa */}
            {usuario.photoURL ? (
              <img 
                src={usuario.photoURL} 
                alt="Perfil" 
                referrerPolicy="no-referrer"
                style={{ 
                  width: "30px", 
                  height: "30px", 
                  borderRadius: "50%", 
                  objectFit: "cover",
                  border: "1.5px solid rgba(255,255,255,0.6)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.15)"
                }}
              />
            ) : (
              <div style={{ 
                width: "30px", 
                height: "30px", 
                borderRadius: "50%", 
                backgroundColor: "#0052cc", 
                color: "#fff", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "0.8rem",
                boxShadow: "0 1px 3px rgba(0,0,0,0.15)"
              }}>
                {(usuario.nome || usuario.email || "U").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        )}

        {/* Botão Sair / Entrar */}
        <button 
          className="login-button" 
          onClick={lidarComBotaoAcesso}
          style={{
            padding: "6px 14px",
            fontSize: "0.85rem",
            borderRadius: "4px"
          }}
        >
          {usuario ? "Sair" : "Entrar"}
        </button>
      </nav>
    </header>
  );
}

export default Header;