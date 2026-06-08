import { auth, db } from "./firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

onAuthStateChanged(auth, async(user)=>{

  if(!user) return;

  const ref = doc(db,"usuarios",user.uid);
  const snap = await getDoc(ref);

  if(!snap.exists()) return;

  const datos = snap.data();

  // 🔥 NOMBRE
  document.getElementById("nombreUsuario")
    .textContent = datos.nombre || "Estudiante";

  // 🔥 CORREO
  document.getElementById("correoUsuario")
    .textContent = datos.email || "";

  // 🔥 FOTO
const foto = datos.foto?.trim();

  // 🔥 INICIALES
let iniciales = "U";

// 🔥 SI EXISTEN INICIALES
if (datos.iniciales) {

  iniciales = datos.iniciales;

}

// 🔥 SI NO HAY INICIALES → SACAR DEL CORREO
else if (datos.email) {

  iniciales = datos.email.charAt(0).toUpperCase();

}
  const fotoPerfil = document.getElementById("fotoPerfil");
  const avatarTexto = document.getElementById("avatarTexto");
  const topAvatar = document.getElementById("topAvatar");

// 🔥 VALIDAR FOTO
// 🔥 VALIDAR FOTO
const tieneFotoValida =
  foto &&
  typeof foto === "string" &&
  (
    foto.startsWith("data:image") ||
    foto.startsWith("http")
  );

if (tieneFotoValida) {

  fotoPerfil.src = foto;

  fotoPerfil.style.display = "block";

  avatarTexto.style.display = "none";

if(topAvatar){

  topAvatar.innerHTML = `
    <img
      src="${foto}"
      style="
        width:100%;
        height:100%;
        border-radius:50%;
        object-fit:cover;
      "
    >
  `;

}

} else {

  avatarTexto.textContent = iniciales;

  if(topAvatar){

  topAvatar.textContent = iniciales;

}

}

});