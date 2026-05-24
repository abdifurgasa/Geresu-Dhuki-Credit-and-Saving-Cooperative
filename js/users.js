import {
  createUserAccount,
  loadUsers,
  deleteUserAccount,
  toggleUserStatus
} from "./usersModule.js";

import { authGuard, logoutUser } from "./auth.js";
import { checkRole } from "./roles.js";

window.toggleSidebar = function () {

  document.getElementById("sidebar")
    .classList.toggle("collapsed");

  document.getElementById("main")
    .classList.toggle("expanded");
};

const form = document.getElementById("userForm");
const logoutBtn = document.getElementById("logoutBtn");

initializePage();

async function initializePage() {

  await authGuard();

  await checkRole();

  loadUsers();
}

form.addEventListener("submit", async (e) => {

  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const role = document.getElementById("role").value;

  await createUserAccount(name, email, password, role);

  form.reset();
});

logoutBtn.addEventListener("click", logoutUser);

window.deleteUserAccount = deleteUserAccount;
window.toggleUserStatus = toggleUserStatus;
