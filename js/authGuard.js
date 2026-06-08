// 🔥 authGuard.js

import { onAuthStateChanged }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { auth, db } from "../js/firestore.js";


// 🔥 PROTEGER LOGIN Y REGISTRO
onAuthStateChanged(auth, async (user) => {

  // ✅ NO HAY SESIÓN
  if (!user) {
    document.body.style.display = "block";
    return;
  }

  // 🔥 EVITAR REDIRECCIÓN DURANTE REGISTRO
  if (sessionStorage.getItem("registroEnProceso")) {
    return;
  }

  try {

    const ref = doc(db, "usuarios", user.uid);

    const snap = await getDoc(ref);

    // ❌ SIN DATOS
    if (!snap.exists()) {
      document.body.style.display = "block";
      return;
    }

    const rol = snap.data().rol;

    // 🔥 REDIRECCIÓN INMEDIATA
    if (rol === "profesor") {

      window.location.replace("./profesor.html");

    } else {

      window.location.replace("./index.html");

    }

  } catch (error) {

    console.log(error);

    document.body.style.display = "block";

  }

});