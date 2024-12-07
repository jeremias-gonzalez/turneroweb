import React from "react";
import Slider from "../Slider/Slider";
import Servicios from "../Servicios/Servicios";
import Navbar from "../Navbar/Navbar";

const Home = () => {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <div>
      <Navbar />
      <Slider />
      <Servicios />
      {/* {isAuthenticated && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <button onClick={() => alert("Ir al formulario de reserva")}>
            Reservar Turno
          </button>
        </div>
      )} */}
    </div>
  );
};

export default Home;
