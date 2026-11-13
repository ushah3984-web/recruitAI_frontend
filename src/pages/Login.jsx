import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Input from "../components/Input";
import Button from "../components/Button";
import { loginUser, saveSession, homeForRole } from "../api/auth";
import "./Auth.css";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginUser(form);
      saveSession(data);
      navigate(homeForRole(data.user.role)); // role-based access
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="auth">
        <form className="auth__card" onSubmit={submit}>
          <h1>Log in</h1>
          <p className="auth__sub">Welcome back. Enter your details to continue.</p>
          {error && <div className="auth__alert" role="alert">{error}</div>}
          <Input label="Email" type="email" name="email" value={form.email} onChange={update} required autoComplete="email" />
          <Input label="Password" type="password" name="password" value={form.password} onChange={update} required autoComplete="current-password" />
          <Button type="submit" disabled={loading}>{loading ? "Logging in…" : "Log in"}</Button>
          <p className="auth__switch">New to RecruitAI? <Link to="/register">Create an account</Link></p>
        </form>
      </main>
    </>
  );
}
