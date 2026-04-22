const toastWrap = document.createElement("div");
toastWrap.className = "toast-wrap";
document.body.appendChild(toastWrap);

const showToast = (message, type = "info") => {
  const item = document.createElement("div");
  item.className = `toast ${type}`;
  item.textContent = message;
  toastWrap.appendChild(item);

  setTimeout(() => {
    item.remove();
  }, 2800);
};

const redirectIfNoAuth = () => {
  if (!window.API.getToken()) {
    window.location.href = "/login.html";
  }
};

const redirectIfNotAdmin = () => {
  const user = window.API.getUser();
  if (!user || user.role !== "admin") {
    showToast("Admin access required", "error");
    setTimeout(() => {
      window.location.href = "/dashboard.html";
    }, 600);
  }
};

const renderNav = () => {
  const navRoot = document.getElementById("topNav");
  if (!navRoot) {
    return;
  }

  const user = window.API.getUser();
  const links = [{ href: "/index.html", label: "Home" }];

  if (!user) {
    links.push({ href: "/login.html", label: "Login" });
    links.push({ href: "/register.html", label: "Register" });
  } else {
    links.push({ href: "/dashboard.html", label: "Dashboard" });
    links.push({ href: "/report.html", label: "Report Incident" });
    if (user.role === "admin") {
      links.push({ href: "/admin.html", label: "Admin Panel" });
    }
  }

  const list = links
    .map((link) => `<a href="${link.href}">${link.label}</a>`)
    .join("");

  navRoot.innerHTML = `${list}${
    user
      ? '<button id="logoutBtn" class="primary" type="button">Logout</button>'
      : ""
  }`;

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      window.API.clearAuth();
      showToast("Logged out", "info");
      setTimeout(() => {
        window.location.href = "/login.html";
      }, 350);
    });
  }
};

const bindYear = () => {
  const year = document.getElementById("year");
  if (year) {
    year.textContent = new Date().getFullYear();
  }
};

document.addEventListener("DOMContentLoaded", () => {
  renderNav();
  bindYear();
});

window.APP = {
  showToast,
  redirectIfNoAuth,
  redirectIfNotAdmin,
};
