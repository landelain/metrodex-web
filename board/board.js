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
      // database = snap.data();
      console.log("database acquired");
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
    const response = await fetch('../hard_data/paris/paris.json');
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error loading JSON:', error);
  }
}

const hard_data = await loadStations(); // works at top level since your script is type="module"


const database = new Object();
for (let i = 0 ; i <  Object.keys(hard_data.stations).length ; i ++) {
  const stationid = Object.keys(hard_data.stations)[i];
  database[stationid] = {"passed" : false, "been" : false};
}


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
let checkboxes_passed = [];
let checkboxes_been = [];

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

  let checkboxp_i = document.createElement("input");
  checkboxp_i.setAttribute("type", "checkbox")
  id = "checkboxp" + String(i);
  checkboxp_i.setAttribute("id", id);
  checkboxp_i.setAttribute("class", "checkboxp");
  snippet_i.appendChild(checkboxp_i);
  checkboxes_passed.push(checkboxp_i);

  let checkboxb_i = document.createElement("input");
  checkboxb_i.setAttribute("type", "checkbox")
  id = "checkboxb" + String(i);
  checkboxb_i.setAttribute("id", id);
  checkboxb_i.setAttribute("class", "checkboxb");
  snippet_i.appendChild(checkboxb_i);
  checkboxes_been.push(checkboxb_i);

  stations.appendChild(snippet_i);
  stationsnippet.push(snippet_i);

}

let current_line = 0;
let current_line_stations =  lines[line_numbers[current_line]]["stations"];
let current_line_station_n = current_line_stations.length;
let current_line_color = lines[line_numbers[current_line]]["color"];

function display_n_snippets(n) {

  for (let i = 0 ; i < n ; i++){

    const stationid = current_line_stations[i];
    stationsnippet[i].style.display = "flex";

    names[i].style.display = "flex";
    names[i].textContent = stations_names[stationid]["name"];

    checkboxes_passed[i].style.display = "flex";
    checkboxes_been[i].style.display = "flex";
    
    checkboxes_passed[i].checked = database[stationid]["passed"];
    checkboxes_been[i].checked = database[stationid]["been"];


  }
  for (let i=n; i < max_snippets ; i++){
    stationsnippet[i].style.display = "none";
    names[i].style.dislay = "none";
    checkboxes_passed[i].style.display = "none";
    checkboxes_been[i].style.display = "none";
  }
}


const bottom = document.getElementById("bottom");
const arrow = document.getElementById("arrow");
const stationboard = document.getElementById("station-board");
const line = document.getElementById("line");
let hidden = true;

const leftarrow = document.getElementById("left-arrow");
const rightarrow = document.getElementById("right-arrow");

leftarrow.textContent = "<";
rightarrow.textContent = ">";


function changecolorrgb(rgbString, factor = 0.8) {
  const parts = rgbString.match(/[\d.]+/g).map(Number);
  const [r, g, b] = parts;

  const newR = Math.round(r * factor);
  const newG = Math.round(g * factor);
  const newB = Math.round(b * factor);

  return `rgb(${newR}, ${newG}, ${newB})`;
}

function colorchange(){

  stationboard.style.backgroundColor = current_line_color;

  leftarrow.style.backgroundColor = changecolorrgb(current_line_color, 0.8);
  rightarrow.style.backgroundColor = changecolorrgb(current_line_color, 0.8);
  line.style.backgroundColor = changecolorrgb(current_line_color, 0.8);

}

colorchange();

arrow.addEventListener("click", async () => {

  if (hidden) {

    bottom.style.justifyContent = "flex-start";
    stationboard.style.display = "flex";
    line.textContent = "Ligne " + String(line_numbers[current_line]);
    display_n_snippets(current_line_station_n);

    hidden = false;

    arrow.textContent = "⌄";
    arrow.style.justifyContent = "flex-start";
    arrow.style.transform = "translateY(50%)";

  } else {

    bottom.style.justifyContent = "flex-end";
    stationboard.style.display = "none";
    line.textContent = "";

    hidden = true;

    arrow.textContent = "^"
    arrow.style.justifyContent = "flex-end";
    arrow.style.transform = "translateY(0%)";

  }

});

function changelinearrow(){

  line.textContent = "Ligne " + String(line_numbers[current_line]);
  current_line_stations =  lines[line_numbers[current_line]]["stations"];
  current_line_station_n = current_line_stations.length;
  display_n_snippets(current_line_station_n);

  current_line_color = lines[line_numbers[current_line]]["color"];
  colorchange();

}

leftarrow.addEventListener("click", async () => {

  if (current_line == 0){
    current_line = n_lines-1;
  }
  else {
    current_line = current_line -1;
  }

  changelinearrow();
  leftarrow.style.backgroundColor = changecolorrgb(current_line_color, 0.7);

  // more changes 

});

rightarrow.addEventListener("click", async () => {

  if (current_line == n_lines-1){
    current_line = 0;
  }
  else {
    current_line = current_line +1;
  }

  changelinearrow();
  rightarrow.style.backgroundColor = changecolorrgb(current_line_color, 0.7);

  // more changes 

});


leftarrow.addEventListener("mouseover", async () => {
  leftarrow.style.backgroundColor = changecolorrgb(current_line_color, 0.7);
});

leftarrow.addEventListener("mouseout", async () => {
  leftarrow.style.backgroundColor = changecolorrgb(current_line_color, 0.8);
});

rightarrow.addEventListener("mouseover", async () => {
  rightarrow.style.backgroundColor = changecolorrgb(current_line_color, 0.7);
});

rightarrow.addEventListener("mouseout", async () => {
  rightarrow.style.backgroundColor = changecolorrgb(current_line_color, 0.8);
});


function handlecheckboxpassed(event) {

  if(database){
    const i = parseInt(this.id.slice(9));
    const stationid = current_line_stations[i];
    database[stationid]["passed"] = ! database[stationid]["passed"];
  } 

}

function handlecheckboxbeen(event) {

  if(database){
    const i = parseInt(this.id.slice(9));
    const stationid = current_line_stations[i];
    database[stationid]["been"] = ! database[stationid]["been"];
  } 

}



for (let i = 0 ; i < max_snippets ; i++){
  checkboxes_passed[i].addEventListener("change", handlecheckboxpassed);
  checkboxes_been[i].addEventListener("change", handlecheckboxbeen);

};





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
