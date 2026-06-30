import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, setDoc, getDoc, getDocs, query, where, updateDoc } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBjSOVCiCKyzYGhLEe3yATufL8KTja2g8o",
  authDomain: "metrodex-database.firebaseapp.com",
  projectId: "metrodex-database",
  storageBucket: "metrodex-database.firebasestorage.app",
  messagingSenderId: "956454868769",
  appId: "1:956454868769:web:06da51d224ebc497b55060"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);