
/* =========================
   LANGUAGE SYSTEM
========================= */
function setLang(lang) {
  localStorage.setItem("lang", lang);
  alert("Language set to " + lang);
}

/* =========================
   THEME SYSTEM
========================= */
function toggleTheme() {

  const current = localStorage.getItem("theme");

  if (current === "dark") {
    localStorage.setItem("theme", "light");
    document.body.classList.remove("dark");
  } else {
    localStorage.setItem("theme", "dark");
    document.body.classList.add("dark");
  }

}

/* =========================
   LOGOUT
========================= */
function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

/* =========================
   APPLY ON LOAD
========================= */
document.addEventListener("DOMContentLoaded", () => {

  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }

});
