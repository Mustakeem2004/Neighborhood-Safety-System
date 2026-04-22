document.addEventListener("DOMContentLoaded", () => {
  window.APP.redirectIfNoAuth();

  const welcomeText = document.getElementById("welcomeText");
  const incidentList = document.getElementById("incidentList");
  const filterForm = document.getElementById("filterForm");
  const clearFiltersBtn = document.getElementById("clearFiltersBtn");

  const user = window.API.getUser();
  if (user) {
    welcomeText.textContent = `Welcome, ${user.name}. Track reports and community safety updates here.`;
  }

  const renderIncident = (incident) => {
    const wrapper = document.createElement("article");
    wrapper.className = "card incident-item";

    wrapper.innerHTML = `
      <h3>${incident.title}</h3>
      <div class="incident-meta">
        <span class="badge">${incident.type}</span>
        <span class="badge status-${incident.status}">${incident.status}</span>
        <span class="badge">${incident.location}</span>
      </div>
      <p>${incident.description}</p>
      <p class="muted">Reported by: ${incident.reportedBy?.name || "Unknown"} | ${new Date(
      incident.createdAt
    ).toLocaleString()}</p>
      ${incident.image ? `<p><a href="${incident.image}" target="_blank" rel="noreferrer">View Image</a></p>` : ""}
    `;

    return wrapper;
  };

  const loadIncidents = async () => {
    try {
      const formData = new FormData(filterForm);
      const params = new URLSearchParams();

      ["type", "status", "location", "search"].forEach((key) => {
        const value = (formData.get(key) || "").toString().trim();
        if (value) {
          params.append(key, value);
        }
      });

      const query = params.toString() ? `?${params.toString()}` : "";
      const incidents = await window.API.apiRequest(`/incidents${query}`);

      incidentList.innerHTML = "";
      if (!incidents.length) {
        incidentList.innerHTML = '<p class="muted">No incidents found for selected filters.</p>';
        return;
      }

      incidents.forEach((incident) => {
        incidentList.appendChild(renderIncident(incident));
      });
    } catch (error) {
      window.APP.showToast(error.message, "error");
    }
  };

  filterForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await loadIncidents();
  });

  clearFiltersBtn.addEventListener("click", async () => {
    filterForm.reset();
    await loadIncidents();
  });

  loadIncidents();
});
