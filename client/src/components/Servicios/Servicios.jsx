import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays, eachHourOfInterval } from "date-fns";
import axios from "axios"; // Asegúrate de tener axios instalado

const Servicios = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [selectedService, setSelectedService] = useState(null); // Nuevo estado para el servicio
  const [isLoading, setIsLoading] = useState(false);

  const servicios = [
    {
      imgUrl:
        "https://i.pinimg.com/236x/8c/fb/97/8cfb9734a4b89553a64a1c07c9631f47.jpg",
      nombre: "Corte de Pelo",
      duracion: "30 min",
      precio: "8.000",
    },
    {
      imgUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTt6yanByTNcn2XpQo9CDKuHZy62ALAfUA2fQ&s",
      nombre: "Corte de Pelo + Barba",
      duracion: "40 min",
      precio: "10.000",
    },
    {
      imgUrl:
        "https://i.pinimg.com/236x/88/c7/40/88c7401e71cfcfe32f5daf2a63e536e1.jpg",
      nombre: "Color a elección",
      duracion: "3 horas",
      precio: "15.000",
    },
  ];

  const isAuthenticated = !!localStorage.getItem("token");

  const generateSchedule = (date) => {
    const startHour = new Date(date.setHours(9, 0, 0)); // 9:00 AM
    const endHour = new Date(date.setHours(18, 0, 0)); // 6:00 PM
    return eachHourOfInterval({ start: startHour, end: endHour }).map((hour) => ({
      time: format(hour, "hh:mm a"),
      available: true, // Inicialmente disponible
    }));
  };

  const handleButtonClick = (servicio) => {
    if (!isAuthenticated) {
      navigate("/auth"); // Redirigir al login
    } else {
      setSelectedService(servicio); // Establecer el servicio seleccionado
      setSelectedDate(addDays(new Date(), 0)); // Día actual
      setSchedule(generateSchedule(new Date())); // Generar horarios
      setIsModalOpen(true); // Mostrar modal
    }
  };

  const handleDateChange = (daysToAdd) => {
    const newDate = addDays(new Date(), daysToAdd);
    setSelectedDate(newDate);
    setSchedule(generateSchedule(newDate));
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
    setSchedule([]);
    setSelectedService(null); // Limpiar el servicio seleccionado
  };

  const handleReserve = async (time) => {
    const fecha = format(selectedDate, "yyyy-MM-dd");
    const dia = format(selectedDate, "EEEE");
    const hora = time;

    try {
      const response = await axios.post("http://localhost:5000/api/reserve", {
        fecha,
        dia,
        hora,
        servicio: selectedService.nombre, // Enviar el nombre del servicio
      });
      

      if (response.status === 200) {
        alert("¡Turno reservado con éxito!");
        closeModal();
      }
    } catch (error) {
      console.error("Error al reservar el turno:", error);
      alert("Error al reservar el turno. Inténtalo nuevamente.");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mis Servicios Profesionales</h1>

      <div className="w-full mt-4 max-w-4xl mx-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {servicios.map((servicio, index) => (
          <div
            key={index}
            className="bg-white border border-gray-300 mx-5 rounded-xl shadow-lg overflow-hidden"
          >
            <img
              src={servicio.imgUrl}
              alt={servicio.nombre}
              className="w-full h-86 object-cover"
            />
            <div className="p-4">
              <div className="text-xl font-semibold text-gray-700">{servicio.nombre}</div>
              <div className="text-sm text-gray-500 flex mt-2">
                <p>Duración:</p>
                <p>{servicio.duracion}</p>
              </div>
              <div className="text-lg font-bold text-gray-900 mt-3">${servicio.precio}</div>
              <button
                onClick={() => handleButtonClick(servicio)} // Pasar el servicio al hacer clic
                className="w-full bg-blue-500 text-white rounded-md py-2 mt-4 hover:bg-blue-600 transition-colors"
              >
                Solicitar turno
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-xl font-bold mb-4">Selecciona un turno</h2>
            <div className="flex justify-between mb-4">
              <button
                onClick={() => handleDateChange(-1)}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
              >
                Día Anterior
              </button>
              <p className="font-bold">{format(selectedDate, "EEEE, dd MMM yyyy")}</p>
              <button
                onClick={() => handleDateChange(1)}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
              >
                Día Siguiente
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {schedule.map((slot, index) => (
                <button
                  key={index}
                  disabled={!slot.available}
                  onClick={() => handleReserve(slot.time)}
                  className={`py-2 rounded ${
                    slot.available ? "bg-green-500 hover:bg-green-600" : "bg-gray-300"
                  } text-white`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
            <button
              onClick={closeModal}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Servicios;
