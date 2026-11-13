import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";
import "./Auth.css";

export default function About() {
  return (
    <>
      <Navbar />
      <main className="section">
        <div className="container about">
          <h1>Hiring that gives every applicant a fair first interview</h1>
          <p>
            Hiring teams receive far more applications than they can interview. Strong candidates
            are often lost simply because nobody had time to talk to them.
          </p>
          <p>
            RecruitAI processes each CV, then lets candidates complete an AI-led interview whenever
            suits them. Organizations get scores and evaluations side by side, so decisions are made
            on what candidates said rather than how quickly they applied.
          </p>
          <Button to="/register">Get started</Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
