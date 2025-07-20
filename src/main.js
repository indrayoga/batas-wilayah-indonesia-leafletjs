import "./style.css";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

const map = L.map("map").setView([-1.5, 117], 5);
const selectProvinsi = document.getElementById("provinsi");
const selectKota = document.getElementById("kota");
const selectKecamatan = document.getElementById("kecamatan");
const selectDesa = document.getElementById("desa");

async function cariLokasi(nama, map, zoom = 8) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    nama + ", Indonesia"
  )}`;
  const res = await fetch(url);
  const data = await res.json();

  //maksimal 1 request per detik (atau akan di blok IP kalau berlebihan)
  setTimeout(() => {
    console.log("delay");
  }, 1000);

  if (data.length > 0) {
    const lat = parseFloat(data[0].lat);
    const lon = parseFloat(data[0].lon);
    map.setView([lat, lon], zoom);
  } else {
    alert("Lokasi tidak ditemukan.");
  }
}

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
    .catch((error) => console.error("Error fetching countries:", error));

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);
});

selectProvinsi.addEventListener("change", function () {
  const kode_provinsi = this.value;
  const provinsi = this.options[this.selectedIndex].text;
  cariKota(kode_provinsi);
  cariLokasi(provinsi, map);
});

selectKota.addEventListener("change", function () {
  const kode_kota = this.value;
  const kota = this.options[this.selectedIndex].text;
  const nama_provinsi =
    selectProvinsi.options[selectProvinsi.selectedIndex].text;
  cariKecamatan(kode_kota);
  cariLokasi(kota + ", " + nama_provinsi, map, 13);
});

selectKecamatan.addEventListener("change", function () {
  const kode_kecamatan = this.value;
  const kecamatan = this.options[this.selectedIndex].text;
  const nama_kota = selectKota.options[selectKota.selectedIndex].text;
  cariDesa(kode_kecamatan);
  cariLokasi(kecamatan + ", " + nama_kota, map, 15);
});

document.getElementById("desa").addEventListener("change", function () {
  const desa = this.options[this.selectedIndex].text;
  const nama_kecamatan =
    selectKecamatan.options[selectKecamatan.selectedIndex].text;
  cariLokasi(desa + ", " + nama_kecamatan, map, 16);
});
