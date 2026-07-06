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

let current_user = null;

const authReady = new Promise((resolve) => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("Logged in as", user.email);
      current_user = user;
      resolve(user);
    } else {
      // not logged in, kick back to login page
      window.location.href = '../login/login.html';
    }
  });
});

const select = document.getElementById("city-select");
let city = select.options[select.selectedIndex].value;


async function load_stations(city_name) {
  try {
    const response = await fetch(`../hard_data/${city_name}/${city_name}.json`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading JSON:', error);
  }
}

// function dmsToDecimal(dmsString) {
//   const [degrees, minutes, seconds] = dmsString.split(' ').map(Number);
//   return degrees + minutes / 60 + seconds / 3600;
// }

function build_database(hard_data) {

  const local = {};
  const station_ids = Object.keys(hard_data.stations);
  for (const stationid of station_ids) {
    const stationname = hard_data.stations[stationid]["name"];
    let [lat, long] = hard_data.stations[stationid]["coords"];
    // lat = dmsToDecimal(lat);
    // long = dmsToDecimal(long);
    local[stationid] = { passed: false, been: false, name: stationname, lat : lat, long : long };
  }
  return local;

}

// ----------------------------- Database Remote ----------------------------

function city_doc_ref(city_name) {
  return doc(db, "users", current_user.uid, "cities", city_name);
}


async function load_or_init_database(city_name, local) {
  const ref = city_doc_ref(city_name);
  const snap = await getDoc(ref);
 
  if (snap.exists()) {
    const remote = snap.data().stations || {};
    for (const stationid of Object.keys(local)) {
      if (remote[stationid]) {
        local[stationid].passed = !!remote[stationid].passed;
        local[stationid].been = !!remote[stationid].been;
      }
    }
  } else {
    const stations_obj = {};
    for (const stationid of Object.keys(local)) {
      stations_obj[stationid] = { passed: false, been: false };
    }
    await setDoc(ref, { stations: stations_obj });
  }
}


async function update_remote(city_name, stationid, field, value) {
  if (!current_user) return;
  const ref = city_doc_ref(city_name);
  try {
    await updateDoc(ref, { [`stations.${stationid}.${field}`]: value });
    console.log("remote updated");
  } catch (error) {
    console.error("Failed to sync station update to Firestore:", error);
  }
}


// ---------------------------------- App -----------------------------------

let hard_data;
let database = {};
let line_numbers, lines, stations_names, n_lines;
let current_line = 0;
let current_line_stations = [];
let current_line_station_n = 0;
let current_line_color = "#999999";

async function init_city(city_name) {

  hard_data = await load_stations(city_name);
  database = build_database(hard_data);
  await load_or_init_database(city_name, database);
 
  line_numbers = hard_data.line_numbers;
  lines = hard_data.lines;
  stations_names = hard_data.stations;
  n_lines = line_numbers.length;
 
  current_line = 0;
  current_line_stations = lines[line_numbers[current_line]]["stations"];
  current_line_station_n = current_line_stations.length;
  current_line_color = lines[line_numbers[current_line]]["color"];
}





const stations = document.getElementById("stations");
const max_snippets = 40;

let stationsnippet = [];
let names = [];
let checkboxes_boxes = [];
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

  let checkbox_boxi = document.createElement("div");
  id = "checkbox-box" + String(i);
  checkbox_boxi.setAttribute("id", id);
  checkbox_boxi.setAttribute("class", "checkbox-box");
  snippet_i.appendChild(checkbox_boxi);
  checkboxes_boxes.push(checkbox_boxi);

  let checkboxp_i = document.createElement("div");
  id = "checkboxp" + String(i);
  checkboxp_i.setAttribute("id", id);
  checkboxp_i.setAttribute("class", "checkboxp");
  checkbox_boxi.appendChild(checkboxp_i);
  checkboxes_passed.push(checkboxp_i);

  let checkboxb_i = document.createElement("div");
  id = "checkboxb" + String(i);
  checkboxb_i.setAttribute("id", id);
  checkboxb_i.setAttribute("class", "checkboxb");
  checkbox_boxi.appendChild(checkboxb_i);
  checkboxes_been.push(checkboxb_i);

  stations.appendChild(snippet_i);
  stationsnippet.push(snippet_i);

}


select.addEventListener("change", async () => {

  city = select.options[select.selectedIndex].value;
  await init_city(city);
  changelinearrow();
  refresh_map();
  
});

