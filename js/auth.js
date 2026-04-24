// 🔥 IMPORTS FIREBASE
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { auth, db } from "../js/firestore.js";

const provider = new GoogleAuthProvider();

// 🔥 CONTROL DE INTENTO
let intentoEnvio = false;

// 🔥 ELEMENTOS
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const rolInput = document.getElementById("rol");

// 🔥 MENSAJES
const emailError = document.createElement("small");
emailError.classList.add("error-text");

const passError = document.createElement("small");
passError.classList.add("error-text");

const rolError = document.createElement("small");
rolError.classList.add("error-text");

emailInput.after(emailError);
passwordInput.parentElement.after(passError);
rolInput.after(rolError);

// 🔥 ANIMACIÓN ERROR
function marcarError(input, mensaje = "Campo obligatorio") {

  input.classList.add("input-error");

  if (input === emailInput) {
    emailError.textContent = mensaje;
  }

  if (input === passwordInput) {
    passError.textContent = mensaje;
  }

  if (input === rolInput) {
    rolError.textContent = mensaje;
  }
}

// 🔥 VALIDACIÓN EN TIEMPO REAL (SUAVE)
emailInput.addEventListener("input", () => {
  if (!validarEmail(emailInput.value)) {
    emailError.textContent = "Correo inválido (Ej: usuario@dominio.com)";
  } else {
    emailError.textContent = "";
    emailInput.classList.add("input-success");
  }
});

passwordInput.addEventListener("input", () => {
  if (!validarPassword(passwordInput.value)) {
    passError.textContent = "Mínimo 6 caracteres, un número y un símbolo (Ej: Juan123!)";
  } else {
    passError.textContent = "";
    passwordInput.classList.add("input-success");
  }
});

rolInput.addEventListener("change", () => {
  if (!rolInput.value) {
    rolError.textContent = "Selecciona un rol";
  } else {
    rolError.textContent = "";
    rolInput.classList.add("input-success");
  }
});

// 🔥 REGISTRO
async function registrar(email, password) {

  intentoEnvio = true;

  if (!email || !password || !rolInput.value) {
    Swal.fire("Error", "Completa todos los campos", "warning");

    if (!email) marcarError(emailInput);
    if (!password) marcarError(passwordInput);
    if (!rolInput.value) {
      rolError.textContent = "Campo obligatorio";
      marcarError(rolInput);
    }

    return;
  }

  if (!validarEmail(email)) {
    Swal.fire("Error", "Correo inválido", "error");
    marcarError(emailInput);
    return;
  }

  if (!validarPassword(password)) {
    Swal.fire(
      "Error",
      "La contraseña debe tener mínimo 6 caracteres, un número y un símbolo (Ej: Juan123!)",
      "warning"
    );
    marcarError(passwordInput);
    return;
  }

  try {
    mostrarLoader("Registrando...");

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "usuarios", user.uid), {
      email,
      rol: rolInput.value,
      creado: new Date()
    });

    Swal.fire("Éxito", "Usuario registrado", "success");

  } catch (error) {
    Swal.fire("Error", obtenerMensajeError(error), "error");
  }
}

// 🔥 LOGIN
async function login(email, password) {

  intentoEnvio = true;

  // LIMPIAR ERRORES
  limpiarErrores();

  let hayError = false;

  // VALIDAR VACÍOS
  if (!email) {
    marcarError(emailInput, "Campo obligatorio");
    hayError = true;
  }

  if (!password) {
    marcarError(passwordInput, "Campo obligatorio");
    hayError = true;
  }

  if (!rolInput.value) {
    marcarError(rolInput, "Campo obligatorio");
    hayError = true;
  }

  if (hayError) {
    Swal.fire("Error", "Completa los campos", "warning");
    return;
  }

  // VALIDAR EMAIL
  if (!validarEmail(email)) {
    marcarError(emailInput, "Correo inválido");
    Swal.fire("Error", "Correo inválido", "error");
    return;
  }

  // VALIDAR PASSWORD
  if (!validarPassword(password)) {
    marcarError(passwordInput, "Contraseña inválida");
    Swal.fire("Error", "Contraseña inválida (Ej: Juan123!)", "warning");
    return;
  }

  try {
    mostrarLoader("Iniciando sesión...");

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const docSnap = await getDoc(doc(db, "usuarios", user.uid));

    let rol = "sin rol";
    if (docSnap.exists()) {
      rol = docSnap.data().rol;
    }

    Swal.fire({
      title: "Bienvenido",
      text: `Rol: ${rol}`,
      icon: "success",
      timer: 1500,
      showConfirmButton: false
    });

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);

  } catch (error) {

    marcarError(emailInput);
    marcarError(passwordInput);

    Swal.fire("Error", "Credenciales incorrectas", "error");
  }
}

// 🔥 GOOGLE
async function loginGoogle() {
  try {
    mostrarLoader("Conectando con Google...");

    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, {
        email: user.email,
        rol: "estudiante",
        creado: new Date()
      });
    }

    Swal.fire("Bienvenido", "Login con Google exitoso", "success");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);

  } catch (error) {
    Swal.fire("Error", obtenerMensajeError(error), "error");
  }
}

// 🔥 OJITO
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

// 🔥 VALIDADORES
function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarPassword(password) {
  return /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/.test(password);
}

// 🔥 LOADER
function mostrarLoader(msg) {
  Swal.fire({
    title: msg,
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });
}

// 🔥 ERRORES
function obtenerMensajeError(error) {
  switch (error.code) {
    case "auth/email-already-in-use":
      return "Correo ya registrado";
    case "auth/too-many-requests":
      return "Demasiados intentos";
    default:
      return "Error inesperado";
  }
}
function limpiarErrores() {
  document.querySelectorAll(".error-text").forEach(el => el.textContent = "");
  document.querySelectorAll("input, select").forEach(el => el.classList.remove("input-error"));
}
// 🔥 EVENTOS
document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("btnLogin")
    .addEventListener("click", () => login(emailInput.value, passwordInput.value));

  document.getElementById("btnRegistro")
    .addEventListener("click", () => registrar(emailInput.value, passwordInput.value));

  document.getElementById("btnGoogle")
    .addEventListener("click", loginGoogle);

  document.querySelector(".toggle-password")
    .addEventListener("click", togglePassword);

});