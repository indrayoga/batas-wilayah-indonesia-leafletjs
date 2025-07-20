import "./style.css";
import L from "leaflet";
import * as esri from "esri-leaflet";
import "leaflet/dist/leaflet.css";

const selectProvinsi = document.getElementById("provinsi");
const selectKota = document.getElementById("kota");
const selectKecamatan = document.getElementById("kecamatan");
const selectDesa = document.getElementById("desa");
const loadingIndicator = document.getElementById("loading-indicator");
const map = L.map("map").setView([-1.5, 117], 5);
let provinsi = null;
let kota = null;
let kecamatan = null;
let selectedKotaLayer = null;
let selectedProvinsiLayer = null;
let selectedKecamatanLayer = null;
let selectedDesaLayer = null;

let kabupatenLayer = esri.featureLayer({
  url: "https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/BATAS_WILAYAH/MapServer/12",
  layers: [12],
  // url: "https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/BATAS_WILAYAH/MapServer/13",
  // layers: [13],
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

const kecamatanLayer = esri.featureLayer({
  url: "https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/Administrasi_AR_Kecamatan_10K/MapServer/0",
});

const desaLayer = esri.featureLayer({
  url: "https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/Administrasi_AR_KelDesa_10K/MapServer/0",
});

[kabupatenLayer, kecamatanLayer, desaLayer].forEach((layer) => {
  layer.on("loading", function () {
    loadingIndicator.classList.remove("hidden");
  });

  layer.on("load", function () {
    loadingIndicator.classList.remove("remove");
  });
});

document.addEventListener("DOMContentLoaded", () => {
  fetch("/data/provinsi.json", {
    headers: {
      "Accept-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const select = document.getElementById("provinsi");
      data.forEach((provinsi) => {
        const option = document.createElement("option");
        option.value = provinsi.kode_provinsi;
        option.textContent = provinsi.nama_provinsi;
        select.appendChild(option);
      });
    })
    .catch((error) => console.error("Error fetching data:", error));

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);
});

async function cariKota(provinsi) {
  fetch("/data/kabupaten.json")
    .then((response) => response.json())
    .then((data) => {
      return data.filter((kota) => kota.kode_provinsi == provinsi);
    })
    .then((kota) => {
      selectKota.innerHTML = "<option value>Pilih Kabupaten/Kota</option>";
      kota.forEach((k) => {
        const option = document.createElement("option");
        option.value = k.kode_kabupaten;
        option.textContent = k.nama_kabupaten;
        selectKota.appendChild(option);
      });
    });
}

async function cariKecamatan(kota) {
  fetch("/data/kecamatan.json")
    .then((response) => response.json())
    .then((data) => {
      return data.filter((kecamatan) => kecamatan.kode_kabupaten == kota);
    })
    .then((kecamatan) => {
      selectKecamatan.innerHTML = "<option value>Pilih Kecamatan</option>";
      kecamatan.forEach((k) => {
        const option = document.createElement("option");
        option.value = k.kode_kecamatan;
        option.textContent = k.nama_kecamatan;
        selectKecamatan.appendChild(option);
      });
    });
}

async function cariDesa(kecamatan) {
  fetch("/data/desa.json")
    .then((response) => response.json())
    .then((data) => {
      return data.filter((desa) => desa.kode_kecamatan == kecamatan);
    })
    .then((desa) => {
      selectDesa.innerHTML = "<option value>Pilih Desa/Kelurahan</option>";
      desa.forEach((k) => {
        const option = document.createElement("option");
        option.value = k.kode_desa;
        option.textContent = k.nama_desa;
        selectDesa.appendChild(option);
      });
    });
}

selectProvinsi.addEventListener("change", function () {
  const kode_provinsi = this.value;
  provinsi = this.options[this.selectedIndex].text;
  cariKota(kode_provinsi);
  loadingIndicator.classList.remove("hidden");

  if (!provinsi) {
    alert("Pilih Provinsi terlebih dahulu.");
    return;
  }

  selectedProvinsiLayer = esri.featureLayer({
    url: "https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/BATAS_WILAYAH/MapServer/12",
  });

  selectedProvinsiLayer
    .query()
    .where(`wadmpr LIKE '%${provinsi}%'`)
    .run(function (error, featureCollection) {
      loadingIndicator.classList.add("hidden");
      if (error) {
        console.error(error);
        return;
      }

      if (selectedProvinsiLayer) {
        map.removeLayer(selectedProvinsiLayer);
      }

      const newLayer = L.geoJSON(featureCollection, {
        style: {
          color: "red",
          weight: 1,
          fillOpacity: 0.3,
        },
        onEachFeature: function (feature, layer) {
          layer.bindPopup(feature.properties.namobj);
        },
      });

      newLayer.addTo(map);
      // Fit bounds setelah layer dibuat
      map.fitBounds(newLayer.getBounds());
    });
});

selectKota.addEventListener("change", function () {
  const kode_kota = this.value;
  kota = this.options[this.selectedIndex].text;
  cariKecamatan(kode_kota);

  loadingIndicator.classList.remove("hidden");

  if (!kota) {
    alert("Pilih kota terlebih dahulu.");
    return;
  }

  selectedKotaLayer = esri.featureLayer({
    url: "https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/BATAS_WILAYAH/MapServer/13",
  });
  // Query berdasarkan nama kota
  selectedKotaLayer
    .query()
    .where(
      `wadmpr LIKE '%${provinsi}%' and wadmkk LIKE '%${kota
        .split(" ")
        .slice(1)
        .join(" ")}%'`
    )
    .run(function (error, featureCollection) {
      loadingIndicator.classList.add("hidden");
      if (error) {
        console.error(error);
        return;
      }

      if (selectedKotaLayer) {
        map.removeLayer(selectedKotaLayer);
      }

      const newLayer = L.geoJSON(featureCollection, {
        style: {
          color: "yellow",
          weight: 1,
          fillOpacity: 0.3,
        },
        onEachFeature: function (feature, layer) {
          layer.bindPopup(feature.properties.namobj);
        },
      });

      newLayer.addTo(map);
      // Fit bounds setelah layer dibuat
      map.fitBounds(newLayer.getBounds());
    });
});

selectKecamatan.addEventListener("change", function () {
  const kode_kecamatan = this.value;
  kecamatan = this.options[this.selectedIndex].text;
  cariDesa(kode_kecamatan);

  loadingIndicator.classList.remove("hidden");

  selectedKecamatanLayer = esri.featureLayer({
    url: "https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/Administrasi_AR_Kecamatan_10K/MapServer/0",
  });
  // Query berdasarkan nama Kecamatan
  selectedKecamatanLayer
    .query()
    .where(
      `wadmpr LIKE '%${provinsi}%' and wadmkk LIKE '%${kota
        .split(" ")
        .slice(1)
        .join(" ")}%' and wadmkc LIKE '${kecamatan}%'`
    )
    .run(function (error, featureCollection) {
      loadingIndicator.classList.add("hidden");
      if (error) {
        console.error(error);
        return;
      }

      if (selectedKecamatanLayer) {
        map.removeLayer(selectedKecamatanLayer);
      }

      const newLayer = L.geoJSON(featureCollection, {
        style: {
          color: "blue",
          weight: 1,
          fillOpacity: 0.3,
        },
        onEachFeature: function (feature, layer) {
          layer.bindPopup(feature.properties.namobj);
        },
      });

      newLayer.addTo(map);
      // Fit bounds setelah layer dibuat
      map.fitBounds(newLayer.getBounds());
    });
});

selectDesa.addEventListener("change", function () {
  const desa = this.options[this.selectedIndex].text;

  loadingIndicator.classList.remove("hidden");

  selectedDesaLayer = esri.featureLayer({
    url: "https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/Administrasi_AR_KelDesa_10K/MapServer/0",
  });
  // Query berdasarkan nama Desa
  selectedDesaLayer
    .query()
    .where(
      `wadmpr LIKE '%${provinsi}%' and wadmkk LIKE '%${kota
        .split(" ")
        .slice(1)
        .join(
          " "
        )}%' and wadmkc LIKE '${kecamatan}%' and wadmkd LIKE '%${desa}%'`
    )
    .run(function (error, featureCollection) {
      loadingIndicator.classList.add("hidden");
      if (error) {
        console.error(error);
        return;
      }

      if (selectedDesaLayer) {
        map.removeLayer(selectedDesaLayer);
      }

      const newLayer = L.geoJSON(featureCollection, {
        style: {
          color: "green",
          weight: 1,
          fillOpacity: 0.3,
        },
        onEachFeature: function (feature, layer) {
          layer.bindPopup(feature.properties.namobj);
        },
      });

      newLayer.addTo(map);
      // Fit bounds setelah layer dibuat
      map.fitBounds(newLayer.getBounds());
    });
});

const kecamatanLayerGroup = L.layerGroup();
const desaLayerGroup = L.layerGroup();
L.control
  .layers(
    null,
    {
      // "Batas Provinsi": provinsiLayer.addTo(map),
      "Batas Kabupaten/Kota": kabupatenLayer,
      "Batas Kecamatan": kecamatanLayerGroup,
      "Batas Desa": desaLayerGroup,
    },
    {
      collapsed: false, // tampilkan langsung
    }
  )
  .addTo(map);

map.on("overlayadd", function (e) {
  if (e.name === "Batas Kecamatan") {
    loadingIndicator.classList.remove("hidden");

    kecamatanLayerGroup.clearLayers();
    let query = [];
    if (provinsi) {
      query.push(`wadmpr LIKE '%${provinsi}%' `);
    }
    if (kota) {
      query.push(` wadmkk LIKE '%${kota.split(" ").slice(1).join(" ")}%' `);
    }
    kecamatanLayer
      .query()
      .where(
        query ? query.join(" and ").trim() : "1=1" // jika tidak ada filter, ambil semua
      )
      .run(function (error, featureCollection) {
        loadingIndicator.classList.add("hidden");
        if (error) {
          console.error(error);
          return;
        }

        const newLayer = L.geoJSON(featureCollection, {
          style: {
            color: "blue",
            weight: 1,
            fillOpacity: 0.3,
          },
          onEachFeature: function (feature, layer) {
            layer.bindPopup(feature.properties.namobj);
          },
        });

        newLayer.addTo(kecamatanLayerGroup);
        // Fit bounds setelah layer dibuat
        map.fitBounds(newLayer.getBounds());
      });
  }

  if (e.name === "Batas Desa") {
    loadingIndicator.classList.remove("hidden");
    desaLayerGroup.clearLayers();
    let query = [];
    if (provinsi) {
      query.push(`wadmpr LIKE '%${provinsi}%' `);
    }
    if (kota) {
      query.push(` wadmkk LIKE '%${kota.split(" ").slice(1).join(" ")}%' `);
    }
    if (kecamatan) {
      query.push(` wadmkc LIKE '%${kecamatan}%' `);
    }
    desaLayer
      .query()
      .where(
        query ? query.join(" and ").trim() : "1=1" // jika tidak ada filter, ambil semua
      )
      .run(function (error, featureCollection) {
        loadingIndicator.classList.add("hidden");
        if (error) {
          console.error(error);
          return;
        }

        const newLayer = L.geoJSON(featureCollection, {
          style: {
            color: "blue",
            weight: 1,
            fillOpacity: 0.3,
          },
          onEachFeature: function (feature, layer) {
            console.log(feature);
            layer.bindPopup(feature.properties.NAMOBJ);
          },
        });

        newLayer.addTo(desaLayerGroup);
        // Fit bounds setelah layer dibuat
        map.fitBounds(newLayer.getBounds());
      });
  }
});
