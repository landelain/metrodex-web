import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
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
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("Logged in as", user.email);
    
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      const data = snap.data();
      console.log(data["test"]);
    }

  } else {
    // not looged in, kick back to login page
    window.location.href = '../login/login.html';
  }
});

document.getElementById('paris_button').addEventListener('click', async () => {

  const user = auth.currentUser;

  // console.log("here")
  // console.log(user)
  // console.log(user.email)

  if (!user) {
    console.error("User not ready yet");
    return;
  }

  await setDoc(doc(db, "users", user.uid), {
    
    city: "paris",
    
  }, { merge: true });

  // const snap = await getDoc(doc(db, "users", user.uid));
  //   if (snap.exists()) {
  //     const data = snap.data();
  //     console.log(data["city"]);
  //   }

  window.location.href = '../main/main.html';

});


document.getElementById('lausanne_button').addEventListener('click', async () => {

  const user = auth.currentUser;

  if (!user) {
    console.error("User not ready yet");
    return;
  }


  await setDoc(doc(db, "users", user.uid), {
    
    city: "lausanne",
    
  }, { merge: true });
  
  window.location.href = '../main/main.html';

});