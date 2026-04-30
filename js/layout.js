const sidebar = document.querySelector(".sidebar");
const toggleBtn = document.querySelector(".toggle-btn");

// CREATE OVERLAY
const overlay = document.createElement("div");
overlay.classList.add("overlay");
document.body.appendChild(overlay);

/* LOAD STATE */
document.addEventListener("DOMContentLoaded", () => {

  const saved = localStorage.getItem("sidebar");

  if (window.innerWidth > 768) {
    if (saved === "collapsed") {
      sidebar.classList.add("collapsed");
    }
  }

});

/* TOGGLE */
toggleBtn.addEventListener("click", () => {

  if (window.innerWidth <= 768) {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("active");
  } else {
    sidebar.classList.toggle("collapsed");

    localStorage.setItem(
      "sidebar",
      sidebar.classList.contains("collapsed") ? "collapsed" : "expanded"
    );
  }

});

/* CLOSE ON OVERLAY CLICK */
overlay.addEventListener("click", () => {
  sidebar.classList.remove("open");
  overlay.classList.remove("active");
});
