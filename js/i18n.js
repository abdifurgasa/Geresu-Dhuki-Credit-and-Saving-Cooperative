import en from "../lang/en.js";
import am from "../lang/am.js";
import or from "../lang/or.js";

const languages = {
  EN: en,
  AM: am,
  OR: or
};

window.changeLang = function(lang){

  localStorage.setItem("lang", lang);

  applyLanguage(lang);
};

function applyLanguage(lang){

  const dict = languages[lang];

  document.querySelectorAll("[data-i18n]")
  .forEach(el => {

    const key = el.getAttribute("data-i18n");

    if(dict[key]){
      el.innerText = dict[key];
    }
  });
}

const savedLang = localStorage.getItem("lang") || "EN";

applyLanguage(savedLang);
