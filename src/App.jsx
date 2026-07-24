import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Kanban from "./pages/Kanban";
import Login from "./pages/Login";

// Componente interno para proteção de rotas privadas
function RotaProtegida({ children }) {
  const { usuario, carregando, logado } = useAuth();

  // Tratamento do estado de carregamento do Firebase
  if (carregando) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h3>Carregando dados...</h3>
      </div>
    );
  }

  // Verifica se está logado
  if (!logado && !usuario) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    // Substituído BrowserRouter por HashRouter sem o basename
    <HashRouter>
      <Routes>
        {/* Rota Pública */}
        <Route path="/login" element={<Login />} />

        {/* Rotas Protegidas */}
        <Route
          path="/"
          element={
            <RotaProtegida>
              <Home />
            </RotaProtegida>
          }
        />

        <Route
          path="/dashboard"
          element={
            <RotaProtegida>
              <Dashboard />
            </RotaProtegida>
          }
        />

        <Route
          path="/kanban/:grupoDocId"
          element={
            <RotaProtegida>
              <Kanban />
            </RotaProtegida>
          }
        />

        {/* Redirecionamento Padrão */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;