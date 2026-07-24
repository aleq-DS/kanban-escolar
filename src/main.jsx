import React from 'react'
import ReactDOM from 'react-dom/client'


import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx' // <-- IMPORTA O PROVIDER

import "./styles/theme.css"

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        {/* Abraçamos o App com o Provedor de Autenticação */}
        <AuthProvider>
            <App />
        </AuthProvider>
    </React.StrictMode>
)