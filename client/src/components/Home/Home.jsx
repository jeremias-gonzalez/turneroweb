import React, { useEffect, useState } from "react";
import Slider from "../Slider/Slider";
import Servicios from "../Servicios/Servicios";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer"
import axios from "axios";

const Home = () => {
  // const [userName, setUserName] = useState("");

  // useEffect(() => {
  //   const fetchUserName = async () => {
  //     const token = localStorage.getItem("token");
  //     if (!token) return; // Si no hay token, no hacemos la solicitud

  //     try {
  //       const response = await axios.get("http://localhost:5000/api/account", {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });
  //       setUserName(response.data.nombre); // Guarda el nombre del usuario en el estado
  //     } catch (error) {
  //       console.error("Error al obtener el nombre del usuario:", error.message);
  //       // Puedes manejar el error aquí si lo necesitas
  //     }
  //   };

  //   fetchUserName();
  // }, []);

  return (
    <div>
      <Navbar />
    
      <div className="mt-28">
      <Slider />
      </div>
      {/* {userName && (
        <h1 className="text-xl poppins-bold" style={{ textAlign: "center", marginTop: "20px" }}>
          👋Hola, <span className="uppercase">{userName}!</span>
        </h1>
      )} */}
      <Servicios />
      <Footer/>
      
    </div>
  );
};

export default Home;
