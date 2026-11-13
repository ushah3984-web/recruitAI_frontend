import { Navigate, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { getUser, logout } from "../api/auth";
import "./Auth.css";
 
// Temporary placeholder until the real portals are built.
export default function Dashboard({ role }) {
  const navigate = useNavigate();
  const user = getUser();
 
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={user.role === "organization" ? "/org/dashboard" : "/candidate/dashboard"} replace />;
 
  return (
    <main className="auth">
      <div className="auth__card">
        <h1>{role === "organization" ? "Organization dashboard" : "Candidate dashboard"}</h1>
        <p className="auth__sub">Signed in as {user.name} ({user.email}).</p>
        <Button variant="secondary" onClick={() => { logout(); navigate("/"); }}>Log out</Button>
      </div>
    </main>
  );
}