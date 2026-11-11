export const API_URL = "http://localhost:5002/api";

export async function api(path, options = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && token) {
    localStorage.removeItem("token");
  }

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}
