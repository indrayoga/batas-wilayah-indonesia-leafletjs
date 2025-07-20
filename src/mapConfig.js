// mapConfig.js
import L from "leaflet";
import * as esri from "esri-leaflet";

export const map = L.map("map").setView([-1.5, 117], 5);

export const kabupatenLayer = esri.featureLayer({
  url: "https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/BATAS_WILAYAH/MapServer/12",
  layers: [12],
  opacity: 0.7,
  simplifyFactor: 0.35,
  precision: 5,
  style: () => ({
    color: "#000000",
    weight: 1,
    fillColor: "#ffcccc",
    fillOpacity: 0.5,
  }),
});

export const kecamatanLayerGroup = L.layerGroup();
export const desaLayerGroup = L.layerGroup();

export function setupBaseMap() {
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);
}

export function setupLayerControl() {
  L.control
    .layers(
      null,
      {
        "Batas Kabupaten/Kota": kabupatenLayer,
        "Batas Kecamatan": kecamatanLayerGroup,
        "Batas Desa": desaLayerGroup,
      },
      {
        collapsed: false,
      }
    )
    .addTo(map);
}
