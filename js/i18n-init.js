import { resources } from "./i18n.js";

i18next
  .use(i18nextBrowserLanguageDetector)
  .init({
    resources,
    fallbackLng: "en",
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"]
    }
  });

function update() {
  document.querySelectorAll("[data-i18n]").forEach(e => {
    e.innerText = i18next.t(e.getAttribute("data-i18n"));
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(e => {
    e.placeholder = i18next.t(e.getAttribute("data-i18n-placeholder"));
  });
}

export function changeLang(l) {
  i18next.changeLanguage(l);
  update();
}

setTimeout(update, 200);

setTimeout(() => {
  const s = document.getElementById("langSelect");
  if (!s) return;

  s.value = i18next.language;

  s.addEventListener("change", e => changeLang(e.target.value));
}, 300);
