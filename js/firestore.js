// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCVkfsUxDOOQOlMVewPIEEGh0vUl70nuEk",
  authDomain: "asistencia-qr-ff2fa.firebaseapp.com",
  projectId: "asistencia-qr-ff2fa",
  storageBucket: "asistencia-qr-ff2fa.firebasestorage.app",
  messagingSenderId: "308213334769",
  appId: "1:308213334769:web:a61622e7519ad38df79f50"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };