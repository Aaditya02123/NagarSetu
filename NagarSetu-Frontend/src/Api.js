/**
 * src/api.js
 *
 * Central API client for NagarSetu.
 * Every fetch call in the app goes through here — never raw fetch() in components.
 *
 * BASE URL STRATEGY:
 *   - In production (npm run build): use VITE_API_URL from .env
 *   - In development (npm run dev):  auto-detect from window.location.hostname
 *     so the same code works on localhost AND any LAN IP without touching .env
 *
 * Usage:
 *   import api from "../api";
 *   const data = await api.get("/complaints/mine");
 *   const result = await api.post("/auth/login", { email, password, role });
 */

function getBaseURL() {
  // 1. If an explicit env var is set, always honour it (production / CI)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // 2. Dev / LAN: mirror whatever host the browser used to reach the frontend,
  //    but point at the backend port (8000).
  //    - On the dev machine : window.location.hostname === "localhost"
  //    - On another LAN PC  : window.location.hostname === "192.168.X.X"
  //    Both cases resolve to the correct backend automatically.
  const host = window.location.hostname;
  return `http://${host}:8000`;
}

const BASE = getBaseURL();

// ── Token helpers ─────────────────────────────────────────────────────────────

export const getToken   = ()      => localStorage.getItem("ns_token");
export const setToken   = (token) => localStorage.setItem("ns_token", token);
export const clearToken = ()      => localStorage.removeItem("ns_token");

export const getUser  = () => {
  const raw = localStorage.getItem("ns_user");
  return raw ? JSON.parse(raw) : null;
};
export const setUser   = (user) => localStorage.setItem("ns_user", JSON.stringify(user));
export const clearUser = ()     => localStorage.removeItem("ns_user");

export const isAdmin    = ()    => getUser()?.role === "admin";
export const isLoggedIn = ()    => !!getToken();


// ── Core fetch wrapper ────────────────────────────────────────────────────────

async function request(method, path, body = null, isFormData = false) {
  const headers = {};

  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // Don't set Content-Type for FormData — browser sets it with the boundary
  if (body && !isFormData) headers["Content-Type"] = "application/json";

  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : null,
  });

  // 401 → token expired or invalid → log out
  if (res.status === 401) {
    clearToken();
    clearUser();
    window.location.href = "/login";
    return;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // FastAPI validation errors come back as { detail: [...] }
    const message =
      typeof data.detail === "string"
        ? data.detail
        : Array.isArray(data.detail)
        ? data.detail.map((e) => e.msg).join(", ")
        : "Something went wrong.";
    throw new Error(message);
  }

  return data;
}


// ── Public API ────────────────────────────────────────────────────────────────

const api = {
  get:    (path)           => request("GET",    path),
  post:   (path, body)     => request("POST",   path, body),
  patch:  (path, body)     => request("PATCH",  path, body),
  delete: (path)           => request("DELETE", path),
  upload: (path, formData) => request("POST",   path, formData, true),
};

export default api;


// ── Auth helpers (used by Login.jsx / Register.jsx) ───────────────────────────

export async function loginUser({ email, password, role }) {
  const data = await api.post("/auth/login", { email, password, role });
  setToken(data.access_token);
  setUser(data.user);
  return data.user;
}

export async function registerUser({ firstName, lastName, email, phone, password, role }) {
  return api.post("/auth/register", {
    first_name: firstName,
    last_name:  lastName,
    email, phone, password, role,
  });
}

export function logoutUser() {
  clearToken();
  clearUser();
}