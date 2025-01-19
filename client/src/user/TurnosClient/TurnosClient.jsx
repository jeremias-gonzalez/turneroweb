import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import axios from "axios";
export const TurnosClient = () => {
    const [userName, setUserName] = useState("");
   
    useEffect(() => {
      const fetchUserName = async () => {
       
        const token = localStorage.getItem("token");
        if (!token) return; // Si no hay token, no hacemos la solicitud
  
        try {
          const backendUrl = import.meta.env.VITE_BACKEND_URL;
          const response = await axios.get(`${backendUrl}/api/account`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUserName(response.data.nombre); // Guarda el nombre del usuario en el estado
        } catch (error) {
          console.error("Error al obtener el nombre del usuario:", error.message);
          // Puedes manejar el error aquí si lo necesitas
        }
      };
  
      fetchUserName();
    }, []);
  
    return (
      <div>
         <Navbar /> 
        <div className="mt-32">
        {userName && (
          <h1 className="text-2xl poppins-bold " style={{ textAlign: "center", marginTop: "20px" }}>
            👋Hola, <span className="uppercase">{userName}!</span>
          </h1>
        )}
    </div>
       <div className="mt-10 mb-10">
        <div className="text-center">
            <p className="poppins-medium mb-4 text-xl">Mis turnos</p>
        </div>
        <div className="border rounded-xl mx-3 flex " >
           
            <div className="p-2">
                <p className="poppins-regular text-sm">Servicio:<span className="poppins-medium"> Corte de pelo</span></p>
                <p className="poppins-regular text-sm">Día:<span className="poppins-medium">Lunes</span></p>  
                <p className="poppins-regular text-sm">Fecha:<span className="poppins-medium">25/07/2025</span></p>  
                <p className="poppins-regular text-sm">Hora:<span className="poppins-medium">15:30pm</span></p>    
                              
            <div className="mt-2">
            <p className="poppins-regular text-sm">Estado del turno<span className="poppins-medium mx-2 border p-1 rounded-full text-red-500 border-red-gray-500">Pendiente</span></p>    
            </div>  
           
            </div>     
            <div className="my-2 ml-[4rem]">
            <img width="20" height="20" src="https://img.icons8.com/ios/50/help--v1.png" alt="help--v1"/>
            </div>
        </div>
        <div className="border rounded-xl mt-2 mx-3">
            <div className="p-2">
                <p className="poppins-regular text-sm">Servicio:<span className="poppins-medium"> Corte de pelo+ barba</span></p>
                <p className="poppins-regular text-sm">Día:<span className="poppins-medium">Lunes</span></p>  
                <p className="poppins-regular text-sm">Fecha:<span className="poppins-medium">26/07/2025</span></p>  
                <p className="poppins-regular text-sm">Hora:<span className="poppins-medium">15:30pm</span></p>    
                              
            <div className="mt-2">
            <p className="poppins-regular text-sm">Estado del turno<span className="poppins-medium mx-2 border p-1 rounded-full text-green-500 border-red-gray-500">Aprobado</span></p>    
            </div>  
            </div>     
        </div>
        </div>     
        <Footer/>
        
      </div>
    );
}
