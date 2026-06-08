import { auth, db } from "./firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {

  if (!user) {

    window.location.replace("./login.html");
    return;

  }

  try {

    const ref = doc(db, "usuarios", user.uid);

    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    const datos = snap.data();
    const perfilIncompleto =
    !datos.tipoDocumento ||
    !datos.documento ||
    !datos.programa ||
    !datos.semestre;

    if (perfilIncompleto) {

  document.getElementById("alertaPerfil")
    .style.display = "flex";

}

const btnCompletarPerfil =
  document.getElementById("btnCompletarPerfil");

if(btnCompletarPerfil){

  btnCompletarPerfil.addEventListener("click", () => {

    const modal = new bootstrap.Modal(
      document.getElementById("modalPerfil")
    );

    document.getElementById("tipoDocumentoInput").value =
    datos.tipoDocumento || "";

    document.getElementById("documentoInput").value =
    datos.documento || "";

    document.getElementById("programaInput").value =
    datos.programa || "";

    document.getElementById("semestreInput").value =
    datos.semestre || "";

    // DESHABILITAR CAMPOS SI YA ESTÁN COMPLETOS
    const tipoDocumentoInput =
    document.getElementById("tipoDocumentoInput");

    const documentoInput =
    document.getElementById("documentoInput");

    tipoDocumentoInput.disabled =
    !!datos.tipoDocumento;

    documentoInput.disabled =
    !!datos.documento;

    modal.show();

  });

}

    // 🔥 DATOS
    document.getElementById("nombreUsuario").textContent =
      datos.nombre || "Estudiante";

    document.getElementById("correoUsuario").textContent =
      datos.email || "";

    document.getElementById("tipoDocumento").textContent =
      datos.tipoDocumento || "Pendiente";

    document.getElementById("documento").textContent =
      datos.documento || "Pendiente";

    document.getElementById("programa").textContent =
      datos.programa || "Pendiente";

    document.getElementById("semestre").textContent =
      datos.semestre || "Pendiente";

    document.getElementById("rol").textContent =
      datos.rol || "Pendiente";

    // 🔥 FOTO
    const foto = datos.foto?.trim();

    const fotoPerfil = document.getElementById("fotoPerfil");

    const avatarTexto = document.getElementById("avatarTexto");

    let iniciales = "U";

    if (datos.iniciales) {

      iniciales = datos.iniciales;

    } else if (datos.email) {

      iniciales = datos.email.charAt(0).toUpperCase();

    }

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

    } else {

      avatarTexto.textContent = iniciales;

    }

    const btnGuardarPerfil =
  document.getElementById("btnGuardarPerfil");

if(btnGuardarPerfil){

  btnGuardarPerfil.addEventListener("click", async() => {

    try{

      const tipoDocumento =
        document.getElementById("tipoDocumentoInput").value.trim();

      const documento =
        document.getElementById("documentoInput").value.trim();

      const programa =
        document.getElementById("programaInput").value.trim();

      const semestre =
        document.getElementById("semestreInput").value.trim();

      // VALIDACIÓN

if(
  !tipoDocumento ||
  !documento ||
  !programa ||
  !semestre
){

  Swal.fire({
    icon: "warning",
    title: "Campos incompletos",
    text: "Debes completar toda la información requerida."
  });

  return;
}

      await updateDoc(
        doc(db,"usuarios",user.uid),
        {
          tipoDocumento,
          documento,
          programa,
          semestre
        }
      );

await Swal.fire({
  icon: "success",
  title: "¡Perfil completado!",
  text: "Tu información académica fue guardada correctamente.",
  timer: 1800,
  showConfirmButton: false
});

location.reload();

    }catch(error){

      console.log(error);

      alert("Error al actualizar perfil");

    }

  });

}

  } 
  
  catch (error) {

    console.log(error);

  }

});