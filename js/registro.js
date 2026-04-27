// 🔥 IMPORTS FIREBASE
import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { auth, db } from "../js/firestore.js";


// 🔥 ELEMENTOS
const nombreInput = document.getElementById("nombre");
const tipoDocumentoInput = document.getElementById("tipoDocumento");
const documentoInput = document.getElementById("documento");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const programaInput = document.getElementById("programa");
const semestreInput = document.getElementById("semestre");


// 🔥 MENSAJES ERROR
const nombreError = document.createElement("small");
const tipoDocError = document.createElement("small");
const documentoError = document.createElement("small");
const emailError = document.createElement("small");
const passError = document.createElement("small");
const confirmPassError = document.createElement("small");
const programaError = document.createElement("small");
const semestreError = document.createElement("small");

[
  nombreError,
  tipoDocError,
  documentoError,
  emailError,
  passError,
  confirmPassError,
  programaError,
  semestreError
].forEach(el => el.classList.add("error-text"));


// 🔥 INSERTAR MENSAJES
nombreInput.after(nombreError);
tipoDocumentoInput.after(tipoDocError);
documentoInput.after(documentoError);
emailInput.after(emailError);
passwordInput.parentElement.after(passError);
confirmPasswordInput.after(confirmPassError);
programaInput.after(programaError);
semestreInput.after(semestreError);


// 🔥 REGLAS DOCUMENTOS
const reglasDocumento = {
  CC: 10,
  TI: 10,
  CE: 10,
  PAS: 9
};


// 🔥 FUNCIONES
function marcarError(input, mensaje = "Campo obligatorio") {

  input.classList.add("input-error");

  switch (input) {
    case nombreInput: nombreError.textContent = mensaje; break;
    case tipoDocumentoInput: tipoDocError.textContent = mensaje; break;
    case documentoInput: documentoError.textContent = mensaje; break;
    case emailInput: emailError.textContent = mensaje; break;
    case passwordInput: passError.textContent = mensaje; break;
    case confirmPasswordInput: confirmPassError.textContent = mensaje; break;
    case programaInput: programaError.textContent = mensaje; break;
    case semestreInput: semestreError.textContent = mensaje; break;
  }
}

function limpiarErrores() {
  document.querySelectorAll(".error-text").forEach(el => el.textContent = "");

  document.querySelectorAll("input, select").forEach(el => {
    el.classList.remove("input-error");
    el.classList.remove("input-success");
  });
}

function validarCorreoInstitucional(email) {
  return /^[^\s@]+@unicaribe\.edu\.co$/.test(email);
}

function validarNombre(nombre) {
  return nombre.trim().split(" ").length >= 2;
}

function validarDocumento(doc) {
  return /^[0-9]+$/.test(doc);
}

function validarPassword(password) {
  return /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])(?!.*\s).{6,}$/.test(password);
}

function capitalizarNombre(texto) {
  return texto
    .toLowerCase()
    .replace(/\b\w/g, letra => letra.toUpperCase());
}


// 🔥 VALIDACIONES EN TIEMPO REAL

nombreInput.addEventListener("input", () => {

  nombreInput.value = capitalizarNombre(nombreInput.value);

  if (!validarNombre(nombreInput.value)) {
    nombreError.textContent = "Ingresa nombre y apellido";
  } else {
    nombreError.textContent = "";
    nombreInput.classList.add("input-success");
  }

});

tipoDocumentoInput.addEventListener("change", () => {
  documentoInput.value = "";
  documentoError.textContent = "";
});

documentoInput.addEventListener("input", () => {

  const tipo = tipoDocumentoInput.value;
  const max = reglasDocumento[tipo];

  documentoInput.value = documentoInput.value.replace(/\D/g, "");

  if (max) {
    documentoInput.value = documentoInput.value.slice(0, max);
  }

  if (!tipo) {
    documentoError.textContent = "Selecciona tipo documento";
  } else if (documentoInput.value.length < max) {
    documentoError.textContent = `Debe tener ${max} dígitos`;
  } else {
    documentoError.textContent = "";
    documentoInput.classList.add("input-success");
  }

});

emailInput.addEventListener("input", () => {

  if (!validarCorreoInstitucional(emailInput.value)) {
    emailError.textContent = "Debe ser @unicaribe.edu.co";
  } else {
    emailError.textContent = "";
    emailInput.classList.add("input-success");
  }

});

passwordInput.addEventListener("input", () => {

  if (!validarPassword(passwordInput.value)) {
    passError.textContent = "6+ caracteres, número y símbolo";
  } else {
    passError.textContent = "";
    passwordInput.classList.add("input-success");
  }

});

confirmPasswordInput.addEventListener("input", () => {

  if (confirmPasswordInput.value !== passwordInput.value) {
    confirmPassError.textContent = "No coinciden";
  } else {
    confirmPassError.textContent = "";
    confirmPasswordInput.classList.add("input-success");
  }

});

