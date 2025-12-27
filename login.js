/* login.js */
const API_URL = "http://localhost:3000/api";

// 1. SWITCH TABS (Sign Up <-> Log In)
function switchTab(tab) {
    const signupForm = document.getElementById("signup-form");
    const loginForm = document.getElementById("login-form");
    const btnSignup = document.getElementById("btn-signup");
    const btnLogin = document.getElementById("btn-login");
    const title = document.getElementById("formTitle");
    const subtitle = document.getElementById("formSubtitle");

    if (tab === 'signup') {
        signupForm.style.display = "block";
        loginForm.style.display = "none";
        btnSignup.classList.add("active");
        btnLogin.classList.remove("active");
        title.innerText = "Get Started";
        subtitle.innerText = "Create an account to manage maintenance";
    } else {
        signupForm.style.display = "none";
        loginForm.style.display = "block";
        btnSignup.classList.remove("active");
        btnLogin.classList.add("active");
        title.innerText = "Welcome Back";
        subtitle.innerText = "Enter your credentials to access the dashboard";
    }
}

// 2. SIGN UP FUNCTION (Simplified)
async function signup() {
    const name = document.getElementById("signupName").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    // Removed teamId

    if (!name || !email || !password) {
        alert("Please fill in all fields.");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }) // No team sent
        });
        
        const data = await res.json();
        
        if (data.success) {
            alert("Account created successfully! Please Log In.");
            switchTab('login'); 
        } else {
            alert("Error: " + data.message);
        }
    } catch (err) {
        console.error(err);
        alert("Server error during signup.");
    }
}

// 3. LOGIN FUNCTION
async function login() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        alert("Please enter email and password.");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        
        if (data.success) {
            localStorage.setItem("currentUser", JSON.stringify(data.user));
            window.location.href = "index.html";
        } else {
            alert("Login Failed: " + data.message);
        }
    } catch (err) {
        console.error(err);
        alert("Server connection failed.");
    }
}