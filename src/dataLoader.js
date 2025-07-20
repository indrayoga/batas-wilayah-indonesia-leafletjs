// dataLoader.js
import { createOption } from "./utils.js";

export async function loadProvinsi(selectElement) {
  const res = await fetch("/data/provinsi.json");
  const data = await res.json();
  data.forEach((p) =>
    selectElement.appendChild(createOption(p.kode_provinsi, p.nama_provinsi))
  );
}

export async function cariKota(kodeProvinsi, selectElement) {
  const data = await (await fetch("/data/kabupaten.json")).json();
  const kota = data.filter((k) => k.kode_provinsi == kodeProvinsi);
  selectElement.innerHTML = "<option value>Pilih Kabupaten/Kota</option>";
  kota.forEach((k) =>
    selectElement.appendChild(createOption(k.kode_kabupaten, k.nama_kabupaten))
  );
}

export async function cariKecamatan(kodeKota, selectElement) {
  const data = await (await fetch("/data/kecamatan.json")).json();
  const kecamatan = data.filter((k) => k.kode_kabupaten == kodeKota);
  selectElement.innerHTML = "<option value>Pilih Kecamatan</option>";
  kecamatan.forEach((k) =>
    selectElement.appendChild(createOption(k.kode_kecamatan, k.nama_kecamatan))
  );
}

export async function cariDesa(kodeKecamatan, selectElement) {
  const data = await (await fetch("/data/desa.json")).json();
  const desa = data.filter((d) => d.kode_kecamatan == kodeKecamatan);
  selectElement.innerHTML = "<option value>Pilih Desa/Kelurahan</option>";
  desa.forEach((k) =>
    selectElement.appendChild(createOption(k.kode_desa, k.nama_desa))
  );
}
