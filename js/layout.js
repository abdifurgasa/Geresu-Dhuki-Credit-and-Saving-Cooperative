document.addEventListener("DOMContentLoaded", async () => {

  /* =========================
     LOAD SIDEBAR FIRST
  ========================= */
  const response = await fetch("sidebar.html");
  const sidebarHTML = await response.text();

  document.body.insertAdjacentHTML("afterbegin", sidebarHTML);

  /* =========================
     WAIT FOR DOM UPDATE
  ========================= */
  setTimeout(() => {

    // initialize sidebar toggle AFTER load
    initSidebar();

    // APPLY LANGUAGE AFTER sidebar exists
    applyLanguage();

  }, 50);

});

/* =========================
   SIDEBAR TOGGLE
========================= */
function initSidebar() {

  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.querySelector(".toggle-btn");
  const overlay = document.querySelector(".overlay");

  if (!sidebar || !toggleBtn) return;

  toggleBtn.addEventListener("click", () => {

    if (window.innerWidth <= 768) {
      sidebar.classList.toggle("open");
      overlay?.classList.toggle("active");
    } else {
      sidebar.classList.toggle("collapsed");
    }

  });

  overlay?.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
  });

}

/* =========================
   MULTI LANGUAGE FIX
========================= */
function applyLanguage() {

  const lang = localStorage.getItem("lang") || "EN";

  document.querySelectorAll("[data-i18n]").forEach(el => {

    const key = el.getAttribute("data-i18n");

    const text = translations?.[lang]?.[key];

    if (text) {
      el.innerText = text;
    }

  });

}

/* expose globally */
window.applyLanguage = applyLanguage;
