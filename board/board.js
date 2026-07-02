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


async function loadStations() {
  try {
    const response = await fetch('../hard_data/paris.json');
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error loading JSON:', error);
  }
}

const hard_data = await loadStations(); // works at top level since your script is type="module"


const line_numbers = hard_data.line_numbers;
const lines = hard_data.lines;
const stations_names = hard_data.stations;
const n_lines = line_numbers.length;

select.addEventListener("change", async () => {
  city = select.options[select.selectedIndex].value;

  // fetch data on line numbers for var
  
});





const stations = document.getElementById("stations");
const max_snippets = 40;

let stationsnippet = [];
let names = [];
let checkboxes = [];

for (let i = 0 ; i < max_snippets ; i++){

  let snippet_i = document.createElement("div");
  let id = "snippet" + String(i);
  snippet_i.setAttribute("id", id);
  snippet_i.setAttribute("class", "snippet");

  let name_i = document.createElement("b");
  id = "name" + String(i);
  name_i.setAttribute("id", id);
  name_i.setAttribute("class", "name");
  snippet_i.appendChild(name_i);
  names.push(name_i);

  let checkbox_i = document.createElement("input");
  checkbox_i.setAttribute("type", "checkbox")
  id = "checkbox" + String(i);
  checkbox_i.setAttribute("id", id);
  checkbox_i.setAttribute("class", "checkbox");
  snippet_i.appendChild(checkbox_i);
  checkboxes.push(checkbox_i);

  stations.appendChild(snippet_i);
  stationsnippet.push(snippet_i);

}

let current_line = 0;
let current_line_stations =  lines[line_numbers[current_line]];
let current_line_station_n = current_line_stations.length;

function display_n_snippets(n) {

  for (let i = 0 ; i < n ; i++){
    stationsnippet[i].style.display = "flex";
    names[i].style.display = "flex";
    names[i].textContent = stations_names[current_line_stations[i]]["name"];
    checkboxes[i].style.display = "flex";
  }
  for (let i=n; i < max_snippets ; i++){
    stationsnippet[i].style.display = "none";
    names[i].style.dislay = "none";
    checkboxes[i].style.display = "none";
  }
}



const arrow = document.getElementById("arrow");
const stationboard = document.getElementById("station-board");
const line = document.getElementById("line");
let hidden = true;

arrow.addEventListener("click", async () => {

  if (hidden) {

    stationboard.style.display = "flex";
    line.textContent = "Ligne " + String(line_numbers[current_line]);
    display_n_snippets(current_line_station_n);

    hidden = false;

    arrow.textContent = "⌄";
    arrow.style.justifyContent = "flex-start";
    arrow.style.transform = "translateY(50%)";

  } else {

    stationboard.style.display = "none";
    line.textContent = "";

    hidden = true;

    arrow.textContent = "^"
    arrow.style.justifyContent = "flex-end";
    arrow.style.transform = "translateY(0%)";

  }

});

const leftarrow = document.getElementById("left-arrow");
const rightarrow = document.getElementById("right-arrow");

leftarrow.textContent = "<";
rightarrow.textContent = ">";

leftarrow.addEventListener("click", async () => {

  if (current_line == 0){
    current_line = n_lines-1;
  }
  else {
    current_line = current_line -1;
  }

  line.textContent = "Ligne " + String(line_numbers[current_line]);
  current_line_stations =  lines[line_numbers[current_line]];
  current_line_station_n = current_line_stations.length;
  display_n_snippets(current_line_station_n);

  // more changes 

});

rightarrow.addEventListener("click", async () => {

  if (current_line == n_lines-1){
    current_line = 0;
  }
  else {
    current_line = current_line +1;
  }

  line.textContent = "Ligne " + String(line_numbers[current_line]);
  current_line_stations =  lines[line_numbers[current_line]];
  current_line_station_n = lines[line_numbers[current_line]].length;
  display_n_snippets(current_line_station_n);

  // more changes 

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
