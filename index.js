import express from "express";
import nodemailer from "nodemailer";
import eliminarUsuario from "./firebaseDelete.js"; // 👈 asegúrate que el archivo también esté en ES module
import dotenv from "dotenv";
import serviceAccount from "./credenciales.json" assert { type: "json" };

dotenv.config(); // Cargar variables desde .env

const app = express();
app.use(express.json());

// ------------------ CORREO ------------------
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, (char) => {
    const chars = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };
    return chars[char] || char;
  });
}

const transporter = nodemailer.createTransport({
  host: "smtp-relay.sendinblue.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
});

app.post("/correo", async (req, res) => {
  const rawTitulo = req.body.titulo || "Sin título";
  const titulo = escapeHTML(rawTitulo);

  const mailOptions = {
    from: '"Pedidos" <fulltvurl@gmail.com>',
    to: "fulltvurl@gmail.com",
    subject: `🎬 ${titulo}`,
    html: `
      <p>🔔 <strong>Activación pendiente</strong></p>
      <p>Se ha registrado un nuevo pedido.</p>
      <p>🎬 <strong>Título:</strong> ${titulo}</p>
      <p>Por favor, verifica y activa la película en el sistema FullTV.</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Correo enviado:", info.response);
    res.json({ status: "ok", mensaje: `Correo enviado con el título: ${titulo}` });
  } catch (err) {
    console.error("❌ Error al enviar correo:", err);
    res.status(500).json({ status: "error", mensaje: "Falló el envío de correo" });
  }
});

// ------------------ ELIMINAR USUARIO ------------------
app.post("/eliminar-usuario", async (req, res) => {
  const { uid } = req.body;
  console.log("🟡 Petición recibida para eliminar usuario:", uid);

  if (!uid) {
    console.error("🔴 UID faltante");
    return res.status(400).json({ status: "error", mensaje: "Falta UID" });
  }

  try {
    const resultado = await eliminarUsuario(uid);
    console.log("✅ Resultado:", resultado);
    res.json(resultado);
  } catch (e) {
    console.error("🔥 Error eliminando usuario:", e);
    res.status(500).json({ status: "error", mensaje: e.message });
  }
});

// ------------------ LISTEN ------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
});
