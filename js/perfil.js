import { auth, db } from "./firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// 🔥 REGLAS DOCUMENTOS
const reglasDocumento = {
  CC: 10,
  TI: 10,
  CE: 10,
  PAS: 9
};

let cropper;
let imagenSeleccionada;

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

  const btnActualizar =
  document.getElementById("btnActualizar");

if(btnActualizar){

  btnActualizar.addEventListener("click", () => {

    document.getElementById("tipoDocumentoInput").value =
      datos.tipoDocumento || "";

    document.getElementById("documentoInput").value =
      datos.documento || "";

    document.getElementById("programaInput").value =
      datos.programa || "";

    document.getElementById("semestreInput").value =
      datos.semestre || "";

    // 🔥 HABILITAR CAMPOS
    document.getElementById("tipoDocumentoInput").disabled = false;

    document.getElementById("documentoInput").disabled = false;

    const modal = new bootstrap.Modal(
      document.getElementById("modalPerfil")
    );

    modal.show();

  });

}

if(btnCompletarPerfil){

    document
  .getElementById("tipoDocumentoInput")
  .addEventListener("change", () => {

    document.getElementById("documentoInput").value = "";

});

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

    // 🔥 CAMBIAR FOTO
const btnFoto =
document.getElementById("btnFoto");

const btnPassword =
document.getElementById("btnPassword");

const esGoogle =
user.providerData.some(
  p => p.providerId === "google.com"
);

if(esGoogle){

  btnPassword.style.display = "none";

}

const btnGuardarPassword =
document.getElementById("btnGuardarPassword");

const inputFoto =
document.getElementById("inputFoto");

const btnEliminarFoto =
document.getElementById("btnEliminarFoto");




if(btnFoto){

  btnFoto.addEventListener("click", () => {

    inputFoto.click();

  });

}

if(btnPassword){

  btnPassword.addEventListener("click", () => {

    const modal =
    new bootstrap.Modal(
      document.getElementById("modalPassword")
    );

    modal.show();

  });

}

inputFoto.addEventListener("change", async(e) => {

  const archivo = e.target.files[0];

if(!archivo) return;

if(archivo.size > 2 * 1024 * 1024){

  Swal.fire({
    icon:"warning",
    title:"Imagen muy pesada",
    text:"La foto no puede superar los 2 MB."
  });

  return;
}

  // 🔥 VISTA PREVIA INMEDIATA

const fotoPerfil =
document.getElementById("fotoPerfil");

const avatarTexto =
document.getElementById("avatarTexto");

const urlTemporal =
URL.createObjectURL(archivo);

imagenSeleccionada = archivo;

const imagenCrop =
document.getElementById("imagenCrop");

imagenCrop.src = urlTemporal;

const modalFoto =
new bootstrap.Modal(
  document.getElementById("modalFoto")
);

modalFoto.show();

setTimeout(() => {

  if(cropper){
    cropper.destroy();
  }

  cropper = new Cropper(imagenCrop, {

    aspectRatio: 1,
    viewMode: 1,
    dragMode: "move",
    autoCropArea: 1

  });

}, 300);

return;

  // máximo 2 MB
  if(archivo.size > 2 * 1024 * 1024){

    Swal.fire({
      icon:"warning",
      title:"Imagen muy pesada",
      text:"La foto no puede superar los 2 MB."
    });

    return;
  }

  const reader = new FileReader();

  reader.onload = async(evento) => {

    const base64 = evento.target.result;

    try{

      await updateDoc(
        doc(db,"usuarios",user.uid),
        {
          foto: base64
        }
      );

      await Swal.fire({
        icon:"success",
        title:"Foto actualizada",
        timer:1500,
        showConfirmButton:false
      });

      location.reload();

    }catch(error){

      console.log(error);

      Swal.fire({
        icon:"error",
        title:"Error",
        text:"No fue posible actualizar la foto."
      });

    }

  };

  reader.readAsDataURL(archivo);

});

if(btnEliminarFoto){

  btnEliminarFoto.addEventListener("click", async() => {

    const resultado = await Swal.fire({
      title: "¿Eliminar foto?",
      text: "Volverás a usar tu avatar predeterminado.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if(!resultado.isConfirmed) return;

    try{

      await updateDoc(
        doc(db,"usuarios",user.uid),
        {
          foto: ""
        }
      );

      await Swal.fire({
        icon:"success",
        title:"Foto eliminada",
        timer:1500,
        showConfirmButton:false
      });

      location.reload();

    }catch(error){

      console.log(error);

      Swal.fire({
        icon:"error",
        title:"Error",
        text:"No fue posible eliminar la foto."
      });

    }

  });

}

const btnGuardarFoto =
document.getElementById("btnGuardarFoto");

if(btnGuardarFoto){

  btnGuardarFoto.addEventListener("click", async() => {

    if(!cropper) return;

    const canvas =
    cropper.getCroppedCanvas({

      width: 400,
      height: 400

    });

    const base64 =
    canvas.toDataURL(
      "image/jpeg",
      0.8
    );

    try{

      await updateDoc(
        doc(db,"usuarios",user.uid),
        {
          foto: base64
        }
      );

      await Swal.fire({
        icon:"success",
        title:"Foto actualizada",
        timer:1500,
        showConfirmButton:false
      });

      location.reload();

    }catch(error){

      console.log(error);

      Swal.fire({
        icon:"error",
        title:"Error",
        text:"No fue posible actualizar la foto."
      });

    }

  });

}

// CAMBIAR CONTRASEÑA

if(btnGuardarPassword){

  btnGuardarPassword.addEventListener("click", async() => {

    const passwordActual =
    document.getElementById("passwordActual").value;

    const passwordNueva =
    document.getElementById("passwordNueva").value;

    const passwordConfirmar =
    document.getElementById("passwordConfirmar").value;

    // Campos vacíos
    if(
      !passwordActual ||
      !passwordNueva ||
      !passwordConfirmar
    ){

      Swal.fire({
        icon:"warning",
        title:"Campos incompletos",
        text:"Debes completar todos los campos."
      });

      return;
    }

    // Contraseñas iguales
    if(passwordNueva !== passwordConfirmar){

      Swal.fire({
        icon:"warning",
        title:"Las contraseñas no coinciden"
      });

      return;
    }

    // Mínimo 6 caracteres
    if(passwordNueva.length < 6){

      Swal.fire({
        icon:"warning",
        title:"Contraseña muy corta",
        text:"Debe tener mínimo 6 caracteres."
      });

      return;
    }

    try{

      const credential =
      EmailAuthProvider.credential(
        user.email,
        passwordActual
      );

      await reauthenticateWithCredential(
        user,
        credential
      );

      await updatePassword(
        user,
        passwordNueva
      );

      await Swal.fire({
        icon:"success",
        title:"Contraseña actualizada"
      });

      bootstrap.Modal
    .getInstance(
    document.getElementById("modalPassword")
    )
    .hide();

      document.getElementById(
        "passwordActual"
      ).value = "";

      document.getElementById(
        "passwordNueva"
      ).value = "";

      document.getElementById(
        "passwordConfirmar"
      ).value = "";

    }catch(error){

      console.log(error);

      Swal.fire({
        icon:"error",
        title:"Error",
        text:"La contraseña actual es incorrecta."
      });

    }

  });

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

        const longitudEsperada =
    reglasDocumento[tipoDocumento];

      // VALIDACIÓN

// 🔥 CAMPOS OBLIGATORIOS
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

// 🔥 SOLO NÚMEROS
if(!/^[0-9]+$/.test(documento)){

  Swal.fire({
    icon: "warning",
    title: "Documento inválido",
    text: "El documento solo puede contener números."
  });

  return;
}

// 🔥 VALIDAR LONGITUD
if(documento.length !== longitudEsperada){

  Swal.fire({
    icon: "warning",
    title: "Documento inválido",
    text: `El ${tipoDocumento} debe tener ${longitudEsperada} dígitos.`
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

  Swal.fire({
    icon: "error",
    title: "Error",
    text: "No fue posible actualizar el perfil"
  });

}

  });

}

  } 
  
  catch (error) {

    console.log(error);

  }

});