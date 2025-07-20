import "./style.css";
import L from "leaflet";
import * as esri from "esri-leaflet";
import "leaflet/dist/leaflet.css";

import {
  map,
  setupBaseMap,
  setupLayerControl,
  kecamatanLayerGroup,
  desaLayerGroup,
} from "./mapConfig.js";
import {
  loadProvinsi,
  cariKota,
  cariKecamatan,
  cariDesa,
} from "./dataLoader.js";
import { showLoading, hideLoading } from "./utils.js";

const selectProvinsi = document.getElementById("provinsi");
const selectKota = document.getElementById("kota");
const selectKecamatan = document.getElementById("kecamatan");
const selectDesa = document.getElementById("desa");
const loadingIndicator = document.getElementById("loading-indicator");

let provinsi = null;
let kota = null;
let kecamatan = null;

let selectedProvinsiLayer = null;
let selectedKotaLayer = null;
let selectedKecamatanLayer = null;
let selectedDesaLayer = null;

document.addEventListener("DOMContentLoaded", async () => {
  setupBaseMap();
  setupLayerControl();
  await loadProvinsi(selectProvinsi);
});

// Event Listener: Provinsi
selectProvinsi.addEventListener("change", async function () {
  provinsi = this.options[this.selectedIndex].text;
  const kodeProvinsi = this.value;

  showLoading(loadingIndicator);
  await cariKota(kodeProvinsi, selectKota);
  hideLoading(loadingIndicator);

  if (!provinsi) return;

  if (selectedProvinsiLayer) map.removeLayer(selectedProvinsiLayer);
  selectedProvinsiLayer = esri.featureLayer({
    url: "https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/BATAS_WILAYAH/MapServer/12",
  });

  selectedProvinsiLayer
    .query()
    .where(`wadmpr LIKE '%${provinsi}%'`)
    .run((error, fc) => {
      hideLoading(loadingIndicator);
      if (error) return console.error(error);

      const layer = L.geoJSON(fc, {
        style: { color: "red", weight: 1, fillOpacity: 0.3 },
        onEachFeature: (feature, layer) =>
          layer.bindPopup(feature.properties.namobj),
      });
      layer.addTo(map);
      map.fitBounds(layer.getBounds());
    });
});

// Event Listener: Kota
selectKota.addEventListener("change", async function () {
  kota = this.options[this.selectedIndex].text;
  const kodeKota = this.value;

  showLoading(loadingIndicator);
  await cariKecamatan(kodeKota, selectKecamatan);
  hideLoading(loadingIndicator);

  if (!kota) return;

  if (selectedKotaLayer) map.removeLayer(selectedKotaLayer);
  selectedKotaLayer = esri.featureLayer({
    url: "https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/BATAS_WILAYAH/MapServer/13",
  });

  selectedKotaLayer
    .query()
    .where(
      `wadmpr LIKE '%${provinsi}%' AND wadmkk LIKE '%${kota
        .split(" ")
        .slice(1)
        .join(" ")}%'`
    )
    .run((error, fc) => {
      hideLoading(loadingIndicator);
      if (error) return console.error(error);

      const layer = L.geoJSON(fc, {
        style: { color: "yellow", weight: 1, fillOpacity: 0.3 },
        onEachFeature: (feature, layer) =>
          layer.bindPopup(feature.properties.namobj),
      });
      layer.addTo(map);
      map.fitBounds(layer.getBounds());
    });
});

