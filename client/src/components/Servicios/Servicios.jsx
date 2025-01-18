import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, eachHourOfInterval } from "date-fns";
import axios from "axios";
import { gapi } from "gapi-script";
import { useAuth } from "../../components/Context/AuthContext"; // Importa el contexto de autenticación

const Servicios = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth(); // Consumo del contexto de autenticación
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
       // Restablece la animación de salida
    }
  }, [isModalOpen]);
  const servicios = [
    { imgUrl: "https://image.jpg", nombre: "Corte de Pelo", duracion: "30 min", precio: "8.000" },
    { imgUrl: "https://image2.jpg", nombre: "Corte de Pelo + Barba", duracion: "40 min", precio: "10.000" },
    { imgUrl: "https://image3.jpg", nombre: "Color a elección", duracion: "3 horas", precio: "15.000" },
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
    if (!isAuthenticated || !user) {
      alert("Por favor, inicie sesión para realizar una reserva");
      return;
    }
  
    if (!selectedService) {
      alert("Por favor, selecciona un servicio");
      return;
    }
  
    const { name, phone } = user;
    const fecha = format(selectedDate, "yyyy-MM-dd");
    const hora = selectedHour;
  
    try {
      const response = await axios.post("http://localhost:5000/api/crear-turno", {
        nombre: name,
        telefono: phone,
        fecha,
        hora,
        servicio: selectedService.nombre,
      });
  
      if (response.status === 200) {
        alert("¡Turno reservado con éxito!");
        createGoogleCalendarEvent(fecha, hora);
        closeModal();
      }
    } catch (error) {
      console.error("Error al reservar el turno:", error);
      alert(`Error al reservar el turno: ${error.response?.data?.message || "Inténtalo nuevamente."}`);
    }
  };
  
  const createGoogleCalendarEvent = (fecha, hora) => {
    const [hour, minute] = hora.split(":");
    const startDateTime = new Date(fecha).setHours(hour, minute, 0);
    const durationMinutes = parseInt(selectedService.duracion.split(" ")[0]) || 30; // Usa la duración del servicio o 30 minutos por defecto
    const endDateTime = new Date(startDateTime).setMinutes(new Date(startDateTime).getMinutes() + durationMinutes);
  
    const event = {
      summary: `${selectedService.nombre} - ${user.name}`,
      description: `Servicio: ${selectedService.nombre}`,
      start: {
        dateTime: new Date(startDateTime),
        timeZone: "America/Argentina/Buenos_Aires",
      },
      end: {
        dateTime: new Date(endDateTime),
        timeZone: "America/Argentina/Buenos_Aires",
      },
      attendees: [{ email: "cliente@example.com" }],
    };
  
    const request = gapi.client.calendar.events.insert({
      calendarId: "primary",
      resource: event,
    });
  
    request.execute((event) => {
      console.log("Evento creado: " + event.htmlLink);
      alert("Evento creado en tu calendario!");
    });
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
                <div className="text-lg font-semibold text-gray-700">{servicio.nombre}</div>
                <button
                  onClick={() => handleButtonClick(servicio)}
                  className="w-full bg-white text-blue-900 border shadow-sm rounded-full py-2"
                >
                  Reservar
                </button>
              </div>
              <div className="flex flex-col gap-4 text-right">
                <div className="flex items-center justify-end text-sm text-gray-500">
                  <p>{servicio.duracion}</p>
                </div>
                <div className="text-lg text-gray-700">${servicio.precio} ARS</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {isModalOpen && (
        <div className="fixed z-50 flex items-center justify-center ">
          <div
          className={`bg-white mt-[-8rem] p-6 rounded-2xl shadow-lg w-96 transform ${
            isAnimating ? "modal-enter-active" : "modal-enter"
          }`}
>
            <div className="flex justify-center">
              <h2 className="text-lg text-center font-semibold text-gray-800 mb-6">
                {selectedService?.nombre}
              </h2>
            </div>

            <div className="flex justify-center mt-[-2.8rem] ml-[10rem]">
              <button
                onClick={closeModal}
                className="text-black transition duration-200"
              >
                X
              </button>
            </div>

            <div className="flex justify-between mb-6">
              <button
                onClick={() => handleDateChange(-1)}
                className="border border-blue-900 px-3 py-2 rounded-full transition duration-200"
              >
                &lt;
              </button>
              <p className="poppins-semibold text-lg text-gray-800">
                {format(currentMonth, "MMMM yyyy")}
              </p>
              <button
                onClick={() => handleDateChange(1)}
                className="border border-blue-900 px-3 py-2 rounded-full transition duration-200"
              >
                &gt;
              </button>
            </div>

            <div className="flex overflow-x-scroll gap-4 mb-6">
              {daysInMonth.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDate(day)}
                  className={`py-2 px-4 rounded-full text-lg poppins-medium ${
                    selectedDate?.getDate() === day.getDate()
                      ? "bg-white text-blue-500 border border-blue-500"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  {format(day, "dd")}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-5 gap-4 mb-6">
              {schedule.map((slot, index) => (
                <button
                  key={index}
                  disabled={!slot.available}
                  onClick={() => setSelectedHour(slot.time)}
                  className={`py-2 px-2 rounded-full text-sm poppins-medium
                    ${
                      slot.available
                        ? "border border-blue-400 shadow-md focus-outline-blue-500"
                        : "bg-gray-300 cursor-not-allowed"
                    } 
                    ${selectedHour === slot.time ? "bg-blue-600 text-white" : ""} 
                    text-black transition duration-200`}
                >
                  {slot.time}
                </button>
              ))}
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleReserve}
                disabled={!selectedDate || !selectedHour}
                className="border border-blue-500 text-blue-900 px-2 py-1 rounded-xl poppins-regular transition duration-200"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Servicios;
