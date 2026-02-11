let mode = "login";

function openAuth(type = "login") {
  mode = type;
  updateMode();
  document.getElementById("authModal").style.display = "flex";
}

function closeAuth() {
  document.getElementById("authModal").style.display = "none";
}

function switchMode() {
  mode = mode === "login" ? "signup" : "login";
  updateMode();
}

function updateMode() {
  const title = document.getElementById("authTitle");
  const email = document.getElementById("emailField");
  const switchText = document.getElementById("switchText");

  if (mode === "login") {
    title.innerText = "Login";
    email.style.display = "none";
    switchText.innerHTML = `New user? <span onclick="switchMode()">Sign up</span>`;
  } else {
    title.innerText = "Sign Up";
    email.style.display = "block";
    switchText.innerHTML = `Already a user? <span onclick="switchMode()">Login</span>`;
  }
}

function togglePassword() {
  const p = document.getElementById("password");
  p.type = p.type === "password" ? "text" : "password";
}

function submitAuth() {
  alert(mode === "login" ? "Logging in..." : "Signing up...");
}

updateMode();

const nav = document.querySelector(".nav");

window.addEventListener("scroll", () => {
  if (window.scrollY > 40) nav.classList.add("scrolled");
  else nav.classList.remove("scrolled");
});
