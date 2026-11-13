import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";
import "./Home.css";

const steps = [
  { title: "Post a job", text: "Organizations describe the role and the skills that matter." },
  { title: "Candidates apply", text: "Candidates upload a CV and apply from their own portal." },
  { title: "CV is processed", text: "The CV is parsed and matched against the job requirements." },
  { title: "AI interview", text: "Shortlisted candidates take an interview on their own schedule." },
  { title: "Review results", text: "Teams compare scores and evaluations, then decide who moves on." },
];

const orgFeatures = [
  "Create, edit and manage job listings",
  "View and shortlist candidates in one place",
  "Read interview results and evaluations",
];
const candFeatures = [
  "Build a profile and upload your CV once",
  "Browse jobs and apply in a few clicks",
  "Take the AI interview and see your results",
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {/* HERO */}
        <section className="hero">
          <div className="container hero__grid">
            <div className="hero__copy">
              <h1>Interview every applicant, not just the ones who made the first cut.</h1>
              <p className="hero__lead">
                RecruitAI reads CVs and runs the first interview for you, so your team only spends
                time on candidates who are ready for a conversation.
              </p>
              <div className="hero__cta">
                <Button to="/register">Start hiring</Button>
                <Button to="/register" variant="secondary">Find a job</Button>
              </div>
            </div>

            {/* Interview preview */}
            <div className="session" aria-label="Example AI interview">
              <div className="session__bar">
                <span className="session__live" /> Interview in progress
                <span className="session__time">04:12</span>
              </div>
              <p className="session__q">
                Tell me about a project where the requirements changed halfway through. What did you do?
              </p>
              <div className="session__wave" aria-hidden="true">
                {Array.from({ length: 28 }).map((_, i) => (
                  <i key={i} style={{ height: `${20 + ((i * 37) % 70)}%` }} />
                ))}
              </div>
              <div className="session__scores">
                <div><span>Relevance</span><b style={{ "--w": "82%" }} /></div>
                <div><span>Clarity</span><b style={{ "--w": "74%" }} /></div>
                <div><span>Depth</span><b style={{ "--w": "66%" }} /></div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="section">
          <div className="container">
            <h2>From job post to shortlist in five steps</h2>
            <ol className="steps">
              {steps.map((s, i) => (
                <li key={s.title}>
                  <span className="steps__n">{i + 1}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* TWO PORTALS */}
        <section className="section section--tint">
          <div className="container portals">
            <article className="portal portal--org">
              <h2>For organizations</h2>
              <ul>{orgFeatures.map((f) => <li key={f}>{f}</li>)}</ul>
              <Button to="/register" variant="secondary">Register your organization</Button>
            </article>
            <article className="portal portal--cand">
              <h2>For candidates</h2>
              <ul>{candFeatures.map((f) => <li key={f}>{f}</li>)}</ul>
              <Button to="/register">Create your profile</Button>
            </article>
          </div>
        </section>

        {/* CTA */}
        <section className="section cta">
          <div className="container">
            <h2>Ready to run your first AI interview?</h2>
            <Button to="/register" variant="secondary">Create an account</Button>
            <p className="cta__login">Already registered? <Link to="/login">Log in</Link></p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
