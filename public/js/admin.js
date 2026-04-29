let statusChartInstance;
let typeChartInstance;
document.addEventListener("DOMContentLoaded", () => {
  window.APP.redirectIfNoAuth();
  window.APP.redirectIfNotAdmin();

  const userTableBody = document.getElementById("userTableBody");
  const incidentTableBody = document.getElementById("incidentTableBody");

  /* ================= LOADING HELPERS ================= */
  const setLoading = (el, text = "Loading...") => {
    if (el) el.innerHTML = `<tr><td colspan="6" class="muted">${text}</td></tr>`;
  };

  /* ================= LOAD USERS ================= */
  const loadUsers = async () => {
    try {
      setLoading(userTableBody);

      const users = await window.API.apiRequest("/users", { auth: true });
      userTableBody.innerHTML = "";

      if (!users.length) {
        setLoading(userTableBody, "No users found");
        return;
      }

      users.forEach((user) => {
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${user.address}</td>
          <td>${user.role}</td>
          <td>${user.isApproved ? "Yes" : "No"}</td>
          <td>
            ${
              user.role === "admin"
                ? "-"
                : `<button class="btn gradient"
                    data-action="toggle-approve"
                    data-id="${user._id}"
                    data-approved="${user.isApproved}">
                    ${user.isApproved ? "Revoke" : "Approve"}
                  </button>`
            }
          </td>
        `;

        userTableBody.appendChild(row);
      });

    } catch (error) {
      window.APP.showToast(error.message, "error");
    }
  };

  /* ================= LOAD INCIDENTS ================= */
  const loadIncidents = async () => {
    try {
      setLoading(incidentTableBody);

      const incidents = await window.API.apiRequest("/incidents", { auth: true });
      incidentTableBody.innerHTML = "";

      if (!incidents.length) {
        setLoading(incidentTableBody, "No incidents found");
        return;
      }

      incidents.forEach((incident) => {
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${incident.title}</td>
          <td>${incident.type}</td>
          <td>
            <select data-action="status" data-id="${incident._id}">
              <option value="Pending" ${incident.status === "Pending" ? "selected" : ""}>Pending</option>
              <option value="Verified" ${incident.status === "Verified" ? "selected" : ""}>Verified</option>
              <option value="Resolved" ${incident.status === "Resolved" ? "selected" : ""}>Resolved</option>
            </select>
          </td>
          <td>${incident.location}</td>
          <td>${incident.reportedBy?.name || "Unknown"}</td>
          <td>
            <button class="btn outline" data-action="delete" data-id="${incident._id}">
              Delete
            </button>
          </td>
        `;

        incidentTableBody.appendChild(row);
      });

    } catch (error) {
      window.APP.showToast(error.message, "error");
    }
  };

  /* ================= USER ACTION ================= */
  userTableBody.addEventListener("click", async (event) => {
    const target = event.target;

    if (!(target instanceof HTMLButtonElement)) return;

    if (target.dataset.action === "toggle-approve") {
      const userId = target.dataset.id;
      const currentlyApproved = target.dataset.approved === "true";

      target.disabled = true;
      target.textContent = "Processing...";

      try {
        await window.API.apiRequest(`/users/${userId}/approve`, {
          method: "PUT",
          auth: true,
          body: { isApproved: !currentlyApproved },
        });

        window.APP.showToast(
          currentlyApproved ? "Approval revoked" : "User approved",
          "success"
        );

        await loadUsers();

      } catch (error) {
        window.APP.showToast(error.message, "error");
      }
    }
  });

  /* ================= STATUS CHANGE ================= */
  incidentTableBody.addEventListener("change", async (event) => {
    const target = event.target;

    if (!(target instanceof HTMLSelectElement) || target.dataset.action !== "status") return;

    const incidentId = target.dataset.id;

    try {
      await window.API.apiRequest(`/incidents/${incidentId}/status`, {
        method: "PUT",
        auth: true,
        body: { status: target.value },
      });

      window.APP.showToast("Status updated", "success");

    } catch (error) {
      window.APP.showToast(error.message, "error");
    }
  });
  

const loadAnalytics = async () => {
  try {
    const data = await window.API.apiRequest("/analytics", { auth: true });

    /* TOTAL */
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
          ],
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
          data: data.byType.map(i => i.count),
        }]
      }
    });

  } catch (err) {
    console.error(err);
    window.APP.showToast("Failed to load analytics", "error");
  }
};




  /* ================= DELETE INCIDENT ================= */
  incidentTableBody.addEventListener("click", async (event) => {
    const target = event.target;

    if (!(target instanceof HTMLButtonElement) || target.dataset.action !== "delete") return;

    const incidentId = target.dataset.id;

    /* 🔥 CONFIRMATION */
    const confirmDelete = confirm("Are you sure you want to delete this incident?");
    if (!confirmDelete) return;

    target.disabled = true;
    target.textContent = "Deleting...";

    try {
      await window.API.apiRequest(`/incidents/${incidentId}`, {
        method: "DELETE",
        auth: true,
      });

      window.APP.showToast("Incident deleted", "success");

      await loadIncidents();

    } catch (error) {
      window.APP.showToast(error.message, "error");
    }
  });



  /* ================= INIT ================= */
  loadUsers();
  loadIncidents();
  loadAnalytics();
});