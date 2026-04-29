let toastWrap;

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {
  createToastContainer();

  // Render navbar if exists
  if (document.getElementById("topNav")) {
    renderNav();
  }

  bindYear();
  highlightActiveLink();
});

/* ================= TOAST ================= */
const createToastContainer = () => {
  if (toastWrap) return;

  toastWrap = document.createElement("div");
  toastWrap.className = "toast-wrap";
  document.body.appendChild(toastWrap);
};

const showToast = (message, type = "info") => {
  if (!toastWrap) createToastContainer();

  const item = document.createElement("div");
  item.className = `toast ${type}`;
  item.textContent = message;

  toastWrap.appendChild(item);

  setTimeout(() => item.remove(), 2800);
};

/* ================= AUTH ================= */
const redirectIfNoAuth = () => {
  const token = window.API.getToken();

  // 🔥 Only redirect if NOT already on login page
  if (!token && !window.location.pathname.includes("login")) {
    window.location.href = "/login.html";
  }
};

const redirectIfNotAdmin = () => {
  const user = window.API.getUser();

  // 🔥 Fix: Only block if user exists but not admin
  if (!user) {
    window.location.href = "/login.html";
    return;
  }

  if (user.role !== "admin") {
    showToast("Admin access required", "error");

    setTimeout(() => {
      window.location.href = "/dashboard.html";
    }, 500);
  }
};

/* ================= NAVBAR ================= */
const renderNav = () => {
  const navRoot = document.getElementById("topNav");
  if (!navRoot) return;


  const user = window.API?.getUser?.();
  const links = [
  { href: "/index.html", label: "Home" },
  { href: "/about.html", label: "About" },
  { href: "/contact.html", label: "Contact" },
  ];

  if (!user) {
    links.push({ href: "/login.html", label: "Login" });
    links.push({ href: "/register.html", label: "Register" });
  } else {
    // Admins see both Dashboard and Admin Panel
    if (user.role === "admin") {
      links.push({ href: "/dashboard.html", label: "Dashboard" });
      links.push({ href: "/admin.html", label: "Admin Panel" });
    } else {
      links.push({ href: "/dashboard.html", label: "Dashboard" });
    }
    links.push({ href: "/report.html", label: "Report Incident" });
  }

  navRoot.innerHTML = "";

  links.forEach(link => {
    const a = document.createElement("a");
    a.href = link.href;
    a.textContent = link.label;
    navRoot.appendChild(a);
  });

  /* USER NAME */
  if (user) {
    const span = document.createElement("span");
    span.className = "nav-user";
    span.textContent = `Hi, ${user.name}`;
    navRoot.appendChild(span);
  }

  /* LOGOUT */
  if (user) {
    const btn = document.createElement("button");
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
    if (window.location.pathname === link.getAttribute("href")) {
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