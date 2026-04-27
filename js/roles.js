// 🔥 roles.js

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { auth, db } from "../js/firestore.js";


// 🔥 VERIFICAR SESIÓN Y ROL
onAuthStateChanged(auth, async (user) => {

  // ❌ NO LOGUEADO
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  try {

    // 🔥 BUSCAR DATOS DEL USUARIO
    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      window.location.href = "login.html";
      return;
    }

    const rol = snap.data().rol;

    // 🔥 PÁGINA ACTUAL
    const pagina = window.location.pathname;

    // 🔥 SI ESTÁ EN INDEX.HTML
    if (pagina.includes("index.html")) {

      if (rol !== "estudiante") {
        window.location.href = "profesor.html";
        return;
      }

    }

    // 🔥 SI ESTÁ EN PROFESOR.HTML
    if (pagina.includes("profesor.html")) {

      if (rol !== "profesor") {
        window.location.href = "index.html";
        return;
      }

    }

  } catch (error) {

    console.log(error);
    window.location.href = "login.html";

  }

});