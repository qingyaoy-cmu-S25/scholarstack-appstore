# ScholarStack App Store

A prototype demo for the ScholarStack App Store — a platform where students browse/install AI-powered educational apps, developers submit and monitor apps, and admins review submissions.

Built for a class presentation. All data is mocked (no backend).

## Tech Stack

- React 19 + Vite
- Tailwind CSS
- React Router
- Recharts (dashboard charts)
- Lucide React (icons)

## Getting Started

```bash
git clone https://github.com/<your-username>/scholarstack-appstore.git
cd scholarstack-appstore
npm install
npm run dev
```

Then open `http://localhost:5173`.

## Demo Flow

1. **Landing** (`/`) — pick a role: Student, Developer, or Admin
2. **Student** — browse the App Store, filter by category, view app details with permissions & model tier, install apps, and chat with an app featuring a **Request Trace** panel showing the full pipeline (auth → input filter → router → RAG → LLM → output filter)
3. **Developer** — observability dashboard with latency/request charts, 4-step app submission wizard with tool schema editor and scope warnings, and app status tracking
4. **Admin** — safety event dashboard, cost breakdown by model tier, and a review queue where you can inspect system prompts, eval results, and approve/reject apps

## Architecture Concepts Demonstrated

- **Identity & Permissions** — role-based views, OAuth-style scope requests
- **Tool Calling** — OpenAPI JSON Schema tool declarations
- **Model Routing** — Tier 1/2/3 routing based on task complexity
- **RAG** — knowledge source retrieval shown in request trace
- **Governance** — 3-step review pipeline (automated scan → human review → eval suite)
- **Observability** — latency, error rate, safety events, cost tracking
- **UX Flow** — end-to-end student experience from browse to chat
