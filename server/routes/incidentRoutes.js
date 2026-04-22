const express = require("express");
const {
  createIncident,
  getIncidents,
  getIncidentById,
} = require("../controllers/incidentController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/incidents", auth, createIncident);
router.get("/incidents", getIncidents);
router.get("/incidents/:id", getIncidentById);

module.exports = router;
