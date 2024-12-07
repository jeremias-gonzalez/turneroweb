const express = require("express");
const cors = require("cors"); // Para habilitar solicitudes entre dominios
const bodyParser = require("body-parser");
const reservasRouter = require("./authRoutes.js");

const app = express();
const PORT = 5000; // Cambia según tu configuración

app.use(cors()); // Permite solicitudes desde el front-end
app.use(bodyParser.json());
app.use("/api", reservasRouter); // Prefijo para las rutas definidas en el router

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
