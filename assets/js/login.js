/* ============================================================
   login.js — handles sign-in on login.html via .NET Backend API.
   ============================================================ */

const LOGGED_IN_USER_KEY = "crs_current_user_id";
const LOGGED_IN_ADMIN_KEY = "crs_current_admin_id";

function showLoginError(message) {
  const el = document.getElementById("loginError");
  if (!el) return;
  el.textContent = message;
  el.classList.add("show");
}

function hideLoginError() {
  const el = document.getElementById("loginError");
  if (!el) return;
  el.classList.remove("show");
}

async function handleLogin(e) {
  e.preventDefault();
  hideLoginError();

  const identifier = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!identifier) return showLoginError("Please enter your username or email.");
  if (!password) return showLoginError("Please enter your password.");

  const btn = document.getElementById("loginSubmitBtn");
  btn.disabled = true;
  btn.textContent = "Signing in…";

  try {
    const response = await API.login(identifier, password);
    const user = response.user || response.User;

    if (user) {
      const role = user.role || user.Role;
      const userId = user.id || user.Id;

      if (role === "Admin") {
        localStorage.setItem(LOGGED_IN_ADMIN_KEY, String(userId));
        localStorage.setItem(LOGGED_IN_USER_KEY, String(userId));
        window.location.href = "admin.html";
      } else {
        localStorage.setItem(LOGGED_IN_USER_KEY, String(userId));
        window.location.href = "user.html";
      }
      return;
    }

    showLoginError("Incorrect username/email or password.");
    btn.disabled = false;
    btn.textContent = "Login";
  } catch (err) {
    console.error("Login failed:", err);
    showLoginError(err.message || "Something went wrong — please try again.");
    btn.disabled = false;
    btn.textContent = "Login";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (form) form.addEventListener("submit", handleLogin);
});
