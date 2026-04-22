const Incident = require("../models/Incident");

const allowedTypes = ["Crime", "Accident", "Emergency", "Suspicious Activity"];
const allowedStatuses = ["Pending", "Verified", "Resolved"];

exports.createIncident = async (req, res) => {
  try {
    if (req.user.role === "user" && !req.user.isApproved) {
      return res.status(403).json({ message: "Only approved users can report incidents" });
    }

    const { title, description, type, location, image } = req.body;

    if (!title || !description || !type || !location) {
      return res.status(400).json({ message: "Title, description, type, and location are required" });
    }

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ message: "Invalid incident type" });
    }

    const incident = await Incident.create({
      title,
      description,
      type,
      location,
      image: image || "",
      status: "Pending",
      reportedBy: req.user._id,
    });

    return res.status(201).json({ message: "Report submitted", incident });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getIncidents = async (req, res) => {
  try {
    const { type, location, status, search } = req.query;
    const query = {};

    if (type && allowedTypes.includes(type)) {
      query.type = type;
    }

    if (status && allowedStatuses.includes(status)) {
      query.status = status;
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    const incidents = await Incident.find(query)
      .populate("reportedBy", "name email address")
      .sort({ createdAt: -1 });

    return res.status(200).json(incidents);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getIncidentById = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id).populate(
      "reportedBy",
      "name email address"
    );

    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    return res.status(200).json(incident);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
