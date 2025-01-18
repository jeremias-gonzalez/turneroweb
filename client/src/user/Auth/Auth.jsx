import React, { useState } from "react";
import axios from "axios";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true); // Cambiar entre Login y Register
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    numero: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar u ocultar la contraseña

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError("");
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isLogin
      ? "http://localhost:5000/api/login"
      : "http://localhost:5000/api/register";

    try {
      const response = await axios.post(url, formData);
      const { token, message } = response.data;

      if (isLogin) {
        localStorage.setItem("token", token);
        alert(message);
        // Redirigir al panel de reservas
        window.location.href = "/";
      } else {
        alert(message); // Mostrar mensaje de registro exitoso
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error en el servidor");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4">
          {isLogin ? "Iniciar Sesión" : "Registrar"}
        </h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none"
                required={!isLogin}
              />
            </div>
          )}
          <div>
            <label className="block font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} // Mostrar u ocultar la contraseña
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)} // Alternar visibilidad
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? "Ocultar" : "Ver"}
              </button>
            </div>
          </div>
          {!isLogin && (
            <div>
              <label className="block font-medium text-gray-700">Número</label>
              <input
                type="number"
                name="numero"
                value={formData.numero}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none"
                required={!isLogin}
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white rounded-lg py-2 font-medium hover:bg-blue-600"
          >
            {isLogin ? "Iniciar Sesión" : "Registrar"}
          </button>
        </form>
        <div className="text-center mt-4">
          <p>
            {isLogin
              ? "¿No tienes una cuenta? "
              : "¿Ya tienes una cuenta? "}
            <span
              onClick={toggleForm}
              className="text-blue-500 cursor-pointer hover:underline"
            >
              {isLogin ? "Regístrate" : "Inicia Sesión"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
