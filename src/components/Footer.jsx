import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div>
          <strong className="footer__brand">RecruitAI</strong>
          <p>AI-led interviews and CV screening for faster, fairer hiring.</p>
        </div>
        <nav className="footer__links" aria-label="Footer">
          <Link to="/about">About</Link>
          <Link to="/login">Log in</Link>
          <Link to="/register">Register</Link>
        </nav>
      </div>
      <div className="container footer__legal">
        © {new Date().getFullYear()} RecruitAI. All rights reserved.
      </div>
    </footer>
  );
}
