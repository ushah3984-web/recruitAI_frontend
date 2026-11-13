// Authentication API layer.
// If VITE_API_URL is set in .env, real requests go to your backend.
// If it is NOT set, a local mock (browser storage) is used so you can build the UI without a server.
const BASE_URL = import.meta.env.VITE_API_URL;
const USE_MOCK = !BASE_URL;
 
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const readUsers = () => { try { return JSON.parse(localStorage.getItem("mock_users")) || []; } catch { return []; } };
 
async function mockRegister({ name, email, password, role }) {
  await wait(400);
  const users = readUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("An account with this email already exists. Try logging in.");
  }
  const user = { id: Date.now(), name, email, role, password };
  localStorage.setItem("mock_users", JSON.stringify([...users, user]));
  const { password: _pw, ...safe } = user;
  return { token: "mock-token", user: safe };
}
 
async function mockLogin({ email, password }) {
  await wait(400);
  const user = readUsers().find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) throw new Error("Email or password is incorrect.");
  const { password: _pw, ...safe } = user;
  return { token: "mock-token", user: safe };
}
 
async function request(path, body) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Cannot reach the server. Check that your backend is running and VITE_API_URL is correct.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Something went wrong. Please try again.");
  return data; // expected: { token, user: { id, name, email, role } }
}
 
export const loginUser = (credentials) => (USE_MOCK ? mockLogin(credentials) : request("/auth/login", credentials));
export const registerUser = (details) => (USE_MOCK ? mockRegister(details) : request("/auth/register", details));
 
export function saveSession({ token, user }) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}
export function getUser() {
  try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
}
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
export const homeForRole = (role) => (role === "organization" ? "/org/dashboard" : "/candidate/dashboard");