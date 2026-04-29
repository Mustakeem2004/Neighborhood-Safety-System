const express = require("express");
const {
  getUsers,
  approveUser,
  updateIncidentStatus,
  deleteIncident,
} = require("../controllers/adminController");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const router = express.Router();

router.get("/users", auth, admin, getUsers);
router.put("/users/:id/approve", auth, admin, approveUser);
router.put("/incidents/:id/status", auth, admin, updateIncidentStatus);
router.delete("/incidents/:id", auth, admin, deleteIncident);
router.get("/analytics", auth, admin, getAnalytics);

module.exports = router;
