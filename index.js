import express from "express";
import nodemailer from "nodemailer";

const app = express();
app.use(express.json());

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
  const titulo = req.body.titulo || "Sin título";

  const mailOptions = {
    from: '"Pedidos" <fulltvurl@gmail.com>',
    to: "fulltvurl@gmail.com",
    subject: `🎬 ${titulo}`,
    text: `🔔 Activación pendiente\n\nSe ha registrado un nuevo pedido.\n🎬 Título: ${titulo}\nPor favor, verifica y activa la película en el sistema FullTV.`,
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
