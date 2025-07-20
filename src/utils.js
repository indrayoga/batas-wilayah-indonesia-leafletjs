// utils.js
export function createOption(value, text) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = text;
  return option;
}

export function showLoading(el) {
  el.classList.remove("hidden");
}

export function hideLoading(el) {
  el.classList.add("hidden");
}
