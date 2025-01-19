import React from "react";
import { format } from "date-fns";
import { useAuth } from "../Context/AuthContext"; // Importa el contexto de autenticación

const ModalCalendar = ({
  isModalOpen,
  isAnimating,
  closeModal,
  selectedService,
  selectedDate,
  schedule,
  handleDateChange,
  daysInMonth,
  setSelectedDate,
  selectedHour,
  setSelectedHour,
  handleReserve,
  currentMonth
}) => {
  return (
    <div className={`fixed z-50 flex items-center justify-center ${isModalOpen ? "block" : "hidden"}`}>
      <div
        className={`bg-white mt-24 p-6 rounded-2xl border border-gray-200 w-[100vw] h-[48vh] transform ${
          isAnimating ? "modal-enter-active" : "modal-enter"
        }`}
      >
        <div className="flex justify-between items-center mt-1 mb-5">
          <h2 className="text-xl poppins-semibold text-gray-800">
            {selectedService?.nombre}
          </h2>
          <button
            onClick={closeModal}
            className="absolute top-6 right-4 text-black text-2xl poppins-bold"
          >
            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="25" height="25" viewBox="0 0 50 50">
              <path d="M 7.71875 6.28125 L 6.28125 7.71875 L 23.5625 25 L 6.28125 42.28125 L 7.71875 43.71875 L 25 26.4375 L 42.28125 43.71875 L 43.71875 42.28125 L 26.4375 25 L 43.71875 7.71875 L 42.28125 6.28125 L 25 23.5625 Z"></path>
            </svg>
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
                  ? "border border-blue-500 text-white bg-blue-500"
                  : "bg-white text-blue-500 border border-blue-500"
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
                ${slot.available ? "border border-blue-400 shadow-md focus-outline-blue-500" : "bg-gray-300 cursor-not-allowed"}
                ${selectedHour === slot.time ? "bg-blue-500 text-white" : ""} 
                text-blue-500 transition duration-200`}
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
  );
};

export default ModalCalendar;
