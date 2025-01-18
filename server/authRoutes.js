const express = require("express");
const jwt = require("jsonwebtoken");
const { google } = require("googleapis");
require("dotenv").config();

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

// Configurar credenciales de Google
let credentials;
try {
  credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
  if (credentials.private_key.includes("\\n")) {
    credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
  }
} catch (error) {
  console.error("Error al procesar las credenciales de Google:", error.message);
  throw new Error("Credenciales de Google mal formateadas");
}

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/calendar",
  ],
});

const sheets = google.sheets({ version: "v4", auth });
const calendar = google.calendar({ version: "v3", auth });

// Función para agregar un turno a Google Calendar y Google Sheets
async function addTurno({ nombre, telefono,fecha, hora, servicio }) {
  const calendarId = "primary"; // Cambiar si se utiliza un calendario específico
  const startDateTime = new Date(`${fecha}T${hora}:00-03:00`);
  const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hora

  // Crear evento en Google Calendar
  const event = {
    summary: `Turno: ${servicio}`,
    description: `Cliente: ${nombre} \nTeléfono: ${telefono} \nServicio: ${servicio}`,
    start: { dateTime: startDateTime.toISOString(), timeZone: "America/Argentina/Buenos_Aires" },
    end: { dateTime: endDateTime.toISOString(), timeZone: "America/Argentina/Buenos_Aires" },
  };

  try {
    const calendarResponse = await calendar.events.insert({
      calendarId,
      resource: event,
    });

    console.log("Evento creado en Google Calendar: ", calendarResponse.data);

    // Agregar turno a Google Sheets
    const range = "turnos!A:F"; // Cambiar a la hoja y rango correcto
    const values = [[nombre, telefono, fecha, hora, servicio, "Pendiente"]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: "RAW",
      resource: { values },
    });

    console.log("Turno registrado en Google Sheets");
    return { success: true, eventId: calendarResponse.data.id };
  } catch (error) {
    console.error("Error en addTurno:", error.message);
    throw new Error("No se pudo registrar el turno");
  }
}

// Ruta para crear un turno
router.post("/crear-turno", async (req, res) => {
  const { nombre, telefono, fecha, hora, servicio } = req.body;

  if (!nombre || !telefono || !fecha || !hora || !servicio) {
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  try {
    const result = await addTurno({ nombre, telefono, fecha, hora, servicio });
    res.status(201).json({ message: "Turno creado con éxito", result });
  } catch (error) {
    res.status(500).json({ message: "Error al crear el turno", error: error.message });
  }
});

// Ruta para obtener todos los turnos
router.get("/turnos", async (req, res) => {
  const range = "turnos!A:F";

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range,
    });
    const rows = response.data.values || [];
    res.status(200).json({ turnos: rows });
  } catch (error) {
    console.error("Error al obtener turnos:", error.message);
    res.status(500).json({ message: "Error al obtener los turnos", error: error.message });
  }
});

// Ruta para actualizar el estado de un turno
router.put("/actualizar-estado", async (req, res) => {
  const { rowIndex, estado } = req.body; // rowIndex empieza desde 1 para la hoja de cálculo

  if (!rowIndex || !estado) {
    return res.status(400).json({ message: "Faltan datos obligatorios" });
  }

  try {
    const range = `turnos!F${rowIndex}:F${rowIndex}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: "RAW",
      resource: { values: [[estado]] },
    });

    res.status(200).json({ message: "Estado actualizado con éxito" });
  } catch (error) {
    console.error("Error al actualizar estado:", error.message);
    res.status(500).json({ message: "Error al actualizar el estado", error: error.message });
  }
});
// Función para agregar un usuario a Google Sheets
async function addUserToGoogleSheets(nombre, email, password, numero) {
  const range = "clientes!A:E"; // Cambia según tu hoja de cálculo
  const values = [[nombre, email, password, numero, new Date().toISOString()]];

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
    console.error("Error al agregar usuario a Google Sheets:", error.message, error.stack);
    throw new Error("No se pudo agregar el usuario a la base de datos");
  }
}

// Función para obtener todos los usuarios de Google Sheets
async function getUsersFromGoogleSheets() {
  const range = "clientes!A:E";

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range,
    });
    return res.data.values || [];
  } catch (error) {
    console.error("Error al obtener usuarios de Google Sheets:", error.message, error.response?.data || error.stack);
    throw new Error("No se pudo obtener la lista de usuarios");
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

  try {
    const users = await getUsersFromGoogleSheets();
    const userExists = users.find((user) => user[1] === email); // user[1] es el email en la hoja de cálculo
    if (userExists) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    // Agregar usuario a Google Sheets
    await addUserToGoogleSheets(nombre, email, password, numero);

    res.status(201).json({ message: "Usuario registrado con éxito" });
  } catch (error) {
    console.error("Error en /register:", error.message, error.stack);
    res.status(500).json({ message: "Error al registrar el usuario", error: error.message });
  }
});

// Ruta para login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "El email y la contraseña son requeridos" });
  }

  try {
    const users = await getUsersFromGoogleSheets();
    const user = users.find((user) => user[1] === email && user[2] === password); // Verificar email y contraseña
    if (!user) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ token, message: "Inicio de sesión exitoso" });
  } catch (error) {
    console.error("Error en /login:", error.message, error.stack);
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
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
    console.error("Error en /verify:", error.message, error.stack);
    res.status(401).json({ message: "Token inválido" });
  }
});

// Ruta para obtener datos del usuario autenticado
router.get("/account", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = await getUsersFromGoogleSheets();
    const user = users.find((user) => user[1] === decoded.email); // Encuentra al usuario por email

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json({
      nombre: user[0], // Nombre
      email: user[1],  // Email
      numero: user[3], // Número
    });
  } catch (error) {
    console.error("Error en /account:", error.message, error.stack);
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
});

// Ruta para actualizar datos del usuario autenticado
router.put("/account", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  const { nombre, email, numero } = req.body;
  if (!nombre || !email || !numero) {
    return res.status(400).json({ message: "Todos los campos son requeridos" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = await getUsersFromGoogleSheets();
    const userIndex = users.findIndex((user) => user[1] === decoded.email);

    if (userIndex === -1) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Actualizar los datos en Google Sheets
    const range = `clientes!A${userIndex + 2}:D${userIndex + 2}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: "RAW",
      resource: {
        values: [[nombre, email, users[userIndex][2], numero]],
      },
    });

    res.status(200).json({ message: "Datos actualizados con éxito" });
  } catch (error) {
    console.error("Error en /account:", error.message, error.stack);
    res.status(500).json({ message: "Error al actualizar los datos del usuario" });
  }
});


