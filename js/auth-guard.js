const role = localStorage.getItem("role");

const adminOnly = document.querySelectorAll(".admin-only");

if(role !== "admin"){

  adminOnly.forEach(item => {
    item.style.display = "none";
  });
}
