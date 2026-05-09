
export const ROLES = {
  ADMIN: "admin",
  TELLER: "teller",
  AUDITOR: "auditor"
};

/* =========================
   CURRENT USER
========================= */
export let currentUser = null;

/* =========================
   SET USER (after login)
========================= */
export function setUser(user) {

  currentUser = user;

  localStorage.setItem("user", JSON.stringify(user));
}

/* =========================
   GET USER
========================= */
export function getUser() {

  if (currentUser) return currentUser;

  return JSON.parse(localStorage.getItem("user"));
}

/* =========================
   PERMISSION CHECK
========================= */
export function can(action) {

  const user = getUser();

  if (!user) return false;

  if (user.role === ROLES.ADMIN) return true;

  if (user.role === ROLES.TELLER) {

    return ["savings", "loans", "transactions"].includes(action);
  }

  if (user.role === ROLES.AUDITOR) {

    return ["reports"].includes(action);
  }

  return false;
}
