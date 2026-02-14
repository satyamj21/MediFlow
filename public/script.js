// window.onload = function () {
//   window.scrollTo(0, 0);
// };

// let role = "";
// let mode = "login";

// function openAuth(type = "login") {
//   mode = type;

//   document.getElementById("roleStep").style.display = "block";
//   document.getElementById("authStep").style.display = "none";

//   document.getElementById("authModal").style.display = "flex";
// }

// function selectRole(selectedRole) {
//   role = selectedRole;

//   document.getElementById("roleStep").style.display = "none";
//   document.getElementById("authStep").style.display = "block";

//   updateMode();
// }

// function closeAuth() {
//   document.getElementById("authModal").style.display = "none";
// }

// function switchMode() {
//   mode = mode === "login" ? "signup" : "login";
//   updateMode();
// }

// function updateMode() {
//   const title = document.getElementById("authTitle");
//   const email = document.getElementById("emailField");
//   const switchText = document.getElementById("switchText");

//   if (mode === "login") {
//     title.innerText = "Login";
//     email.style.display = "none";
//     switchText.innerHTML = `New user? <span onclick="switchMode()">Sign up</span>`;
//   } else {
//     title.innerText = "Sign Up";
//     email.style.display = "block";
//     switchText.innerHTML = `Already a user? <span onclick="switchMode()">Login</span>`;
//   }
// }

// function togglePassword() {
//   const p = document.getElementById("password");
//   p.type = p.type === "password" ? "text" : "password";
// }

// function submitAuth() {
//   alert(`${mode === "login" ? "Logging in" : "Signing up"} as ${role}`);
// }

// updateMode();

// const nav = document.querySelector(".nav");

// window.addEventListener("scroll", () => {
//   if (window.scrollY > 40) nav.classList.add("scrolled");
//   else nav.classList.remove("scrolled");
// })

window.onload = function () {
  window.scrollTo(0, 0);
};

const nav = document.querySelector(".nav");

window.addEventListener("scroll", () => {
  if (window.scrollY > 40) nav.classList.add("scrolled");
  else nav.classList.remove("scrolled");
});
function togglePassword() {
  const field = document.getElementById("passwordField");
  field.type = field.type === "password" ? "text" : "password";
}
function selectRole(button, role) {
  document.querySelectorAll(".role-btn").forEach(btn =>
    btn.classList.remove("active")
  );

  button.classList.add("active");
  document.getElementById("roleField").value = role;
}