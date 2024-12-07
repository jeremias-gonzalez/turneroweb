import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const handleLogout = () => {
    logout(); // Actualiza el estado global de autenticación
    setIsOpen(false); // Cierra el menú móvil si está abierto
    navigate("/auth"); // Redirige al login
  };

  const navigateTo = (path) => {
    setIsOpen(false); // Cierra el menú móvil si está abierto
    navigate(path);
  };

  return (
    <nav className="bg-gray-800 text-white z-50 fixed w-full top-0 left-0 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div>
            <a
              onClick={() => navigateTo("/")}
              className="text-lg font-bold cursor-pointer"
            >
              Logo
            </a>
          </div>

          {/* Toggler para menú móvil */}
          <div className="sm:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              <svg
                className="h-8 w-8"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isOpen
                      ? "M6 18L18 6M6 6l12 12" // Icono de cierre (X)
                      : "M4 6h16M4 12h16M4 18h16" // Icono de hamburguesa
                  }
                />
              </svg>
            </button>
          </div>

          {/* Menú Desktop */}
          <div className="hidden sm:flex space-x-6">
            <a
              onClick={() => navigateTo("/")}
              className="cursor-pointer hover:text-gray-300"
            >
              Inicio
            </a>
            {isAuthenticated ? (
              <>
                <a
                  onClick={() => navigateTo("/reservar")}
                  className="cursor-pointer hover:text-gray-300"
                >
                  Mis Turnos
                </a>
                <a
                  onClick={handleLogout}
                  className="cursor-pointer hover:text-gray-300"
                >
                  Cerrar Sesión
                </a>
              </>
            ) : (
              <>
                <a
                  onClick={() => navigateTo("/auth")}
                  className="cursor-pointer hover:text-gray-300"
                >
                  Iniciar Sesión
                </a>
                <a
                  onClick={() => navigateTo("/auth")}
                  className="cursor-pointer hover:text-gray-300"
                >
                  Registrarse
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Menú Móvil */}
      <div
        className={`fixed top-0 left-0 w-full h-full bg-gray-800 text-white z-40 transition-transform transform ${
          isOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        } sm:hidden`}
        style={{ transition: "transform 0.4s ease, opacity 0.4s ease" }}
      >
        <button
          onClick={toggleMenu}
          className="absolute top-4 right-4 text-gray-300 hover:text-white focus:outline-none"
        >
          <svg
            className="h-8 w-8"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <nav className="flex flex-col items-center justify-center space-y-6 mt-16">
          <a
            onClick={() => navigateTo("/")}
            className="text-xl hover:text-gray-300 cursor-pointer"
          >
            Inicio
          </a>
          {isAuthenticated ? (
            <>
              <a
                onClick={() => navigateTo("/reservar")}
                className="text-xl hover:text-gray-300 cursor-pointer"
              >
                Mis Turnos
              </a>
              <a
                onClick={handleLogout}
                className="text-xl hover:text-gray-300 cursor-pointer"
              >
                Cerrar Sesión
              </a>
            </>
          ) : (
            <>
              <a
                onClick={() => navigateTo("/auth")}
                className="text-xl hover:text-gray-300 cursor-pointer"
              >
                Iniciar Sesión
              </a>
              <a
                onClick={() => navigateTo("/auth")}
                className="text-xl hover:text-gray-300 cursor-pointer"
              >
                Registrarse
              </a>
            </>
          )}
        </nav>
      </div>
    </nav>
  );
};

export default Navbar;