programaInput.addEventListener("change", () => {
  programaError.textContent = "";
  programaInput.classList.add("input-success");
});

semestreInput.addEventListener("change", () => {
  semestreError.textContent = "";
  semestreInput.classList.add("input-success");
});


// 🔥 REGISTRAR
async function registrar() {

  limpiarErrores();

  const nombre = nombreInput.value.trim();
  const tipoDocumento = tipoDocumentoInput.value;
  const documento = documentoInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();
  const programa = programaInput.value.trim();
  const semestre = semestreInput.value;

  let hayError = false;

  if (!nombre) { marcarError(nombreInput); hayError = true; }
  if (!tipoDocumento) { marcarError(tipoDocumentoInput); hayError = true; }
  if (!documento) { marcarError(documentoInput); hayError = true; }
  if (!email) { marcarError(emailInput); hayError = true; }
  if (!password) { marcarError(passwordInput); hayError = true; }
  if (!confirmPassword) { marcarError(confirmPasswordInput); hayError = true; }
  if (!programa) { marcarError(programaInput); hayError = true; }
  if (!semestre) { marcarError(semestreInput); hayError = true; }

  if (hayError) {
    Swal.fire("Error", "Completa todos los campos", "warning");
    return;
  }

  if (!validarNombre(nombre)) {
    marcarError(nombreInput, "Nombre incompleto");
    return;
  }

  if (!validarDocumento(documento)) {
    marcarError(documentoInput, "Solo números");
    return;
  }

  if (documento.length !== reglasDocumento[tipoDocumento]) {
    marcarError(documentoInput, "Longitud inválida");
    return;
  }

  if (!validarCorreoInstitucional(email)) {
    marcarError(emailInput, "Correo institucional requerido");
    return;
  }

  if (!validarPassword(password)) {
    marcarError(passwordInput, "Contraseña inválida");
    return;
  }

  if (password !== confirmPassword) {
    marcarError(confirmPasswordInput, "No coinciden");
    return;
  }

  // 🔥 VALIDAR DOCUMENTO ÚNICO
const consulta = query(
  collection(db, "usuarios"),
  where("documento", "==", documento)
);

const resultado = await getDocs(consulta);

if (!resultado.empty) {
  marcarError(documentoInput, "Documento ya registrado");

  Swal.fire(
    "Error",
    "Ese documento ya existe en el sistema",
    "error"
  );

  return;
}

  const btn = document.getElementById("btnRegistro");
  btn.disabled = true;
btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Registrando...';
  try {

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    await setDoc(doc(db, "usuarios", user.uid), {
      nombre,
      tipoDocumento,
      documento,
      email,
      programa,
      semestre,
      rol: "estudiante",
      creado: new Date()
    });

    Swal.fire("Éxito", "Registro completado", "success");

    nombreInput.value = "";
    tipoDocumentoInput.value = "";
    documentoInput.value = "";
    emailInput.value = "";
    passwordInput.value = "";
    confirmPasswordInput.value = "";
    programaInput.value = "";
    semestreInput.value = "";

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);

  } catch (error) {

    let mensaje = "Error al registrar";
   console.log(error.code);
   console.log(error.message);
   
    if (error.code === "auth/email-already-in-use") {
      marcarError(emailInput, "Correo ya registrado");
      mensaje = "Correo en uso";
    }

    Swal.fire("Error", mensaje, "error");

  } finally {

    btn.disabled = false;
    btn.innerHTML = "Registrarse";

  }

}


// 🔥 OJITO CONTRASEÑA
function togglePassword() {

  const icon = document.querySelector(".toggle-password");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    icon.classList.replace("bi-eye-slash", "bi-eye");
  } else {
    passwordInput.type = "password";
    icon.classList.replace("bi-eye", "bi-eye-slash");
  }

}

// 🔥 OJITO CONFIRMAR CONTRASEÑA
function toggleConfirmPassword() {

const icon = document.querySelector(".toggle-confirm-password");
  if (confirmPasswordInput.type === "password") {
    confirmPasswordInput.type = "text";
    icon.classList.replace("bi-eye-slash", "bi-eye");
  } else {
    confirmPasswordInput.type = "password";
    icon.classList.replace("bi-eye", "bi-eye-slash");
  }

}



// 🔥 EVENTOS
document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("btnRegistro")
    .addEventListener("click", registrar);

  const ojo = document.querySelector(".toggle-password");

  if (ojo) {
    ojo.addEventListener("click", togglePassword);
  }

const ojoConfirmar = document.querySelector(".toggle-confirm-password");

  if (ojoConfirmar) {
    ojoConfirmar.addEventListener("click", toggleConfirmPassword);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      registrar();
    }
  });

});