const API_BASE = "/api";

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
  } catch (error) {
    return null;
  }
};

const apiRequest = async (path, options = {}) => {
  const config = {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  };

  if (options.auth) {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE}${path}`, config);

  let payload;
  try {
    payload = await response.json();
  } catch (error) {
    payload = { message: "Unexpected response from server" };
  }

  if (!response.ok) {
    throw new Error(payload.message || "Request failed");
  }

  return payload;
};

window.API = {
  apiRequest,
  getToken,
  getUser,
  setAuth,
  clearAuth,
};
