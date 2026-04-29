let toastWrap;

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {
  createToastContainer();
  renderNav();
  bindYear();
  highlightActiveLink();
});

/* ================= TOAST ================= */
const createToastContainer = () => {
  toastWrap = document.createElement("div");
  toastWrap.className = "toast-wrap";
  document.body.appendChild(toastWrap);
};

const showToast = (message, type = "info") => {
  const item = document.createElement("div");
  item.className = `toast ${type}`;
  item.textContent = message;

  toastWrap.appendChild(item);

  setTimeout(() => item.remove(), 2800);
};

/* ================= AUTH ================= */
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

/* ================= NAVBAR ================= */
const renderNav = () => {
  const navRoot = document.getElementById("topNav");
  if (!navRoot) return;

  const user = window.API.getUser();

  const links = [
    { href: "/index.html", label: "Home" },
  ];

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

  // Clear nav safely
  navRoot.innerHTML = "";

  // Add links
  links.forEach(link => {
    const a = document.createElement("a");
    a.href = link.href;
    a.textContent = link.label;
    navRoot.appendChild(a);
  });

  // Add logout button
  if (user) {
    const btn = document.createElement("button");
    btn.id = "logoutBtn";
    btn.className = "btn logout-btn";
    btn.textContent = "Logout";

    btn.addEventListener("click", () => {
      window.API.clearAuth();
      showToast("Logged out", "info");

      setTimeout(() => {
        window.location.href = "/login.html";
      }, 300);
    });

    navRoot.appendChild(btn);
  }
};

/* ================= ACTIVE LINK ================= */
const highlightActiveLink = () => {
  const links = document.querySelectorAll(".nav-links a");

  links.forEach(link => {
    if (window.location.pathname.includes(link.getAttribute("href"))) {
      link.classList.add("active");
    }
  });
};

/* ================= FOOTER ================= */
const bindYear = () => {
  const year = document.getElementById("year");
  if (year) {
    year.textContent = new Date().getFullYear();
  }
};

/* ================= EXPORT ================= */
window.APP = {
  showToast,
  redirectIfNoAuth,
  redirectIfNotAdmin,
};