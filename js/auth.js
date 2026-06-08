// 🔥 IMPORTS FIREBASE
import {
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
provider.setCustomParameters({
  prompt: "select_account"
});

// 🔥 ELEMENTOS
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

// 🔥 MENSAJES
const emailError = document.createElement("small");
emailError.classList.add("error-text");

const passError = document.createElement("small");
passError.classList.add("error-text");

emailInput.after(emailError);
passwordInput.parentElement.after(passError);

// 🔥 ANIMACIÓN ERROR
function marcarError(input, mensaje = "Campo obligatorio") {
  input.classList.add("input-error");

  if (input === emailInput) emailError.textContent = mensaje;
  if (input === passwordInput) passError.textContent = mensaje;
}

// 🔥 LIMPIAR ERRORES (MEJORADO)
function limpiarErrores() {
  document.querySelectorAll(".error-text").forEach(el => el.textContent = "");

  document.querySelectorAll("input").forEach(el => {
    el.classList.remove("input-error");
    el.classList.remove("input-success"); // 🔥 clave
  });
}

// 🔥 VALIDACIÓN EN TIEMPO REAL
emailInput.addEventListener("input", () => {
  emailInput.classList.remove("input-error");

  if (!validarEmail(emailInput.value)) {
    emailError.textContent = "Correo inválido (Ej: usuario@unicaribe.edu.co)";
  } else {
    emailError.textContent = "";
    emailInput.classList.add("input-success");
  }
});

passwordInput.addEventListener("input", () => {
  passwordInput.classList.remove("input-error");

  if (!validarPassword(passwordInput.value)) {
    passError.textContent = "Mínimo 6 caracteres, un número y un símbolo (Ej: Juan123&)";
  } else {
    passError.textContent = "";
    passwordInput.classList.add("input-success");
  }
});

// 🔥 LOGIN
async function login(email, password) {

  limpiarErrores();

  let hayError = false;

  // 🔥 VALIDAR VACÍOS
  if (!email) {
    marcarError(emailInput);
    hayError = true;
  }

  if (!password) {
    marcarError(passwordInput);
    hayError = true;
  }

  if (hayError) {
    Swal.fire("Error", "Completa los campos", "warning");
    return;
  }

  // 🔥 VALIDAR EMAIL (OK)
  if (!validarEmail(email)) {
    marcarError(emailInput, "Correo inválido");
    Swal.fire("Error", "Correo inválido", "error");
    return;
  }

  // ❌ ELIMINAMOS VALIDAR PASSWORD AQUÍ (IMPORTANTE)

  try {
    mostrarLoader("Iniciando sesión...");

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const docSnap = await getDoc(doc(db, "usuarios", user.uid));

    if (!docSnap.exists()) {
      Swal.fire("Error", "Usuario sin datos en BD", "error");
      return;
    }

    const rol = docSnap.data().rol;

    if (!rol) {
      Swal.fire("Error", "Usuario sin rol asignado", "error");
      return;
    }

    Swal.fire({
      title: "Bienvenido",
      text: `Rol: ${rol}`,
      icon: "success",
      timer: 1500,
      showConfirmButton: false
    });

    // 🔥 LIMPIAR INPUTS
    emailInput.value = "";
    passwordInput.value = "";

    setTimeout(() => {

      // 🔥 REDIRECCIÓN POR ROL
      if (rol === "estudiante") {
window.location.replace("index.html");  
    } else if (rol === "profesor") {
window.location.replace("profesor.html");
      } else {
window.location.replace("index.html");      }

    }, 1500);

  } catch (error) {
           console.log(error.code);
   console.log(error.message);

    let mensaje = "Credenciales incorrectas";



    // 🔥 ERROR NUEVO DE FIREBASE (CLAVE)
    if (error.code === "auth/invalid-credential") {
      marcarError(emailInput);
      marcarError(passwordInput);
      mensaje = "Correo o contraseña incorrectos";
    }

    else if (error.code === "auth/user-not-found") {
      marcarError(emailInput, "Correo no registrado");
      mensaje = "El correo no existe";
    }

    else if (error.code === "auth/wrong-password") {
      marcarError(passwordInput, "Contraseña incorrecta");
      mensaje = "Contraseña incorrecta";
    }

    else if (error.code === "auth/too-many-requests") {
      mensaje = "Demasiados intentos, intenta más tarde";
    }

    else if (error.code === "auth/network-request-failed") {
      mensaje = "Error de conexión";
    }

    else {
      marcarError(emailInput);
      marcarError(passwordInput);
    }

    // 🔥 LIMPIAR SUCCESS (VISUAL)
    emailInput.classList.remove("input-success");
    passwordInput.classList.remove("input-success");

    Swal.fire("Error", mensaje, "error");
  }
}
// 🔥 GOOGLE LOGIN
async function loginGoogle() {
  try {
    mostrarLoader("Conectando con Google...");

    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const ref = doc(db, "usuarios", user.uid);

const snap = await getDoc(ref);

const nombreGoogle =
  user.displayName ||
  user.email.split("@")[0] ||
  "Usuario";

const iniciales = nombreGoogle
  .split(" ")
  .map(p => p[0])
  .slice(0, 2)
  .join("")
  .toUpperCase();

// 🔥 SI EL USUARIO NO EXISTE
if (!snap.exists()) {

  await setDoc(ref, {

    nombre: nombreGoogle,
    email: user.email,

    rol: "estudiante",

    foto: user.photoURL || "",

    iniciales,

    creado: new Date()

  });

} else {

  // 🔥 ACTUALIZAR FOTO Y NOMBRE GOOGLE
  await setDoc(ref, {

    nombre: nombreGoogle,

    foto: user.photoURL || "",

    iniciales

  }, { merge: true });

  // 🔥 ESPERAR ACTUALIZACIÓN
await new Promise(resolve => setTimeout(resolve, 500));
}

    Swal.fire("Bienvenido", "Login con Google exitoso", "success");

window.location.replace("index.html");

  } catch (error) {
       console.log(error.code);
   console.log(error.message);
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
    case "auth/too-many-requests":
      return "Demasiados intentos";
    case "auth/popup-closed-by-user":
      return "Cerraste Google";
    default:
      return "Error inesperado";
  }
}

// 🔥 EVENTOS
document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("formLogin").addEventListener("submit", (e) => {
    e.preventDefault();

    login(
      emailInput.value.trim(),
      passwordInput.value.trim()
    );
  });

  document.getElementById("btnGoogle")
    .addEventListener("click", loginGoogle);

  document.getElementById("btnRegistro")
    .addEventListener("click", () => {
      window.location.href = "registro.html";
    });

  document.querySelector(".toggle-password")
    .addEventListener("click", togglePassword);

});