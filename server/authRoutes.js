const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { google } = require("googleapis");
const fs = require("fs");
const { hasUncaughtExceptionCaptureCallback } = require("process");

const router = express.Router();

const JWT_SECRET = "clave"; // Cambia en producción

// Configuración de Google Sheets
const SPREADSHEET_ID = "1Y2DG_YEpuve6xUJV4ZHAQA42iQoTHlzDFtxMnIrxQWE"; // Reemplaza con el ID de tu hoja
// // const credentials = JSON.parse(fs.readFileSync("./clientesdb.json", "utf-8")); // Reemplaza con la ruta a tu archivo de credenciales

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

// Función para agregar un usuario a Google Sheets
async function addUserToGoogleSheets(nombre, email, password, numero) {
  const range = "clientes!A:D"; // Cambia según tu hoja de cálculo
  const values = [[nombre, email, password, numero, new Date().toISOString()]]; // Datos del usuario

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: "RAW",
      resource: {
        values,
      },
    });
    console.log("Usuario agregado a Google Sheets");
  } catch (error) {
    console.error("Error al agregar usuario a Google Sheets:", error.message);
  }
}

// Función para obtener todos los usuarios de Google Sheets
async function getUsersFromGoogleSheets() {
  const range = "clientes!A:D"; // Cambia según tu hoja de cálculo

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range,
    });
    return res.data.values || [];
  } catch (error) {
    console.error("Error al obtener usuarios de Google Sheets:", error.message);
    return [];
  }
}

// Ruta base
router.get("/", (req, res) => {
  res.send("Bienvenido a la API de autenticación");
});

// Ruta para registrar usuario
router.post("/register", async (req, res) => {
  const { nombre, email, password, numero } = req.body;

  if (!nombre || !email || !password || !numero) {
    return res.status(400).json({ message: "Todos los campos son requeridos" });
  }

  const users = await getUsersFromGoogleSheets();
  const userExists = users.find((user) => user[1] === email); // user[1] es el email en la hoja de cálculo
  if (userExists) {
    return res.status(400).json({ message: "El usuario ya existe" });
  }

  // Agregar usuario a Google Sheets
  await addUserToGoogleSheets(nombre, email, password, numero);

  res.status(201).json({ message: "Usuario registrado con éxito" });
});

// Ruta para login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const users = await getUsersFromGoogleSheets();
  const user = users.find((user) => user[1] === email); // user[1] es el email en la hoja de cálculo

  if (!user) {
    return res.status(400).json({ message: "Credenciales incorrectas" });
  }

  // Comparar la contraseña proporcionada con la contraseña almacenada
  const isPasswordValid = password === user[2]; // user[2] es la contraseña en la hoja de cálculo
  if (!isPasswordValid) {
    return res.status(400).json({ message: "Credenciales incorrectas" });
  }

  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });

  res.status(200).json({ token, message: "Login exitoso" });
});

// Ruta para verificar autenticación
router.get("/verify", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.status(200).json({ message: "Autenticado", user: decoded });
  } catch (error) {
    res.status(401).json({ message: "Token inválido" });
  }
});
async function getAvailability(date) {
  const range = "Disponibilidad!A:C"; // Cambia según tu hoja de cálculo

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range,
    });
    const data = res.data.values || [];
    return data.filter((row) => row[0] === date); // Filtra por la fecha
  } catch (error) {
    console.error("Error al obtener disponibilidad:", error.message);
    return [];
  }
}

// Marcar un horario como reservado
// Marcar un horario como reservado con cliente
async function reserveSlot(fecha, dia, hora, servicio, cliente) {
  const rangeTurnos = "turnos!A:G"; // Ajusta el rango según tus columnas
  const rangeDisponibilidad = "Disponibilidad!A:C"; // Rango de la disponibilidad
  const values = [[fecha, dia, hora, servicio, cliente.nombre, cliente.email, cliente.numero]];

  try {
    // Registrar el turno en la hoja "turnos"
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: rangeTurnos,
      valueInputOption: "RAW",
      resource: { values },
    });

    // Actualizar la hoja "disponibilidad"
    const disponibilidadData = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: rangeDisponibilidad,
    });

    const disponibilidad = disponibilidadData.data.values || [];
    const index = disponibilidad.findIndex(
      (row) => row[0] === fecha && row[1] === hora
    );

    if (index !== -1) {
      // Cambiar el estado a "Reservado"
      const updatedRow = [
        disponibilidad[index][0], // Fecha
        disponibilidad[index][1], // Hora
        "Reservado",
      ];

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Disponibilidad!A${index + 2}:C${index + 2}`, // Actualiza la fila específica
        valueInputOption: "RAW",
        resource: { values: [updatedRow] },
      });
    }

    console.log("Horario reservado con cliente y disponibilidad actualizada");
    return true;
  } catch (error) {
    console.error("Error al reservar horario:", error.message);
    return false;
  }
}

router.post("/reserve", async (req, res) => {
  const { fecha, dia, hora, servicio, cliente } = req.body;

  if (!fecha || !dia || !hora || !servicio || !cliente) {
    return res.status(400).json({ message: "Todos los campos son requeridos" });
  }

  // Obtener la lista de clientes
  const users = await getUsersFromGoogleSheets();
  const user = users.find((u) => u[1] === cliente.email); // Busca por email

  if (!user) {
    return res.status(400).json({ message: "El cliente no está registrado" });
  }

  // Reservar el turno
  const success = await reserveSlot(fecha, dia, hora, servicio, {
    nombre: user[0], // Nombre desde la hoja de clientes
    email: cliente.email,
    numero: user[3], // Teléfono desde la hoja de clientes
  });

  if (success) {
    res.status(200).json({ message: "Turno reservado con éxito" });
  } else {
    res.status(500).json({ message: "Error al reservar el turno" });
  }
});


// Ruta para obtener la disponibilidad de horarios
router.get("/availability/:date", async (req, res) => {
  const { date } = req.params;
  const availability = await getAvailability(date);

  res.status(200).json({
    date,
    slots: availability.map(([_, hora]) => hasUncaughtExceptionCaptureCallback), // Devuelve solo los horarios disponibles
  });
});

// Ruta para reservar un horario


module.exports = router;
