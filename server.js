const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const USER_FILE = "./users.json";
const QR_FILE = "./qrcodes.json";

if (!fs.existsSync(USER_FILE)) fs.writeFileSync(USER_FILE, "[]");
if (!fs.existsSync(QR_FILE)) fs.writeFileSync(QR_FILE, "[]");

function getUsers() {
    return JSON.parse(fs.readFileSync(USER_FILE));
}

function saveUsers(data) {
    fs.writeFileSync(USER_FILE, JSON.stringify(data, null, 2));
}

/* =========================
   AUTO CREATE ADMIN
========================= */
function createAdmin() {
    let users = getUsers();

    let admin = users.find(u => u.username === "admin");

    if (!admin) {
        const hash = bcrypt.hashSync("admin123", 10);

        users.push({
            id: 1,
            username: "admin",
            password: hash,
            role: "admin"
        });

        saveUsers(users);

        console.log("✔ Admin created: admin / admin123");
    }
}

createAdmin();

/* =========================
   USER REGISTER
========================= */
app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    let users = getUsers();

    if (users.find(u => u.username === username)) {
        return res.json({ success: false, message: "User exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    users.push({
        id: Date.now(),
        username,
        password: hash,
        role: "user"
    });

    saveUsers(users);

    res.json({ success: true });
});

/* =========================
   USER LOGIN
========================= */
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    let users = getUsers();

    let user = users.find(u => u.username === username && u.role === "user");

    if (!user) {
        return res.json({ success: false, message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        return res.json({ success: false, message: "Wrong password" });
    }

    res.json({
        success: true,
        role: "user",
        user: { id: user.id, username: user.username }
    });
});

/* =========================
   ADMIN LOGIN (FIXED)
========================= */
app.post("/admin/login", async (req, res) => {
    const { username, password } = req.body;

    let users = getUsers();

    let admin = users.find(u => u.username === username && u.role === "admin");

    if (!admin) {
        return res.json({ success: false, message: "Admin not found" });
    }

    const match = await bcrypt.compare(password, admin.password);

    if (!match) {
        return res.json({ success: false, message: "Wrong password" });
    }

    res.json({
        success: true,
        role: "admin",
        user: { id: admin.id, username: admin.username }
    });
});

/* =========================
   START SERVER
========================= */
app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});