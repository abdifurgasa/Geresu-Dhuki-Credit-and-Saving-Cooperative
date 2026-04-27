const translations = {
 en:{
  dashboard:"Dashboard",
  members:"Members",
  savings:"Savings",
  loans:"Loans",
  reports:"Reports",
  settings:"Settings"
 },
 am:{
  dashboard:"ዳሽቦርድ",
  members:"አባላት",
  savings:"ቁጠባ",
  loans:"ብድር",
  reports:"ሪፖርት",
  settings:"ቅንብሮች"
 },
 om:{
  dashboard:"Daashboordii",
  members:"Miseensota",
  savings:"Qusannaa",
  loans:"Liqii",
  reports:"Ripoortii",
  settings:"Sirna"
 }
};

function applyLang(lang){
 document.querySelectorAll("[data-i18n]").forEach(el=>{
  let key = el.getAttribute("data-i18n");
  if(translations[lang] && translations[lang][key]){
    el.innerText = translations[lang][key];
  }
 });
}

document.getElementById("langSelect").addEventListener("change",(e)=>{
 applyLang(e.target.value);
});

applyLang("en");
