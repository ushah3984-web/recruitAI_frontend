/**
 * Browser-persisted mock database (localStorage). It mirrors the entities of the SDS data dictionary
 * (users, job_profiles, job_competencies, applications, match_results, interview_sessions, consent_records,
 * interview_questions, candidate_responses, response_evaluations, competency_assessments,
 * behavioral_indicators, session_events, recordings, evaluation_reports, audit_logs) in nested form.
 * It is replaced by the FastAPI/PostgreSQL backend later; only src/api/services.js talks to it.
 */
import { assessCompetency, buildReportSummary, extractCvEntities, scoreMatch } from "./aiMock";

const KEY = "recruitai_db_v2";
const listeners = new Set();
let state = null;

export const uid = (p) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
const ago = (days, hours = 0) => new Date(Date.now() - days * 864e5 - hours * 36e5).toISOString();

/* ------------------------------- seed data -------------------------------- */

function job(id, title, status, th, quota, tech, exp, qual, comps, daysAgo, description) {
  return {
    id, recruiterId: "u_recruiter", title, description, technicalRequirements: tech, experienceRequirements: exp,
    qualifications: qual, shortlistThreshold: th, competencyQuota: quota, status, createdAt: ago(daysAgo),
    competencies: comps.map(([name, desc], i) => ({ id: `${id}_c${i + 1}`, name, description: desc, sequenceNo: i + 1 })),
  };
}

const ANSWERS = {
  high: (c) => `For ${c}, I started by defining clear requirements and then designed the solution around them. For example, I used an index on the hot query path, added a cache to cut latency, and wrote automated tests for each endpoint. The trade-off was extra complexity, but it was worth it because load tests showed throughput doubling. As a result the deployment was stable.`,
  medium: (c) => `In my project on ${c} I built the main feature using the standard tools and tested it manually. It worked well for the expected load and I fixed a few bugs found by the team during review.`,
  low: (c) => `I have worked on ${c} a bit and it was fine.`,
};
const SCORES = { high: [0.88, 0.84, 0.8], medium: [0.66, 0.62, 0.52], low: [0.4, 0.36, 0.28] };

function seedSession({ id, appId, candidateName, j, levels, startedDaysAgo, indicators, events, followUpOn = [] }) {
  const start = new Date(ago(startedDaysAgo)).getTime();
  const questions = []; let cursor = 8000; let seq = 1;
  const comps = j.competencies.slice(0, j.competencyQuota);
  comps.forEach((c, i) => {
    const lvl = levels[i];
    const ask = (type, text, parentId, level) => {
      const qid = `${id}_q${seq}`;
      const dur = 30000 + (seq % 3) * 15000;
      const [relevance, correctness, depth] = SCORES[level];
      questions.push({
        id: qid, competencyId: c.id, type, parentId: parentId || null, seq: seq++, text,
        askedAt: new Date(start + cursor).toISOString(),
        response: {
          transcript: ANSWERS[level](c.name), startMs: cursor + 4000, endMs: cursor + 4000 + dur,
          evaluation: { relevance, correctness, depth, sufficient: level !== "low", rationale: level === "low" ? "The answer is very short, so there is not enough detail to judge the competency." : level === "medium" ? "The answer is relevant but stays at a high level; the reasoning is not fully explained." : "The answer is relevant, technically specific and explains the reasoning behind the choices." },
        },
      });
      cursor += dur + 9000;
      return qid;
    };
    const q1 = ask("initial", `Your résumé mentions ${["Python", "PostgreSQL", "Docker"][i % 3]}. For the competency "${c.name}", walk me through a situation where you used it and the key decisions you made.`, null, lvl);
    if (lvl === "low" || followUpOn.includes(i)) {
      ask("follow_up", `Thanks. I'd like to hear more about the reasoning and trade-offs behind your choices for "${c.name}". Could you give a concrete example?`, q1, lvl === "low" ? "medium" : "high");
    }
  });
  const assessments = comps.map((c) => assessCompetency(questions, c));
  const followUps = questions.filter((q) => q.type === "follow_up").length;
  const endMs = cursor + 5000;
  return {
    id, applicationId: appId, status: "completed",
    startedAt: new Date(start).toISOString(), endedAt: new Date(start + endMs).toISOString(), durationMs: endMs,
    consent: { granted: true, decidedAt: new Date(start - 20000).toISOString() },
    questions, assessments, indicators, events,
    recordings: [
      { type: "screen", status: "complete", durationMs: endMs, sizeBytes: 41_000_000 + endMs * 12, chunks: Math.ceil(endMs / 5000), retentionExpiresAt: ago(-90 + startedDaysAgo) },
      { type: "webcam", status: "complete", durationMs: endMs, sizeBytes: 28_000_000 + endMs * 9, chunks: Math.ceil(endMs / 5000), retentionExpiresAt: ago(-90 + startedDaysAgo) },
    ],
    report: {
      generatedAt: new Date(start + endMs + 60000).toISOString(),
      summary: buildReportSummary({ candidateName, jobTitle: j.title, assessments, competencies: j.competencies, followUps }),
    },
  };
}

