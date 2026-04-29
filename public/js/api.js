const API_BASE =
  window.location.hostname === "localhost"
    ? "/api"
    : "https://neighborhood-safety-system.onrender.com/api";

/* ================= AUTH ================= */
const getToken = () => localStorage.getItem("token");

const setAuth = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

/* ================= API REQUEST ================= */
const apiRequest = async (path, options = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // ⏳ 10s timeout

  const isFormData = options.body instanceof FormData;

  const config = {
    method: options.method || "GET",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
    signal: controller.signal,
  };

  /* AUTH HEADER */
  if (options.auth) {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  /* BODY */
  if (options.body) {
    config.body = isFormData
      ? options.body
      : JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, config);
    clearTimeout(timeout);

    let payload;
    try {
      payload = await response.json();
    } catch {
      payload = { message: "Invalid server response" };
    }

    /* 🔥 HANDLE UNAUTHORIZED */
    if (response.status === 401) {
      clearAuth();
      window.location.href = "/login.html";
      throw new Error("Session expired. Please login again.");
    }

    if (!response.ok) {
      throw new Error(payload.message || "Request failed");
    }

    return payload;

  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timeout. Try again.");
    }

    throw error;
  }
};

/* ================= EXPORT ================= */
window.API = {
  apiRequest,
  getToken,
  getUser,
  setAuth,
  clearAuth,
};