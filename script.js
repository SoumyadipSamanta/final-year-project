const API = "http://localhost:5000";

/* =========================
   USER INFO
========================= */
const userId = localStorage.getItem("userId");
const role = localStorage.getItem("role");

/* =========================
   LOGIN GUARD
========================= */
if (!userId || (role !== "user" && role !== "admin")) {
    alert("This account is not a valid user. Please login again.");
    localStorage.clear();
    window.location.href = "login.html";
}

/* =========================
   SHOW SECTIONS
========================= */
function showSection(id) {
    document.querySelectorAll(".section").forEach(section => {
        section.classList.remove("active");
    });

    document.getElementById(id).classList.add("active");

    if (id === "history") loadHistory();
    if (id === "total") loadCount();
}

/* =========================
   SIDEBAR
========================= */
function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("show");
}

/* =========================
   CHANGE TYPE
========================= */
function changeType() {
    document.getElementById("qrInput").value = "";
}

/* =========================
   GENERATE QR
========================= */
async function generateQR() {
    const type = document.getElementById("qrType").value;
    const data = document.getElementById("qrInput").value.trim();

    if (!data) return alert("Enter value first.");
    if (!userId) return alert("Login required.");

    try {
        const response = await fetch(API + "/create-qr", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                type,
                data,
                userId: Number(userId)
            })
        });

        const result = await response.json();

        if (result.success) {
            document.getElementById("qrResult").innerHTML = `
                <img src="${result.qr}" width="200">
            `;
            document.getElementById("qrInput").value = "";

            loadCount();
            loadHistory();
        } else {
            alert(result.message || "QR creation failed");
        }
    } catch (err) {
        alert("Server connection failed.");
    }
}

/* =========================
   LOAD COUNT
========================= */
async function loadCount() {
    if (!userId) return;

    try {
        const response = await fetch(API + "/qr-count/" + userId);
        const data = await response.json();

        document.getElementById("totalCount").innerHTML =
            (data.total || 0) + " QR Generated";
    } catch (err) {
        console.error(err);
    }
}

/* =========================
   LOAD HISTORY (GROUPED + VIEW FIXED)
========================= */
async function loadHistory() {
    if (!userId) return;

    try {
        const response = await fetch(API + "/qr-list/" + userId);
        const list = await response.json();

        const historyList = document.getElementById("historyList");
        historyList.innerHTML = "";

        if (!list || list.length === 0) {
            historyList.innerHTML = "<li>No QR Codes Found</li>";
            return;
        }

        // GROUP BY TYPE
        const grouped = {};
        list.forEach(item => {
            if (!grouped[item.type]) grouped[item.type] = [];
            grouped[item.type].push(item);
        });

        Object.keys(grouped).forEach(type => {
            historyList.innerHTML += `
                <li style="background:#222;color:#fff;padding:10px;margin-top:10px;border-radius:10px;">
                    <h3>📁 ${type.toUpperCase()}</h3>
                </li>
            `;

            grouped[type].reverse().forEach(item => {
                historyList.innerHTML += `
                    <li style="margin-left:20px;">
                        <div class="history-text">
                            ${item.data}
                            <br><br>
                            <img src="${item.qr}" width="120">
                        </div>
                        <button class="view-btn"
                            onclick='viewQR(${JSON.stringify(item).replace(/'/g, "&apos;")})'>
                            View
                        </button>
                        <button class="delete-btn"
                            onclick="deleteQR(${item.id})">
                            Delete
                        </button>
                    </li>
                `;
            });
        });
    } catch (err) {
        console.log(err);
    }
}

/* =========================
   VIEW QR POPUP
========================= */
function viewQR(item) {
    const modal = document.createElement("div");

    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.background = "rgba(0,0,0,0.8)";
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.style.zIndex = "9999";

    modal.innerHTML = `
        <div style="
            background:white;
            padding:20px;
            border-radius:10px;
            width:300px;
            text-align:center;
        ">
            <h2>QR Details</h2>
            <p><b>Type:</b> ${item.type.toUpperCase()}</p>
            <p><b>Data:</b> ${item.data}</p>
            <img src="${item.qr}" width="200" style="margin:10px 0;">
            <br>
            <button onclick="this.parentElement.parentElement.remove()"
                style="padding:8px 12px;background:red;color:white;border:none;border-radius:5px;">
                Close
            </button>
        </div>
    `;

    document.body.appendChild(modal);
}

/* =========================
   DELETE QR
========================= */
async function deleteQR(id) {
    if (!confirm("Delete this QR Code?")) return;

    try {
        const response = await fetch(`${API}/qr-delete/${id}/${userId}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (result.success) {
            loadHistory();
            loadCount();
            document.getElementById("qrResult").innerHTML = "";
        } else {
            alert(result.message || "Delete failed");
        }
    } catch (err) {
        alert("Server connection failed.");
    }
}

/* =========================
   CLEAR ALL
========================= */
async function clearAll() {
    if (!confirm("Delete all your QR Codes?")) return;

    try {
        const response = await fetch(API + "/qr-delete-all/" + userId, {
            method: "DELETE"
        });

        const result = await response.json();

        if (result.success) {
            document.getElementById("qrResult").innerHTML = "";
            loadCount();
            loadHistory();
            alert("All QR Codes Deleted.");
        }
    } catch (err) {
        alert("Server connection failed.");
    }
}

/* ================= LOGOUT ================= */
function logout() {
    const confirmLogout = confirm("Are you sure you want to logout?");
    if(confirmLogout){
        localStorage.clear();
        window.location.replace("login.html");
    }
}

/* =========================
   INIT
========================= */
window.onload = function () {
    if (userId) {
        loadCount();
        loadHistory();
    }
    
    let username = localStorage.getItem("username");
    if(username){
        const welcomeElem = document.getElementById("welcomeUser");
        if(welcomeElem) {
            welcomeElem.innerHTML = "Welcome " + username;
        }
    }
};