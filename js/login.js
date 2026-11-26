/* VYBE 2026 - DEMO ADMIN LOGIN */

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const loginMessage = document.getElementById("loginMessage");
const loginButton = document.getElementById("loginButton");

/* Demo credentials - frontend demonstration only */
const DEMO_EMAIL = "admin@vybe2026.com";
const DEMO_PASSWORD = "VybeAdmin2026";

togglePassword.addEventListener("click", function () {
    const isPassword = passwordInput.type === "password";

    passwordInput.type = isPassword ? "text" : "password";
    togglePassword.textContent = isPassword ? "Hide" : "Show";
});

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    loginMessage.className = "login-message";
    loginMessage.textContent = "";

    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        loginMessage.textContent = "Login successful! Opening dashboard...";
        loginMessage.classList.add("success");

        loginButton.disabled = true;

        sessionStorage.setItem("vybeDemoLoggedIn", "true");

        setTimeout(function () {
            window.location.href = "dashboard.html";
        }, 700);

    } else {
        loginMessage.textContent = "Invalid email or password. Please try again.";
        passwordInput.value = "";
        passwordInput.focus();
    }
});
