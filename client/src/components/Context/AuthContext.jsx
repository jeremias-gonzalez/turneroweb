import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  useEffect(() => {
    const storedUser = localStorage.getItem("cliente");
    if (storedUser) {
      const cliente = JSON.parse(storedUser);
      console.log("Datos del cliente desde localStorage:", cliente);
      setUser(cliente);
    }
  }, []);
  
  
  const login = (token, cliente) => {
    console.log("Cliente en login:", cliente);  // Verifica los valores
    if (cliente && cliente.name && cliente.phone) {
      localStorage.setItem("token", token);
      localStorage.setItem("cliente", JSON.stringify(cliente));  // Guarda los datos del cliente
      setUser(cliente);
      setIsAuthenticated(true);
    } else {
      console.error("Datos incompletos del cliente.");
    }
  };
  
  
  

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("cliente");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
