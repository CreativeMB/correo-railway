const admin = require("firebase-admin");
const serviceAccount = require("./credenciales.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://corario-16991.firebaseio.com", // 🔥 ESTE ES EL VALOR CORRECTO
});

const firestore = admin.firestore();
const realtimeDb = admin.database();
const auth = admin.auth();

async function eliminarUsuario(uid) {
  try {
    await auth.deleteUser(uid);
    console.log(`✅ Usuario eliminado de Auth: ${uid}`);

    await firestore.collection("users").doc(uid).delete();
    console.log("✅ Documento eliminado de 'users'");

    await realtimeDb.ref("usuarios_conectados").child(uid).remove();
    console.log("✅ Estado de conexión eliminado");

    const pedidosSnapshot = await firestore.collection("pedidosmovies").where("userId", "==", uid).get();
    for (const doc of pedidosSnapshot.docs) {
      await doc.ref.delete();
    }
    console.log("✅ Pedidos eliminados");

    return { status: "ok", mensaje: `Usuario ${uid} eliminado completamente` };
  } catch (error) {
    console.error("❌ Error eliminando usuario:", error);
    return { status: "error", mensaje: error.message };
  }
}

module.exports = eliminarUsuario;
