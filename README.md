# ScholarStack App Store

A prototype demo for the ScholarStack App Store — a platform where students browse/install AI-powered educational apps, developers submit and monitor apps, and admins review submissions.

Includes **DeepReview**, a real-time voice AI study companion powered by OpenAI's Realtime API.

## Tech Stack

- React 19 + Vite
- Tailwind CSS
- React Router
- Recharts (dashboard charts)
- Lucide React (icons)
- OpenAI Realtime API (voice conversation)
- Node.js WebSocket relay server

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/qingyaoy-cmu-S25/scholarstack-appstore.git
cd scholarstack-appstore
npm install
```

### 2. Set up environment variables

Create a `.env` file in the project root:

```
OPENAI_API_KEY=sk-proj-your-key-here
```

You need an OpenAI API key with access to the Realtime API. Get one at [platform.openai.com](https://platform.openai.com).

### 3. Start the relay server

The voice feature requires a WebSocket relay server (proxies audio between browser and OpenAI):

```bash
node server.js
```

You should see: `[relay] server running on http://localhost:8081`

### 4. Start the frontend (in a separate terminal)

```bash
npm run dev
```

Then open `http://localhost:5173`.

### Running without the voice feature

If you just want to demo the App Store (no voice), skip steps 2-3 and just run `npm run dev`. Everything except DeepReview's voice conversation will work.

## Pages

| Route | Description |
|---|---|
| `/` | Role selector (Student / Developer / Admin) |
| `/student/store` | App Store — browse, search, filter apps |
| `/student/store/:appId` | App detail — permissions, reviews, install |
| `/student/apps` | My installed apps |
| `/student/apps/:appId/chat` | Chat interface with Request Trace panel |
| `/deepreview` | DeepReview — real-time voice AI study companion |
| `/developer/dashboard` | Developer dashboard — metrics, charts, errors |
| `/developer/submit` | 4-step app submission wizard |
| `/developer/apps` | Developer's published/in-review apps |
| `/admin/dashboard` | Admin dashboard — safety events, cost breakdown |
| `/admin/review` | Review queue with approve/reject |

## Demo Flow

1. **Landing** (`/`) — pick a role
2. **Student** — browse App Store → click DeepReview → install → open → voice conversation with AI tutor
3. **Developer** — observability dashboard, submit app wizard, app status tracking
4. **Admin** — safety events, cost breakdown, review queue with system prompt inspection

## Troubleshooting

**Voice not working?**
- Make sure `node server.js` is running in a separate terminal
- Make sure your `.env` file has a valid `OPENAI_API_KEY`
- Allow microphone access when the browser prompts you
- If you previously denied mic access: click the lock icon in the address bar → Microphone → Allow → refresh

**Port 8081 already in use?**
```bash
lsof -ti:8081 | xargs kill
node server.js
```