function checkbox_color(checked, passed){

  if (passed){
    return checked ? "rgb(0, 0, 255)" : "rgb(27, 27, 115)";
  }
  else {
    return checked ? "rgb(0, 255, 0)" : "rgb(19, 109, 19)";
  }
}


function display_n_snippets(n) {

  for (let i = 0 ; i < n ; i++){

    const stationid = current_line_stations[i];
    stationsnippet[i].style.display = "flex";

    names[i].style.display = "flex";
    names[i].textContent = stations_names[stationid]["name"];

    checkboxes_passed[i].style.display = "flex";
    checkboxes_been[i].style.display = "flex";
    
    checkboxes_passed[i].style.backgroundColor = checkbox_color(database[stationid]["passed"], true);
    checkboxes_been[i].style.backgroundColor = checkbox_color(database[stationid]["been"], false);


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

  if(!database) return;

  const i = parseInt(event.target.id.slice(9));
  const stationid = current_line_stations[i];
  const newValue = !database[stationid]["passed"];
  database[stationid]["passed"] = newValue;
  
  event.target.style.backgroundColor = checkbox_color(newValue, true);
  update_marker_color(stationid);
  update_remote(city, stationid, "passed", newValue);

}

function handlecheckboxbeen(event) {

  if(!database) return;

  const i = parseInt(event.target.id.slice(9));
  const stationid = current_line_stations[i];
  const newValue = !database[stationid]["been"];
  database[stationid]["been"] = newValue;

  event.target.style.backgroundColor = checkbox_color(newValue, false);
  update_marker_color(stationid);
  update_remote(city, stationid, "been", newValue);
 
  if (newValue && !database[stationid]["passed"]) {
    database[stationid]["passed"] = true;
    checkboxes_passed[i].style.backgroundColor = checkbox_color(true, true);
    update_remote(city, stationid, "passed", true);
  }

}



for (let i = 0 ; i < max_snippets ; i++){
  checkboxes_passed[i].addEventListener("click", handlecheckboxpassed);
  checkboxes_been[i].addEventListener("click", handlecheckboxbeen);
};






const map = L.map('map', { zoomControl: true, tap: true }).setView([48.8566, 2.3359], 13);

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
}).addTo(map);

const linesLayer = L.layerGroup().addTo(map);
const markersLayer = L.layerGroup().addTo(map);

function draw_lines() {
  line_numbers.forEach(lineNumber => {
    const line_data = lines[lineNumber];
    const station_ids = line_data.stations;
    const color = line_data.color;

    const latlongs = station_ids.map(stationid => {
      const point = database[stationid];
      return [point.lat, point.long];
    });

    L.polyline(latlongs, {
      color: color,
      weight: 6,
      opacity: 0.8
    }).addTo(linesLayer);
  });
}

// draw_lines();


function get_marker_color(point) {
  if (point.been) {
    return '#2ecc71';
  } else if (point.passed) {
    return '#0099ff';
  } else {
    return '#e63946';
  }
}

let markers_stations = {};
let initialBounds = null;


function load_map_points() {

  markers_stations = {};
 
  Object.keys(database).forEach(stationid => {
    const point = database[stationid];
 
    const marker = L.circleMarker([point.lat, point.long], {
      radius: 6,
      fillColor: get_marker_color(point),
      color: '#ffffff',
      weight: 2,
      fillOpacity: 0.9
    }).addTo(markersLayer);
 
    const name = point.name;
    const linestring = stations_names[stationid].line.join();
    const argstring = `${name}<br><span class="tooltip-subtext"> Ligne(s) : ${linestring}</span>`;
 
    marker.bindTooltip(argstring, {
      direction: 'top',
      offset: [0, -5],
      className: 'station-tooltip'
    });
 
    markers_stations[stationid] = marker;
  });
 
  const markers = Object.values(markers_stations);
  if (markers.length > 0) {
    const group = new L.featureGroup(markers);
    initialBounds = group.getBounds().pad(0.2);
    map.fitBounds(initialBounds);
  }
}
 
function refresh_map() {
  linesLayer.clearLayers();
  markersLayer.clearLayers();
  draw_lines();
  load_map_points();
}

function update_marker_color(stationid) {
  const marker = markers_stations[stationid];
  if (marker) {
    marker.setStyle({ fillColor: get_marker_color(database[stationid]) });
  }
}


document.getElementById('reset-view').addEventListener('click', () => {
  if (initialBounds) {
    map.flyToBounds(initialBounds);
  }
});


// --------------------------------- Boot -----------------------------------

await authReady;     
await init_city(city); 
changelinearrow();     
refresh_map();   