// 🔥 roles.js

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { auth, db } from "../js/firestore.js";


// 🔥 VERIFICAR SESIÓN
onAuthStateChanged(auth, async (user) => {

  // ❌ NO LOGUEADO
  if (!user) {
window.location.replace("./login.html");
    return;
  }

  try {

    const ref = doc(db, "usuarios", user.uid);

    const snap = await getDoc(ref);

    // ❌ SI NO EXISTE
    if (!snap.exists()) {

      console.log("Usuario sin datos");

      return;
    }

    const datos = snap.data();

    // ❌ SIN ROL
    if (!datos.rol) {

      console.log("Usuario sin rol");

      return;
    }

    const rol = datos.rol;

    const pagina = window.location.pathname.split("/").pop();

    // 🔥 VALIDAR RUTAS

    if (pagina === "index.html" && rol !== "estudiante") {

      window.location.href = "./profesor.html";
      return;

    }

    if (pagina === "profesor.html" && rol !== "profesor") {

window.location.replace("./index.html");
      return;

    }

    // ✅ MOSTRAR PÁGINA
    document.body.style.display = "block";

  } catch (error) {

    console.log(error);

  }

});


// 🔥 LOGOUT
const btnLogout = document.getElementById("btnLogout");

if (btnLogout) {

  btnLogout.addEventListener("click", async () => {

    await signOut(auth);

    window.location.replace("./login.html");

  });

}