import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar/Navbar";
import { useAuth } from "../../components/Context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import Footer from "../../components/Footer/Footer";
import Skeleton from "react-loading-skeleton"; // Asegúrate de instalar react-loading-skeleton
import "react-loading-skeleton/dist/skeleton.css"; // Asegúrate de importar los estilos

const Account = () => {
  const { logout } = useAuth();
  const [userData, setUserData] = useState({
    nombre: "",
    email: "",
    numero: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true); // Estado para manejar la carga

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/account", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(response.data);
        setLoading(false); // Datos cargados, cambia el estado a falso
      } catch (error) {
        console.error("Error al obtener los datos del usuario:", error);
        alert("No se pudieron cargar los datos del usuario");
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:5000/api/account",
        { ...userData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsEditing(false);
      alert("Datos actualizados con éxito");
    } catch (error) {
      console.error("Error al actualizar los datos:", error);
      alert("Hubo un error al actualizar los datos");
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <Navbar />
      <div className="mt-28 p-3">
        <div className="text-center">
          <p className="text-red-500 poppins-bold text-2xl">IMPORTANTE‼</p>
        </div>
        <div className="text-center">
          <p className="poppins-medium">
            Los datos de tu cuenta deben coincidir con los datos al momento de
            realizar la transferencia al barbero
          </p>
        </div>
      </div>
      <div className="account-container mt- mx-auto max-w-lg bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl poppins-bold mb-4 text-center">Mi cuenta</h1>

        {/* Skeleton Loader */}
        <div className="mb-4">
          <label className="block text-blue poppins-regular mb-2">Nombre:</label>
          {loading ? (
            <Skeleton height={40} count={1} borderRadius={12} />
          ) : (
            <input
              type="text"
              name="nombre"
              value={userData.nombre}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full px-4 py-2 poppins-light rounded-xl border ${
                isEditing ? "border-yellow-900 rounded-full" : "border-gray-300"
              }`}
            />
          )}
        </div>

        <div className="mb-4">
          <label className="block text-blue poppins-regular mb-2">Email:</label>
          {loading ? (
            <Skeleton height={40} count={1} borderRadius={12} />
          ) : (
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full px-4 py-2 poppins-light rounded-xl border ${
                isEditing ? "border-yellow-900 rounded-full" : "border-gray-300"
              }`}
            />
          )}
        </div>

        <div className="mb-4">
          <label className="block text-blue poppins-regular mb-2">Número:</label>
          {loading ? (
            <Skeleton height={40} count={1} borderRadius={12} />
          ) : (
            <input
              type="text"
              name="numero"
              value={userData.numero}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full px-4 py-2 poppins-light rounded-xl border ${
                isEditing ? "border-yellow-900 rounded-full" : "border-gray-300"
              }`}
            />
          )}
        </div>

        <div className="flex justify-between items-center">
          {isEditing ? (
            <>
              <button
                onClick={handleUpdate}
                className="text-blue poppins-regular px-4 py-2 flex items-center"
              >
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                Guardar
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="text-blue poppins-regular px-4 py-2 flex items-center"
              >
                <FontAwesomeIcon icon={faTimes} className="mr-2" />
                Cancelar
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue poppins-regular px-4 py-2 rounded flex items-center"
            >
              <FontAwesomeIcon icon={faEdit} className="mr-2" />
              Editar
            </button>
          )}
        </div>
      </div>
      <div className="mt-10">
        <Footer />
      </div>
    </>
  );
};

export default Account;

