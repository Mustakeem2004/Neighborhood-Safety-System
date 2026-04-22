const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

const connectDB = require("./config/db");
const User = require("./models/User");
const authRoutes = require("./routes/authRoutes");
const incidentRoutes = require("./routes/incidentRoutes");
const adminRoutes = require("./routes/adminRoutes");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

const ensureDefaultAdmin = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    return;
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({
    name: process.env.ADMIN_NAME || "System Admin",
    email: email.toLowerCase(),
    password: hashedPassword,
    address: process.env.ADMIN_ADDRESS || "Control Room",
    role: "admin",
    isApproved: true,
  });

  console.log("Default admin account created");
};

app.use("/api", authRoutes);
app.use("/api", incidentRoutes);
app.use("/api", adminRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "API is running" });
});

app.use(express.static(path.join(__dirname, "../public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await ensureDefaultAdmin();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error.message);
    process.exit(1);
  }
};

startServer();