function seed() {
  const users = [
    { id: "u_admin", name: "Admin User", email: "admin@recruitai.demo", password: "Admin@123", role: "admin", status: "active", createdAt: ago(60) },
    { id: "u_recruiter", name: "Hira Qureshi", email: "recruiter@recruitai.demo", password: "Recruiter@123", role: "recruiter", status: "active", createdAt: ago(55) },
    { id: "u_demo", name: "Sara Malik", email: "candidate@recruitai.demo", password: "Candidate@123", role: "candidate", status: "active", createdAt: ago(30) },
    { id: "u_a", name: "Ayesha Khan", email: "ayesha.khan@example.com", password: "Candidate@123", role: "candidate", status: "active", createdAt: ago(28) },
    { id: "u_c", name: "Bilal Ahmed", email: "bilal.ahmed@example.com", password: "Candidate@123", role: "candidate", status: "active", createdAt: ago(27) },
    { id: "u_d", name: "Hamza Raza", email: "hamza.raza@example.com", password: "Candidate@123", role: "candidate", status: "active", createdAt: ago(26) },
    { id: "u_e", name: "Noor Fatima", email: "noor.fatima@example.com", password: "Candidate@123", role: "candidate", status: "active", createdAt: ago(25) },
    { id: "u_f", name: "Zain Ali", email: "zain.ali@example.com", password: "Candidate@123", role: "candidate", status: "disabled", createdAt: ago(24) },
    { id: "u_g", name: "Maryam Siddiqui", email: "maryam.siddiqui@example.com", password: "Candidate@123", role: "candidate", status: "active", createdAt: ago(23) },
    { id: "u_recruiter2", name: "Omar Sheikh", email: "omar.sheikh@example.com", password: "Recruiter@123", role: "recruiter", status: "active", createdAt: ago(40) },
  ];

  const jobs = [
    job("j1", "Backend Developer", "published", 0.65, 3, "Python, FastAPI, PostgreSQL, REST APIs, Docker, Git, Testing", "2+ years building and deploying backend services", "BS in Computer Science or equivalent", [
      ["REST API Design", "Designing, versioning and securing REST endpoints"],
      ["Database Design & SQL", "Schema design, indexing and query optimisation in PostgreSQL"],
      ["Testing & Deployment", "Automated testing, containers and CI/CD"],
      ["System Design & Scalability", "Caching, queues and horizontal scaling"],
    ], 20, "Build and maintain the services behind our hiring products."),
    job("j2", "Data Analyst", "published", 0.6, 3, "SQL, Python, Pandas, Power BI, Excel, Statistics, Data Visualization", "1+ year in an analytics role", "BS in Statistics, Data Science or a related field", [
      ["SQL Analysis", "Writing analytical queries and joins"],
      ["Data Visualization", "Dashboards and communicating insights"],
      ["Statistics", "Hypothesis testing and interpretation"],
    ], 15, "Turn operational data into decisions for business teams."),
    job("j3", "Frontend Developer", "published", 0.6, 2, "React, TypeScript, JavaScript, HTML/CSS, Testing, Git", "2+ years building web interfaces", "BS in Computer Science or equivalent", [
      ["Component Architecture", "Structuring reusable React components and state"],
      ["Web Performance & Accessibility", "Rendering performance and WCAG basics"],
    ], 6, "Build accessible, fast interfaces for recruiters and candidates."),
    job("j4", "DevOps Engineer", "draft", 0.7, 2, "Linux, Docker, Kubernetes, AWS, CI/CD", "3+ years in infrastructure roles", "Relevant certification preferred", [
      ["Containers & Orchestration", "Docker and Kubernetes in production"],
      ["CI/CD Pipelines", "Automating build, test and release"],
    ], 2, "Own the delivery pipeline and cloud infrastructure."),
  ];
  const j1 = jobs[0];

  const mkApp = (id, jobId, candId, name, fileName, score, shortlisted, status, daysAgo, sessionId = null) => {
    const entities = extractCvEntities(fileName, 120000 + score * 1000);
    const m = scoreMatch(entities, jobs.find((j) => j.id === jobId), { jitterSeed: id });
    m.similarityScore = score; m.shortlisted = shortlisted;
    return {
      id, jobId, candidateId: candId, candidateName: name, status, submittedAt: ago(daysAgo), sessionId,
      resume: { fileName, fileFormat: fileName.endsWith(".docx") ? "DOCX" : "PDF", sizeBytes: 120000, entities },
      match: m,
    };
  };
  const applications = [
    mkApp("a1", "j1", "u_a", "Ayesha Khan", "ayesha_khan_python_fastapi.pdf", 0.82, true, "shortlisted", 14, "s1"),
    mkApp("a2", "j1", "u_demo", "Sara Malik", "sara_malik_cv.pdf", 0.74, true, "shortlisted", 13),
    mkApp("a3", "j1", "u_c", "Bilal Ahmed", "bilal_ahmed_resume.docx", 0.69, true, "shortlisted", 12, "s2"),
    mkApp("a4", "j1", "u_d", "Hamza Raza", "hamza_raza_cv.pdf", 0.41, false, "not_shortlisted", 11),
    mkApp("a5", "j1", "u_e", "Noor Fatima", "noor_fatima_postgres_docker.pdf", 0.77, true, "shortlisted", 10, "s3"),
    mkApp("a6", "j1", "u_f", "Zain Ali", "zain_ali_cv.pdf", 0.58, false, "not_shortlisted", 9),
    mkApp("a7", "j1", "u_g", "Maryam Siddiqui", "maryam_siddiqui_resume.pdf", 0.66, true, "shortlisted", 8),
    mkApp("a8", "j2", "u_demo", "Sara Malik", "sara_malik_cv.pdf", 0.38, false, "not_shortlisted", 7),
    mkApp("a9", "j2", "u_d", "Hamza Raza", "hamza_raza_cv.pdf", 0.71, true, "shortlisted", 6),
  ];

  const sessions = [
    seedSession({
      id: "s1", appId: "a1", candidateName: "Ayesha Khan", j: j1, levels: ["high", "high", "medium"], startedDaysAgo: 5,
      indicators: [
        { type: "head_movement", description: "Frequent head movement while speaking", startMs: 42000, endMs: 50000 },
        { type: "hands_gestures", description: "Hands visible while explaining", startMs: 95000, endMs: 104000 },
        { type: "posture", description: "Upright posture with minor shifts", startMs: 160000, endMs: 172000 },
      ],
      events: [{ type: "screen_sharing_stopped", offsetMs: 185000, details: "Screen sharing was stopped for about 5 seconds and resumed." }],
    }),
    seedSession({
      id: "s2", appId: "a3", candidateName: "Bilal Ahmed", j: j1, levels: ["medium", "low", "high"], startedDaysAgo: 4,
      indicators: [
        { type: "gaze_direction", description: "Gaze directed away from the camera for several seconds", startMs: 30000, endMs: 41000 },
        { type: "in_frame", description: "Not significantly visible in frame", startMs: 130000, endMs: 142000 },
        { type: "head_movement", description: "Frequent head movement while speaking", startMs: 210000, endMs: 218000 },
      ],
      events: [],
    }),
    seedSession({
      id: "s3", appId: "a5", candidateName: "Noor Fatima", j: j1, levels: ["high", "medium", "high"], startedDaysAgo: 3, followUpOn: [1],
      indicators: [
        { type: "facial_expression", description: "Face visible and centred in the frame", startMs: 12000, endMs: 20000 },
        { type: "posture", description: "Upright posture with minor shifts", startMs: 120000, endMs: 131000 },
      ],
      events: [],
    }),
  ];

  const audit = [
    ["u_recruiter", "Hira Qureshi", "Logged in", "user", "u_recruiter", 1],
    ["u_recruiter", "Hira Qureshi", "Viewed report", "report", "s1", 1],
    ["u_recruiter", "Hira Qureshi", "Played recording", "recording", "s1", 1],
    ["u_a", "Ayesha Khan", "Submitted interview consent", "session", "s1", 5],
    ["u_a", "Ayesha Khan", "Completed interview session", "session", "s1", 5],
    ["u_admin", "Admin User", "Disabled account", "user", "u_f", 9],
  ].map((r, i) => ({ id: `l_${i}`, userId: r[0], userName: r[1], action: r[2], entityType: r[3], entityId: r[4], details: "", createdAt: ago(r[5], i) }));

  return { version: 2, users, jobs, applications, sessions, audit };
}

/* --------------------------------- store ---------------------------------- */

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* fall through to seed */ }
  return seed();
}
function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage full or unavailable: keep in memory */ }
}

export function getState() {
  if (!state) state = load();
  return state;
}
export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

/** Apply a mutation to a deep copy so React sees a new reference. */
export function mutate(fn) {
  const next = structuredClone(getState());
  const result = fn(next);
  state = next; persist();
  listeners.forEach((l) => l());
  return result;
}
export function resetDb() {
  state = seed(); persist();
  listeners.forEach((l) => l());
}
