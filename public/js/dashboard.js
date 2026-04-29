document.addEventListener("DOMContentLoaded", () => {
  window.APP.redirectIfNoAuth();

  const welcomeText = document.getElementById("welcomeText");
  const incidentList = document.getElementById("incidentList");
  const filterForm = document.getElementById("filterForm");
  const clearFiltersBtn = document.getElementById("clearFiltersBtn");
  const loadingText = document.getElementById("loadingText");

  /* ================= USER ================= */
  const user = window.API.getUser();
  if (user) {
    welcomeText.textContent = `Welcome, ${user.name}. Stay updated with your community safety reports.`;
  }

  /* ================= MAP ================= */
  let map;
  let markers = [];

  const mapDiv = document.getElementById("map");

  if (mapDiv) {
    map = L.map("map").setView([28.6139, 77.2090], 10);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
  }

  /* ================= RENDER INCIDENT ================= */
  const renderIncident = (incident) => {
    const wrapper = document.createElement("article");
    wrapper.className = "modern-card";

    wrapper.innerHTML = `
      <h3>${incident.title}</h3>

      <div class="incident-meta">
        <span class="badge">${incident.type}</span>
        <span class="badge status-${incident.status}">${incident.status}</span>
        <span class="badge">${incident.location}</span>
      </div>

      <p>${incident.description}</p>

      <p class="muted">
        Reported by: ${incident.reportedBy?.name || "Unknown"} |
        ${new Date(incident.createdAt).toLocaleString()}
      </p>

      ${
        incident.image
          ? `<p><a href="${incident.image}" target="_blank">View Image</a></p>`
          : ""
      }
    `;

    return wrapper;
  };

  /* ================= LOAD INCIDENTS ================= */
  const loadIncidents = async () => {
    try {
      if (loadingText) loadingText.style.display = "block";
      incidentList.innerHTML = "";

      const formData = new FormData(filterForm);
      const params = new URLSearchParams();

      ["type", "status", "location", "search"].forEach((key) => {
        const value = (formData.get(key) || "").toString().trim();
        if (value) params.append(key, value);
      });

      const query = params.toString() ? `?${params.toString()}` : "";
      const incidents = await window.API.apiRequest(`/incidents${query}`);

      if (loadingText) loadingText.style.display = "none";

      /* ================= STATS ================= */
      const total = incidents.length;
      const pending = incidents.filter(i => i.status === "Pending").length;
      const verified = incidents.filter(i => i.status === "Verified").length;
      const resolved = incidents.filter(i => i.status === "Resolved").length;

      const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
      };

      setText("totalCount", total);
      setText("pendingCount", pending);
      setText("verifiedCount", verified);
      setText("resolvedCount", resolved);

      /* ================= EMPTY STATE ================= */
      if (!incidents.length) {
        incidentList.innerHTML = `
          <div class="modern-card">
            <p class="muted">🚫 No incidents found</p>
          </div>
        `;
        return;
      }

      /* ================= CLEAR MAP ================= */
      markers.forEach(m => map?.removeLayer(m));
      markers = [];

      /* ================= RENDER ================= */
      incidents.forEach((incident) => {
        incidentList.appendChild(renderIncident(incident));

        /* MAP MARKER (TEMP RANDOM LOCATION) */
        if (map) {
          const lat = 28.6 + Math.random() * 0.1;
          const lng = 77.2 + Math.random() * 0.1;

          const marker = L.marker([lat, lng])
            .addTo(map)
            .bindPopup(`<b>${incident.title}</b><br>${incident.location}`);

          markers.push(marker);
        }
      });

    } catch (error) {
      if (loadingText) loadingText.style.display = "none";
      window.APP.showToast(error.message, "error");
    }
  };

  /* ================= EVENTS ================= */
  filterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    loadIncidents();
  });

  clearFiltersBtn.addEventListener("click", () => {
    filterForm.reset();
    loadIncidents();
  });

  /* ================= INIT ================= */
  loadIncidents();
});