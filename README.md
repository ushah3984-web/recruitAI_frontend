# RecruitAI – Frontend (FYP 23F-12)

React + Vite frontend for *RecruitAI: An AI-Powered Adaptive Interview Platform for Recruitment Screening*, built against the Software Design Specification (SDS).

```bash
npm install
npm run dev      # development
npm run build    # production build
npm run lint
```

## Demo accounts (mock backend, no server needed)
| Role | Email | Password |
|---|---|---|
| Recruiter | recruiter@recruitai.demo | Recruiter@123 |
| Candidate | candidate@recruitai.demo | Candidate@123 |
| Administrator | admin@recruitai.demo | Admin@123 |

Administrators can restore seed data from **User Accounts → Reset demo data**.

## Portals (SDS §9)
- **Public:** landing page, about, login, registration (Candidate / Recruiter).
- **Recruiter:** job postings, create/edit job profile, candidate ranking with skill-gap profile, reports, evaluation report with synchronised playback and export, candidate comparison with export.
- **Candidate:** open jobs and résumé upload (PDF/DOCX), application status, consent screen, interview room (browser capture module).
- **Administrator:** user accounts and roles, audit log.

## Structure
- `src/api/services.js` – application-layer boundary (JobProfileService, ResumeService, InterviewSessionManager, RecordingIngest, ReportGenerator, AuditLogger). Replace its bodies with `fetch`/WebSocket calls to FastAPI; pages do not change.
- `src/api/auth.js` – set `VITE_API_URL` to use a real `/auth/login` and `/auth/register`.
- `src/api/db.js` – localStorage mock database and seed data. `src/api/aiMock.js` – heuristic stand-ins for the AI services.
- `src/portal/*` – role pages; `src/components/*` – shared UI; `src/hooks/useCapture.js` – getUserMedia / getDisplayMedia / MediaRecorder.

## What is mocked (needs backend/AI work)
CV parsing, embeddings/cosine matching, question generation, answer scoring and behavioral indicators are deterministic heuristics (`aiMock.js`). Passwords and RBAC are enforced only in the browser. Recording chunks are counted, not uploaded; report playback is simulated. Data lives in each browser's localStorage. Report export is HTML (printable to PDF); comparison export is CSV.
