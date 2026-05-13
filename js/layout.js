document.addEventListener("DOMContentLoaded", async () => {

  /* =========================
     LOAD SIDEBAR FIRST
  ========================= */
  const response = await fetch("sidebar.html");
  const sidebarHTML = await response.text();

  document.body.insertAdjacentHTML("afterbegin", sidebarHTML);

  /* =========================
     NOW ELEMENTS EXIST → SAFE TO USE
  ========================= */

  const sidebar = document.querySelector("#sidebar");
  const toggleBtn = document.querySelector(".toggle-btn");
  const overlay = document.querySelector(".overlay");

  /* =========================
     RESTORE STATE
  ========================= */
  const saved = localStorage.getItem("sidebar");

  if (saved === "collapsed" && window.innerWidth > 768) {
    sidebar.classList.add("collapsed");
  }

  /* =========================
     TOGGLE SIDEBAR
  ========================= */
  toggleBtn?.addEventListener("click", () => {

    if (window.innerWidth <= 768) {

      sidebar.classList.toggle("open");
      overlay?.classList.toggle("active");

    } else {

      sidebar.classList.toggle("collapsed");

      localStorage.setItem(
        "sidebar",
        sidebar.classList.contains("collapsed")
          ? "collapsed"
          : "expanded"
      );
    }

  });

  /* =========================
     OVERLAY CLOSE
  ========================= */
  overlay?.addEventListener("click", () => {

    sidebar.classList.remove("open");
    overlay.classList.remove("active");

  });

  /* =========================
     ACTIVE MENU FIX
  ========================= */
  const current = window.location.pathname.split("/").pop();

  document.querySelectorAll(".nav a").forEach(link => {

    const href = link.getAttribute("href");

    if (href === current) {
      link.classList.add("active");
    }

  });

});
