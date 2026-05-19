const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const admin = require("firebase-admin");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   FIREBASE SETUP
========================= */

let serviceAccount;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    serviceAccount = require("./serviceAccountKey.json");
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  console.log("Firebase connected for Post91 Accounts");
} catch (error) {
  console.error("Firebase initialization error:", error.message);
}

const db = admin.apps.length ? admin.firestore() : null;

/* =========================
   MIDDLEWARE
========================= */

app.use(express.static(path.join(__dirname, "public")));

/* =========================
   PAGE ROUTES
========================= */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

app.get("/admin-post91.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin-post91.html"));
});

/* =========================
   POST91 REGISTRATION API
========================= */

app.post("/api/post91/register", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({
        success: false,
        message: "Database not connected",
      });
    }

    const {
      businessName,
      ownerName,
      mobile,
      whatsapp,
      email,
      vatNumber,
      address,
      password,
      selectedPlan,
      monthlyPrice,
      vatAmount,
      totalAmount,
    } = req.body;

    if (!businessName || !ownerName || !mobile || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existing = await db
      .collection("post91Users")
      .where("email", "==", cleanEmail)
      .limit(1)
      .get();

    if (!existing.empty) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered",
      });
    }

    const requestNo = "P91-REQ-" + Date.now();

    const userData = {
      requestNo,
      businessName,
      ownerName,
      mobile,
      whatsapp: whatsapp || "",
      email: cleanEmail,
      vatNumber: vatNumber || "",
      address: address || "",
      password,

      selectedPlan,
      monthlyPrice: Number(monthlyPrice || 0),
      vatAmount: Number(vatAmount || 0),
      totalAmount: Number(totalAmount || 0),

      registrationStatus: "pending",
      accountActive: false,
      paymentStatus: "pending",

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.collection("post91Users").doc(cleanEmail).set(userData);
    await db.collection("post91RegistrationRequests").doc(cleanEmail).set(userData);

    res.json({
      success: true,
      message: "Registration request submitted",
      requestNo,
    });

  } catch (error) {
    console.error("Post91 register error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
});

/* =========================
   POST91 LOGIN API
========================= */

app.post("/api/post91/login", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({
        success: false,
        message: "Database not connected",
      });
    }

    const { email, password } = req.body;

    const cleanEmail = (email || "").toLowerCase().trim();

    const doc = await db.collection("post91Users").doc(cleanEmail).get();

    if (!doc.exists) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = doc.data();

    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.accountActive) {
      return res.status(403).json({
        success: false,
        message: "Login not active. Your registration is pending Vehicall Admin approval.",
        user,
      });
    }

    res.json({
      success: true,
      message: "Login successful",
      user,
    });

  } catch (error) {
    console.error("Post91 login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
});

/* =========================
   ADMIN API
========================= */

app.get("/api/post91/requests", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({
        success: false,
        message: "Database not connected",
      });
    }

    const snap = await db
      .collection("post91RegistrationRequests")
      .orderBy("createdAt", "desc")
      .get();

    const requests = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      requests,
    });

  } catch (error) {
    console.error("Post91 requests error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to load requests",
    });
  }
});

app.post("/api/post91/approve", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({
        success: false,
        message: "Database not connected",
      });
    }

    const cleanEmail = (req.body.email || "").toLowerCase().trim();

    if (!cleanEmail) {
      return res.status(400).json({
        success: false,
        message: "Email required",
      });
    }

    const updateData = {
      registrationStatus: "approved",
      accountActive: true,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.collection("post91Users").doc(cleanEmail).update(updateData);
    await db.collection("post91RegistrationRequests").doc(cleanEmail).update(updateData);

    res.json({
      success: true,
      message: "Post91 account approved",
    });

  } catch (error) {
    console.error("Post91 approve error:", error);
    res.status(500).json({
      success: false,
      message: "Approval failed",
    });
  }
});

app.post("/api/post91/reject", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({
        success: false,
        message: "Database not connected",
      });
    }

    const cleanEmail = (req.body.email || "").toLowerCase().trim();

    if (!cleanEmail) {
      return res.status(400).json({
        success: false,
        message: "Email required",
      });
    }

    const updateData = {
      registrationStatus: "rejected",
      accountActive: false,
      rejectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.collection("post91Users").doc(cleanEmail).update(updateData);
    await db.collection("post91RegistrationRequests").doc(cleanEmail).update(updateData);

    res.json({
      success: true,
      message: "Post91 account rejected",
    });

  } catch (error) {
    console.error("Post91 reject error:", error);
    res.status(500).json({
      success: false,
      message: "Reject failed",
    });
  }
});

/* =========================
   SERVER START
========================= */

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Post91 Accounts running on port ${PORT}`);
});