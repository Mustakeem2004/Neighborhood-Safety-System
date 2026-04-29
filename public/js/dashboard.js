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

      /* RENDER INCIDENTS */
      data.forEach(incident => {
        const div = document.createElement("div");
        div.className = "modern-card";

        div.innerHTML = `
          <h3>${incident.title}</h3>

          <div style="margin:10px 0;">
            <span style="background:#eee; padding:4px 8px; border-radius:6px; margin-right:5px;">
              ${incident.type}
            </span>

            <span style="background:#d1ecf1; padding:4px 8px; border-radius:6px; margin-right:5px;">
              ${incident.status}
            </span>

            <span style="background:#f8d7da; padding:4px 8px; border-radius:6px;">
              ${incident.location}
            </span>
          </div>

          <p>${incident.description}</p>

          <p style="font-size:12px; color:#666;">
            Reported by: ${incident.reportedBy?.name || "Unknown"}
          </p>

          ${
            incident.image
              ? `
              <img src="${incident.image}" 
                style="
                  max-width:300px;
                  width:100%;
                  height:auto;
                  border-radius:10px;
                  margin-top:10px;
                  border:1px solid #ddd;
                "
                onerror="this.style.display='none'"
              />
            `
              : ""
          }
        `;

        incidentList.appendChild(div);

        if (incident.lat && incident.lng) {
          const marker = L.marker([incident.lat, incident.lng])
            .addTo(map)
            .bindPopup(`<b>${incident.title}</b><br>${incident.location}`);

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