document.addEventListener("DOMContentLoaded", () => {

  /* ================= AUTH ================= */
  window.APP.redirectIfNoAuth();

  const user = window.API.getUser();

  /* ================= UI ================= */
  document.getElementById("year").textContent = new Date().getFullYear();

  if (user) {
    document.getElementById("welcomeText").textContent =
      `Welcome, ${user.name}. Stay updated with your community safety reports.`;
  }

  const incidentList = document.getElementById("incidentList");
  const loadingText = document.getElementById("loadingText");

  /* ================= MAP ================= */
  let map = L.map("map").setView([28.6139, 77.2090], 10);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  let markers = [];

  /* ================= ANALYTICS ================= */
  let statusChartInstance;
  let typeChartInstance;

  const loadAnalytics = async () => {
    try {
      const data = await window.API.apiRequest("/analytics", { auth: true });

      document.getElementById("totalIncidents").textContent = data.total;

      /* STATUS CHART */
      const statusCtx = document.getElementById("statusChart");

      if (statusChartInstance) statusChartInstance.destroy();

      statusChartInstance = new Chart(statusCtx, {
        type: "doughnut",
        data: {
          labels: ["Pending", "Verified", "Resolved"],
          datasets: [{
            data: [
              data.status.pending,
              data.status.verified,
              data.status.resolved
            ]
          }]
        }
      });

      /* TYPE CHART */
      const typeCtx = document.getElementById("typeChart");

      if (typeChartInstance) typeChartInstance.destroy();

      typeChartInstance = new Chart(typeCtx, {
        type: "bar",
        data: {
          labels: data.byType.map(i => i._id),
          datasets: [{
            label: "Incidents",
            data: data.byType.map(i => i.count)
          }]
        }
      });

    } catch (err) {
      window.APP.showToast("Failed to load analytics", "error");
    }
  };

  /* ================= LOAD INCIDENTS ================= */
  const loadIncidents = async () => {
    try {
      loadingText.style.display = "block";
      incidentList.innerHTML = "";

      const data = await window.API.apiRequest("/incidents", { auth: true });

      loadingText.style.display = "none";

      /* STATS */
      document.getElementById("totalCount").textContent = data.length;
      document.getElementById("pendingCount").textContent =
        data.filter(i => i.status === "Pending").length;
      document.getElementById("verifiedCount").textContent =
        data.filter(i => i.status === "Verified").length;
      document.getElementById("resolvedCount").textContent =
        data.filter(i => i.status === "Resolved").length;

      /* CLEAR MAP */
      markers.forEach(marker => map.removeLayer(marker));
      markers = [];

      /* RENDER */
      data.forEach(incident => {
        const div = document.createElement("div");
        div.className = "modern-card";

        div.innerHTML = `
          <h3>${incident.title}</h3>
          <p>${incident.description}</p>
        `;

        incidentList.appendChild(div);

        if (incident.lat && incident.lng) {
          const marker = L.marker([incident.lat, incident.lng])
            .addTo(map)
            .bindPopup(`<b>${incident.title}</b>`);

          markers.push(marker);
        }
      });

    } catch (error) {
      loadingText.style.display = "none";
      window.APP.showToast(error.message, "error");
    }
  };

  /* ================= INIT ================= */
  loadIncidents();
  loadAnalytics();

});