module.exports = router;




// async function getAvailability(date) {
//   const range = "Disponibilidad!A:C"; // Cambia según tu hoja de cálculo

//   try {
//     const res = await sheets.spreadsheets.values.get({
//       spreadsheetId: SPREADSHEET_ID,
//       range,
//     });
//     const data = res.data.values || [];
//     return data.filter((row) => row[0] === date); // Filtra por la fecha
//   } catch (error) {
//     console.error("Error al obtener disponibilidad:", error.message);
//     return [];
//   }
// }

// Marcar un horario como reservado
// Marcar un horario como reservado con cliente
// async function reserveSlot(fecha, dia, hora, servicio, cliente) {
//   const rangeTurnos = "turnos!A:G"; // Ajusta el rango según tus columnas
//   const rangeDisponibilidad = "Disponibilidad!A:C"; // Rango de la disponibilidad
//   const values = [[fecha, dia, hora, servicio, cliente.nombre, cliente.email, cliente.numero]];

//   try {
//     // Registrar el turno en la hoja "turnos"
//     await sheets.spreadsheets.values.append({
//       spreadsheetId: SPREADSHEET_ID,
//       range: rangeTurnos,
//       valueInputOption: "RAW",
//       resource: { values },
//     });

//     // Actualizar la hoja "disponibilidad"
//     const disponibilidadData = await sheets.spreadsheets.values.get({
//       spreadsheetId: SPREADSHEET_ID,
//       range: rangeDisponibilidad,
//     });

//     const disponibilidad = disponibilidadData.data.values || [];
//     const index = disponibilidad.findIndex(
//       (row) => row[0] === fecha && row[1] === hora
//     );

//     if (index !== -1) {
//       // Cambiar el estado a "Reservado"
//       const updatedRow = [
//         disponibilidad[index][0], // Fecha
//         disponibilidad[index][1], // Hora
//         "Reservado",
//       ];

//       await sheets.spreadsheets.values.update({
//         spreadsheetId: SPREADSHEET_ID,
//         range: `Disponibilidad!A${index + 2}:C${index + 2}`, // Actualiza la fila específica
//         valueInputOption: "RAW",
//         resource: { values: [updatedRow] },
//       });
//     }

//     console.log("Horario reservado con cliente y disponibilidad actualizada");
//     return true;
//   } catch (error) {
//     console.error("Error al reservar horario:", error.message);
//     return false;
//   }
// }

// router.post("/reserve", async (req, res) => {
//   const { fecha, dia, hora, servicio, cliente } = req.body;

//   if (!fecha || !dia || !hora || !servicio || !cliente) {
//     return res.status(400).json({ message: "Todos los campos son requeridos" });
//   }

//   // Obtener la lista de clientes
//   const users = await getUsersFromGoogleSheets();
//   const user = users.find((u) => u[1] === cliente.email); // Busca por email

//   if (!user) {
//     return res.status(400).json({ message: "El cliente no está registrado" });
//   }

//   // Reservar el turno
//   const success = await reserveSlot(fecha, dia, hora, servicio, {
//     nombre: user[0], // Nombre desde la hoja de clientes
//     email: cliente.email,
//     numero: user[3], // Teléfono desde la hoja de clientes
//   });

//   if (success) {
//     res.status(200).json({ message: "Turno reservado con éxito" });
//   } else {
//     res.status(500).json({ message: "Error al reservar el turno" });
//   }
// });


// // Ruta para obtener la disponibilidad de horarios
// router.get("/availability/:date", async (req, res) => {
//   const { date } = req.params;
//   const availability = await getAvailability(date);

//   res.status(200).json({
//     date,
//     slots: availability.map(([_, hora]) => hasUncaughtExceptionCaptureCallback), // Devuelve solo los horarios disponibles
//   });
// });

// // Ruta para reservar un horario
