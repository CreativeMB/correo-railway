import admin from "firebase-admin";
import serviceAccount from "./credenciales.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://corario-16991.firebaseio.com",
});

const firestore = admin.firestore();
const realtimeDb = admin.database();
const auth = admin.auth();

export default async function eliminarUsuario(uid) {
  try {
    await auth.deleteUser(uid);
    console.log(`✅ Auth eliminado: ${uid}`);

    await firestore.collection("users").doc(uid).delete();
    console.log("✅ Documento Firestore eliminado");

    await realtimeDb.ref("usuarios_conectados").child(uid).remove();
    console.log("✅ Estado Realtime DB eliminado");

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