// Event Listener: Kecamatan
selectKecamatan.addEventListener("change", async function () {
  kecamatan = this.options[this.selectedIndex].text;
  const kodeKecamatan = this.value;

  showLoading(loadingIndicator);
  await cariDesa(kodeKecamatan, selectDesa);
  hideLoading(loadingIndicator);

  if (selectedKecamatanLayer) map.removeLayer(selectedKecamatanLayer);
  selectedKecamatanLayer = esri.featureLayer({
    url: "https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/Administrasi_AR_Kecamatan_10K/MapServer/0",
  });

  selectedKecamatanLayer
    .query()
    .where(
      `wadmpr LIKE '%${provinsi}%' AND wadmkk LIKE '%${kota
        .split(" ")
        .slice(1)
        .join(" ")}%' AND wadmkc LIKE '${kecamatan}%'`
    )
    .run((error, fc) => {
      hideLoading(loadingIndicator);
      if (error) return console.error(error);

      const layer = L.geoJSON(fc, {
        style: { color: "blue", weight: 1, fillOpacity: 0.3 },
        onEachFeature: (feature, layer) =>
          layer.bindPopup(feature.properties.namobj),
      });
      layer.addTo(map);
      map.fitBounds(layer.getBounds());
    });
});

// Event Listener: Desa
selectDesa.addEventListener("change", function () {
  const desa = this.options[this.selectedIndex].text;

  showLoading(loadingIndicator);

  if (selectedDesaLayer) map.removeLayer(selectedDesaLayer);
  selectedDesaLayer = esri.featureLayer({
    url: "https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/Administrasi_AR_KelDesa_10K/MapServer/0",
  });

  selectedDesaLayer
    .query()
    .where(
      `wadmpr LIKE '%${provinsi}%' AND wadmkk LIKE '%${kota
        .split(" ")
        .slice(1)
        .join(
          " "
        )}%' AND wadmkc LIKE '${kecamatan}%' AND wadmkd LIKE '%${desa}%'`
    )
    .run((error, fc) => {
      hideLoading(loadingIndicator);
      if (error) return console.error(error);

      const layer = L.geoJSON(fc, {
        style: { color: "green", weight: 1, fillOpacity: 0.3 },
        onEachFeature: (feature, layer) =>
          layer.bindPopup(feature.properties.namobj),
      });
      layer.addTo(map);
      map.fitBounds(layer.getBounds());
    });
});

// Event: Layer Control
map.on("overlayadd", function (e) {
  const queryParts = [];
  if (provinsi) queryParts.push(`wadmpr LIKE '%${provinsi}%'`);
  if (kota)
    queryParts.push(`wadmkk LIKE '%${kota.split(" ").slice(1).join(" ")}%'`);
  if (e.name === "Batas Kecamatan") {
    showLoading(loadingIndicator);
    kecamatanLayerGroup.clearLayers();

    const kecamatanLayer = esri.featureLayer({
      url: "https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/Administrasi_AR_Kecamatan_10K/MapServer/0",
    });

    kecamatanLayer
      .query()
      .where(queryParts.length ? queryParts.join(" AND ") : "1=1")
      .run((error, fc) => {
        hideLoading(loadingIndicator);
        if (error) return console.error(error);

        const layer = L.geoJSON(fc, {
          style: { color: "blue", weight: 1, fillOpacity: 0.3 },
          onEachFeature: (feature, layer) =>
            layer.bindPopup(feature.properties.NAMOBJ),
        });
        layer.addTo(kecamatanLayerGroup);
        map.fitBounds(layer.getBounds());
      });
  }
  if (e.name === "Batas Desa") {
    showLoading(loadingIndicator);
    desaLayerGroup.clearLayers();

    const desaLayer = esri.featureLayer({
      url: "https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/Administrasi_AR_KelDesa_10K/MapServer/0",
    });

    if (kecamatan) queryParts.push(`wadmkc LIKE '%${kecamatan}%'`);

    desaLayer
      .query()
      .where(queryParts.length ? queryParts.join(" AND ") : "1=1")
      .run((error, fc) => {
        hideLoading(loadingIndicator);
        if (error) return console.error(error);

        const layer = L.geoJSON(fc, {
          style: { color: "blue", weight: 1, fillOpacity: 0.3 },
          onEachFeature: (feature, layer) =>
            layer.bindPopup(feature.properties.NAMOBJ),
        });
        layer.addTo(desaLayerGroup);
        map.fitBounds(layer.getBounds());
      });
  }
});
