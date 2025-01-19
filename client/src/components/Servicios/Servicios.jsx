import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, eachHourOfInterval } from "date-fns";
import axios from "axios";
import { gapi } from "gapi-script";
import { useAuth } from "../../components/Context/AuthContext";
import Modal from "../ModalCalendar/ModalCalendar"; // Importa el modal

const Servicios = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth(); // Accediendo al contexto de autenticación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => setIsAnimating(true), 10); // Añade una pequeña demora para animación de entrada
    } else {
      setIsAnimating(false);
    }
  }, [isModalOpen]);

  const servicios = [
    { imgUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdGYoPxqtp6AIM0nnTFPOvt8rrI5Any0P3PA&s", nombre: "Corte de Pelo", duracion: "30 min", precio: "8.000" },
    { imgUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCposOC8yyOrzGBTmnklKFpoZu8egjOUAI7g&s", nombre: "Corte de Pelo + Barba", duracion: "40 min", precio: "10.000" },
    { imgUrl: "https://st4allthings4p4ci.blob.core.windows.net/allthingshair/allthingshair/wp-content/uploads/sites/5/2023/11/78892/ATH.jpg", nombre: "Color a elección", duracion: "3 horas", precio: "15.000" },
  ];

  useEffect(() => {
    try {
      gapi.load("client:auth2", initClient);
    } catch (error) {
      console.error("Error al cargar gapi:", error);
    }
  }, []);

  const initClient = () => {
    gapi.client.init({
      apiKey: "AIzaSyCzSIUQvcs1I8L1g6lFuGo3QFwQeA7wHX8",
      clientId: "860510082449-6ei37t6drodt05s26752pi5bapbvuc68.apps.googleusercontent.com",
      scope: "https://www.googleapis.com/auth/calendar",
      discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
    });
  };

  const handleButtonClick = (servicio) => {
    setSelectedService(servicio);
    setSelectedDate(addDays(new Date(), 0));
    setSchedule(generateSchedule(new Date()));
    setIsModalOpen(true);
  };

  const generateSchedule = (date) => {
    const startHour = new Date(date.setHours(9, 0, 0)); // 9:00 AM
    const endHour = new Date(date.setHours(18, 0, 0)); // 6:00 PM
    return eachHourOfInterval({ start: startHour, end: endHour }).map((hour) => ({
      time: format(hour, "hh:mm a"),
      available: true,
    }));
  };

  const handleDateChange = (daysToAdd) => {
    const newDate = addDays(currentMonth, daysToAdd);
    setCurrentMonth(newDate);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
    setSchedule([]);
    setSelectedService(null);
    setSelectedHour(null);
  };

  const handleReserve = async () => {
    console.log("Usuario autenticado:", user); // Aquí agregamos el console.log para verificar los datos de `user`
    
    if (!isAuthenticated) {
      console.error("El usuario no está autenticado.");
      alert("Por favor, inicie sesión para realizar una reserva");
      return;
    }
  
    if (!selectedService) {
      alert("Por favor, selecciona un servicio");
      return;
    }
  
    if (!selectedHour) {
      alert("Por favor, selecciona una hora para tu turno");
      return;
    }
  
    // Datos del usuario
    const { name, phone } = user || {};
    
    console.log("Datos del usuario:", { name, phone }); // Verifica si 'name' y 'phone' están definidos
  
    if (!name || !phone) {
      alert("Faltan datos del usuario.");
      return;
    }
  
    // Enviar datos al backend
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await axios.post(`${backendUrl}/api/crear-turno`, {
        nombre: name,
        telefono: phone,
        fecha: format(selectedDate, "yyyy-MM-dd"),
        hora: selectedHour,
        servicio: selectedService.nombre,
      });
  
      if (response.status === 200) {
        alert("¡Turno reservado con éxito!");
        closeModal();
      }
    } catch (error) {
      console.error("Error al reservar el turno:", error);
      alert(`Error al reservar el turno: ${error.response?.data?.message || "Inténtalo nuevamente."}`);
    }
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });


  return (
    <div className="flex flex-col items-center min-h-screen py-8">
      <h1 className="text-xl font-semibold text-gray-800 mb-6">Mis Servicios</h1>
      <div className="w-full mt-4 max-w-4xl mx-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {servicios.map((servicio, index) => (
          <div key={index} className="bg-white border border-gray-300 mx-5 rounded-xl shadow-lg overflow-hidden">
            <img src={servicio.imgUrl} alt={servicio.nombre} className="w-96 h-86 p-2 rounded-xl" />
            <div className="p-4 grid grid-cols-2 gap-4 items-start md:items-center">
              <div className="flex flex-col gap-4">
                <div className="text-lg poppins-semibold text-gray-700">{servicio.nombre}</div>
                <button
                  onClick={() => handleButtonClick(servicio)}
                  className="w-full  poppins-semibold bg-white text-blue-900 border shadow-sm rounded-full py-2"
                >
                  Reservar
                </button>
              </div>
              <div className="flex flex-col gap-4 text-right">
                <div className="flex items-center justify-end text-sm text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="15" height="15" viewBox="0 0 50 50">
<path d="M 25 2 C 12.309295 2 2 12.309295 2 25 C 2 37.690705 12.309295 48 25 48 C 37.690705 48 48 37.690705 48 25 C 48 12.309295 37.690705 2 25 2 z M 25 4 C 36.609824 4 46 13.390176 46 25 C 46 36.609824 36.609824 46 25 46 C 13.390176 46 4 36.609824 4 25 C 4 13.390176 13.390176 4 25 4 z M 24.984375 6.9863281 A 1.0001 1.0001 0 0 0 24 8 L 24 22.173828 A 3 3 0 0 0 22 25 A 3 3 0 0 0 22.294922 26.291016 L 16.292969 32.292969 A 1.0001 1.0001 0 1 0 17.707031 33.707031 L 23.708984 27.705078 A 3 3 0 0 0 25 28 A 3 3 0 0 0 28 25 A 3 3 0 0 0 26 22.175781 L 26 8 A 1.0001 1.0001 0 0 0 24.984375 6.9863281 z"></path>
</svg>
                  <p className="mx-1 poppins-semibold">{servicio.duracion}</p>
                  
                </div>
                <div className="text-lg poppins-semibold mt-2 text-gray-700">${servicio.precio} ARS</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isModalOpen={isModalOpen}
        isAnimating={isAnimating}
        closeModal={closeModal}
        selectedService={selectedService}
        selectedDate={selectedDate}
        schedule={schedule}
        handleDateChange={handleDateChange}
        daysInMonth={daysInMonth}
        setSelectedDate={setSelectedDate}
        selectedHour={selectedHour}
        setSelectedHour={setSelectedHour}
        handleReserve={handleReserve}
        currentMonth={currentMonth}
      />
    </div>
  );
};

export default Servicios;
