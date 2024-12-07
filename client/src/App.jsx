import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "./user/Auth/Auth";
import Home from "./components/Home/Home";
import { AuthProvider } from "./components/Context/AuthContext";
const App = () => {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <AuthProvider>
    <Routes>
      {/* Home es público */}
      <Route path="/" element={<Home />} />

      {/* Ruta pública para login/register */}
      <Route path="/auth" element={isAuthenticated ? <Navigate to="/" /> : <Auth />} />

      {/* Ruta protegida para reservas */}
      {/* <Route path="/reservas" element={isAuthenticated ? <Reservas /> : <Navigate to="/auth" />} /> */}

      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
    </AuthProvider>
  );
};

export default App;
