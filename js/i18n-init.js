import { resources } from "./i18n.js";

const langSelect = document.getElementById("langSelect");

// Load saved language
let currentLang = localStorage.getItem("lang") || "en";
if (langSelect) langSelect.value = currentLang;

applyTranslations(currentLang);

// Change language
langSelect?.addEventListener("change", (e) => {
  currentLang = e.target.value;
  localStorage.setItem("lang", currentLang);
  applyTranslations(currentLang);
});

// Translate function
function t(key) {
  return resources[currentLang]?.translation[key] || key;
}

// Apply translations to UI
function applyTranslations(lang) {
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    el.innerText = resources[lang]?.translation[key] || key;
  });
}
