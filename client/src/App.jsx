import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./user/Login/Login"; // Importa el nuevo componente Login
import Register from "./user/Register/Register"; // Importa el nuevo componente Register
import Home from "./components/Home/Home";
import { AuthProvider } from "./components/Context/AuthContext";
import Account from "./user/Account/Account";
import { TurnosClient } from "./user/TurnosClient/TurnosClient";

const App = () => {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <AuthProvider>
      <Routes>
        {/* Página pública: Home */}
        <Route path="/" element={<Home />} />
        
        {/* Página pública: Auth (Login y Register) */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/" /> : <Register />} 
        />

        {/* Páginas protegidas */}
        <Route 
          path="/micuenta" 
          element={isAuthenticated ? <Account /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/mis-turnos" 
          element={isAuthenticated ? <TurnosClient /> : <Navigate to="/login" />} 
        />

        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
