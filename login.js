const API = "http://localhost:5000";

/* ===========================
   INIT
=========================== */

// DO NOT auto-clear session on refresh (this breaks dashboard login)
window.onload = function () {
    showUser();
};

/* ===========================
   TAB SWITCH
=========================== */

function showUser() {
    document.getElementById("userLogin").classList.remove("hidden");
    document.getElementById("adminLogin").classList.add("hidden");
    document.getElementById("registerBox").classList.add("hidden");

    document.getElementById("userTab").classList.add("active");
    document.getElementById("adminTab").classList.remove("active");
}

function showAdmin() {
    document.getElementById("userLogin").classList.add("hidden");
    document.getElementById("adminLogin").classList.remove("hidden");
    document.getElementById("registerBox").classList.add("hidden");

    document.getElementById("adminTab").classList.add("active");
    document.getElementById("userTab").classList.remove("active");
}

function showRegister() {
    document.getElementById("userLogin").classList.add("hidden");
    document.getElementById("adminLogin").classList.add("hidden");
    document.getElementById("registerBox").classList.remove("hidden");
}

function backLogin() {
    showUser();
}

/* ===========================
   USER LOGIN
=========================== */

async function userLogin() {

    const username = document.getElementById("userName").value.trim();
    const password = document.getElementById("userPass").value.trim();
    const msg = document.getElementById("userMsg");

    msg.innerHTML = "";

    if (!username || !password) {
        msg.innerHTML = "<p class='error'>Please fill all fields</p>";
        return;
    }

    try {
        const res = await fetch(`${API}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (!data.success || data.role !== "user") {
            msg.innerHTML = "<p class='error'>Invalid user login</p>";
            return;
        }

        // session storage
        sessionStorage.setItem("userId", data.user.id);
        sessionStorage.setItem("username", data.user.username);
        sessionStorage.setItem("role", "user");

        msg.innerHTML = "<p class='success'>Login successful</p>";

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 800);

    } catch (err) {
        msg.innerHTML = "<p class='error'>Server not running</p>";
    }
}

/* ===========================
   ADMIN LOGIN (FIXED)
=========================== */

async function adminLogin() {

    const username = document.getElementById("adminName").value.trim();
    const password = document.getElementById("adminPass").value.trim();
    const msg = document.getElementById("adminMsg");

    msg.innerHTML = "";

    if (!username || !password) {
        msg.innerHTML = "<p class='error'>Please fill all fields</p>";
        return;
    }

    try {
        // IMPORTANT: use admin login endpoint
        const res = await fetch(`${API}/admin/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (!data.success) {
            msg.innerHTML = "<p class='error'>" + data.message + "</p>";
            return;
        }

        // FORCE ADMIN ROLE (safe)
        sessionStorage.setItem("userId", data.user.id);
        sessionStorage.setItem("username", data.user.username);
        sessionStorage.setItem("role", "admin");

        msg.innerHTML = "<p class='success'>Admin login successful</p>";

        setTimeout(() => {
            window.location.href = "admin.html";
        }, 800);

    } catch (err) {
        msg.innerHTML = "<p class='error'>Server not running</p>";
    }
}

/* ===========================
   REGISTER USER
=========================== */

async function register() {

    const username = document.getElementById("regUser").value.trim();
    const password = document.getElementById("regPass").value.trim();
    const confirm = document.getElementById("regConfirm").value.trim();
    const msg = document.getElementById("regMsg");

    msg.innerHTML = "";

    if (!username || !password || !confirm) {
        msg.innerHTML = "<p class='error'>All fields required</p>";
        return;
    }

    if (password !== confirm) {
        msg.innerHTML = "<p class='error'>Passwords do not match</p>";
        return;
    }

    try {
        const res = await fetch(`${API}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (!data.success) {
            msg.innerHTML = "<p class='error'>" + data.message + "</p>";
            return;
        }

        msg.innerHTML = "<p class='success'>Account created</p>";

        document.getElementById("regUser").value = "";
        document.getElementById("regPass").value = "";
        document.getElementById("regConfirm").value = "";

        setTimeout(() => {
            backLogin();
        }, 1000);

    } catch (err) {
        msg.innerHTML = "<p class='error'>Server error</p>";
    }
}