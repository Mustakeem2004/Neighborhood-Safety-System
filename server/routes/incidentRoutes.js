const express = require("express");

const {
  createIncident,
  getIncidents,
  getIncidentById,
  updateIncidentStatus,
  deleteIncident,
} = require("../controllers/incidentController");

const auth = require("../middleware/auth");

const router = express.Router();

/* USER */
router.post("/incidents", auth, createIncident);
router.get("/incidents", getIncidents);
router.get("/incidents/:id", getIncidentById);

/* ADMIN FEATURES */
router.put("/incidents/:id/status", auth, updateIncidentStatus);
router.delete("/incidents/:id", auth, deleteIncident);

module.exports = router;