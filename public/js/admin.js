document.addEventListener("DOMContentLoaded", () => {
  window.APP.redirectIfNoAuth();
  window.APP.redirectIfNotAdmin();

  const userTableBody = document.getElementById("userTableBody");
  const incidentTableBody = document.getElementById("incidentTableBody");

  const loadUsers = async () => {
    try {
      const users = await window.API.apiRequest("/users", { auth: true });
      userTableBody.innerHTML = "";

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
                : `<button class="primary" data-action="toggle-approve" data-id="${user._id}" data-approved="${user.isApproved}">${
                    user.isApproved ? "Revoke" : "Approve"
                  }</button>`
            }
          </td>
        `;

        userTableBody.appendChild(row);
      });
    } catch (error) {
      window.APP.showToast(error.message, "error");
    }
  };

  const loadIncidents = async () => {
    try {
      const incidents = await window.API.apiRequest("/incidents");
      incidentTableBody.innerHTML = "";

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
            <button class="btn light" data-action="delete" data-id="${incident._id}">Delete</button>
          </td>
        `;

        incidentTableBody.appendChild(row);
      });
    } catch (error) {
      window.APP.showToast(error.message, "error");
    }
  };

  userTableBody.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) {
      return;
    }

    if (target.dataset.action === "toggle-approve") {
      const userId = target.dataset.id;
      const currentlyApproved = target.dataset.approved === "true";

      try {
        await window.API.apiRequest(`/users/${userId}/approve`, {
          method: "PUT",
          auth: true,
          body: { isApproved: !currentlyApproved },
        });

        window.APP.showToast(
          currentlyApproved ? "Approval revoked" : "Approved by admin",
          "success"
        );
        await loadUsers();
      } catch (error) {
        window.APP.showToast(error.message, "error");
      }
    }
  });

  incidentTableBody.addEventListener("change", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement) || target.dataset.action !== "status") {
      return;
    }

    const incidentId = target.dataset.id;

    try {
      await window.API.apiRequest(`/incidents/${incidentId}/status`, {
        method: "PUT",
        auth: true,
        body: { status: target.value },
      });
      window.APP.showToast("Incident status updated", "success");
    } catch (error) {
      window.APP.showToast(error.message, "error");
    }
  });

  incidentTableBody.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement) || target.dataset.action !== "delete") {
      return;
    }

    const incidentId = target.dataset.id;

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

  loadUsers();
  loadIncidents();
});
