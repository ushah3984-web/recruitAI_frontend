import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Input from "../components/Input";
import Button from "../components/Button";
import { registerUser, saveSession, homeForRole } from "../api/auth";
import "./Auth.css";

const roles = [
  { value: "candidate", title: "Candidate", text: "Apply for jobs and take AI interviews" },
  { value: "organization", title: "Organization", text: "Post jobs and review candidates" },
];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ role: "candidate", name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    if (form.password !== form.confirm) return setError("Passwords do not match.");
    setLoading(true);
    try {
      const { confirm, ...payload } = form;
      const data = await registerUser(payload);
      saveSession(data);
      navigate(homeForRole(data.user.role));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isOrg = form.role === "organization";

  return (
    <>
      <Navbar />
      <main className="auth">
        <form className="auth__card" onSubmit={submit}>
          <h1>Create your account</h1>
          <fieldset className="roles">
            <legend>I am a</legend>
            {roles.map((r) => (
              <label key={r.value} className={`roles__opt ${form.role === r.value ? "is-selected" : ""}`}>
                <input type="radio" name="role" value={r.value} checked={form.role === r.value} onChange={update} />
                <strong>{r.title}</strong>
                <span>{r.text}</span>
              </label>
            ))}
          </fieldset>
          {error && <div className="auth__alert" role="alert">{error}</div>}
          <Input label={isOrg ? "Organization name" : "Full name"} name="name" value={form.name} onChange={update} required />
          <Input label="Email" type="email" name="email" value={form.email} onChange={update} required autoComplete="email" />
          <Input label="Password" type="password" name="password" value={form.password} onChange={update} required autoComplete="new-password" />
          <Input label="Confirm password" type="password" name="confirm" value={form.confirm} onChange={update} required autoComplete="new-password" />
          <Button type="submit" disabled={loading}>{loading ? "Creating account…" : "Create account"}</Button>
          <p className="auth__switch">Already registered? <Link to="/login">Log in</Link></p>
        </form>
      </main>
    </>
  );
}
