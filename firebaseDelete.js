const admin = require("firebase-admin");
const serviceAccount = require("./credenciales.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://corario-16991.firebaseio.com"
});

const firestore = admin.firestore();
const realtimeDb = admin.database();
const auth = admin.auth();

export default async function eliminarUsuario(uid) {
  try {
    // 1. Eliminar autenticación
    await auth.deleteUser(uid);
    console.log(`✅ Auth eliminado: ${uid}`);

    // 2. Eliminar documento en 'users'
    await firestore.collection("users").doc(uid).delete();
    console.log("✅ Documento Firestore eliminado");

    // 3. Eliminar estado en RTDB
    await realtimeDb.ref("usuarios_conectados").child(uid).remove();
    console.log("✅ Estado Realtime DB eliminado");

    // 4. Eliminar pedidos (u otra colección)
    const pedidos = await firestore.collection("pedidosmovies").where("userId", "==", uid).get();
    for (const doc of pedidos.docs) {
      await doc.ref.delete();
    }
    console.log("✅ Pedidos eliminados");

    return { status: "ok", mensaje: "Usuario eliminado completamente" };
  } catch (error) {
    console.error("❌ Error:", error);
    return { status: "error", mensaje: error.message };
  }
}

module.exports = eliminarUsuario;
