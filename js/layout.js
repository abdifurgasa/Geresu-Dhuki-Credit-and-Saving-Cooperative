let timeout;
const TIME_LIMIT = 5 * 60 * 1000;

function resetTimer() {
  clearTimeout(timeout);

  timeout = setTimeout(async () => {

    alert("Session expired. You will be logged out.");

    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
    } catch (e) {
      console.error(e);
    }

    localStorage.clear();

    window.location.href =
      "/Geresu-Dhuki-Credit-and-Saving-Cooperative/index.html";

  }, TIME_LIMIT);
}
