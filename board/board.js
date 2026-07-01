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



const select = document.getElementById("city-select");
let city = select.options[select.selectedIndex].value;
console.log(city)

select.addEventListener("change", async () => {
  city = select.options[select.selectedIndex].value;
  console.log(city);
});





const stations = document.getElementById("stations");
const max_snippets = 40;

let stationsnippet = [];
for (let i = 0 ; i < max_snippets ; i++){

  let snippet_i = document.createElement("div");
  let id = "snippet" + String(i);
  snippet_i.setAttribute("id", id);
  snippet_i.setAttribute("class", "snippet");
  stations.appendChild(snippet_i);
  stationsnippet.push(snippet_i);

}

let current_line_station_n = 20;


function display_n_snippets(n) {

  for (let i = 0 ; i < n ; i++){
    stationsnippet[i].style.height = "5%";
  }
}

function hide_snippets() {
  for (let i = 0 ; i < max_snippets ; i++){
    stationsnippet[i].style.height = "0%";
  }
}

display_n_snippets(3);

const arrow = document.getElementById("arrow");
const stationboard = document.getElementById("station-board")
let hidden = true;

arrow.addEventListener("click", async () => {

  if (hidden) {

    stationboard.style.height = "90%" ;
    stationboard.style.padding = "5%";
    stationboard.style.paddingTop="7%";

    hidden = false;

    arrow.textContent = "⌄";
    arrow.style.justifyContent = "flex-start";
    arrow.style.transform = "translateY(50%)";

  } else {

    stationboard.style.height = "0%";
    stationboard.style.padding = "0%";
    stationboard.style.paddingTop="0%";

    hidden = true;

    arrow.textContent = "^"
    arrow.style.justifyContent = "flex-end";
    arrow.style.transform = "translateY(20%)";

  }

});



// document.getElementById('paris_button').addEventListener('click', async () => {

//   const user = auth.currentUser;

//   // console.log("here")
//   // console.log(user)
//   // console.log(user.email)

//   if (!user) {
//     console.error("User not ready yet");
//     return;
//   }

//   await setDoc(doc(db, "users", user.uid), {
    
//     city: "paris",
    
//   }, { merge: true });

//   // const snap = await getDoc(doc(db, "users", user.uid));
//   //   if (snap.exists()) {
//   //     const data = snap.data();
//   //     console.log(data["city"]);
//   //   }

//   window.location.href = '../main/main.html';

// });
