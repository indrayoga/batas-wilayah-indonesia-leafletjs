import "./style.css";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

document.addEventListener("DOMContentLoaded", () => {
  const map = L.map("map").setView([-1.265, 116.831], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  L.marker([-1.265, 116.831])
    .addTo(map)
    .bindPopup("Ini Balikpapan")
    .openPopup();
});
