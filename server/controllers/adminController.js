const Incident = require("../models/Incident");
const User = require("../models/User");

const allowedStatuses = ["Pending", "Verified", "Resolved"];

/* ================= USERS ================= */
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveUser = async (req, res) => {
  try {
    const { isApproved } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "admin") {
      return res.status(400).json({ message: "Cannot modify admin" });
    }

    user.isApproved = typeof isApproved === "boolean" ? isApproved : true;
    await user.save();

    res.json({
      message: user.isApproved ? "User approved" : "Approval revoked",
      user,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= INCIDENT MANAGEMENT ================= */
exports.updateIncidentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const incident = await Incident.findById(req.params.id);
    if (!incident) return res.status(404).json({ message: "Incident not found" });

    incident.status = status;
    await incident.save();

    res.json({ message: "Status updated", incident });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteIncident = async (req, res) => {
  try {
    const incident = await Incident.findByIdAndDelete(req.params.id);
    if (!incident) return res.status(404).json({ message: "Not found" });

    res.json({ message: "Deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= ANALYTICS ================= */
exports.getAnalytics = async (req, res) => {
  try {
    const total = await Incident.countDocuments();

    const pending = await Incident.countDocuments({ status: "Pending" });
    const verified = await Incident.countDocuments({ status: "Verified" });
    const resolved = await Incident.countDocuments({ status: "Resolved" });

    const byType = await Incident.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);

    res.json({
      total,
      status: { pending, verified, resolved },
      byType,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};