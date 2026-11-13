import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import Button from "./Button";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="nav">
      <div className="container nav__inner">
        <Link to="/" className="nav__logo" onClick={close}>
          <span className="nav__mark" aria-hidden="true" />
          RecruitAI
        </Link>

        <button
          className="nav__toggle"
          aria-expanded={open}
          aria-label="Toggle menu"
          onClick={() => setOpen(!open)}
        >
          <span /><span />
        </button>

        <nav className={`nav__links ${open ? "is-open" : ""}`}>
          <NavLink to="/" end onClick={close}>Home</NavLink>
          <NavLink to="/about" onClick={close}>About</NavLink>
          <NavLink to="/login" onClick={close}>Log in</NavLink>
          <Button to="/register" onClick={close}>Create account</Button>
        </nav>
      </div>
    </header>
  );
}
