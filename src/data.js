export const CATEGORIES = [
  "All",
  "Writing",
  "Math & Science",
  "Research",
  "Citation",
  "Code",
  "Language",
];

export const APPS = [
  {
    id: "socratic-math",
    name: "Socratic Math Tutor",
    desc: "Guides you through problems with questions, never gives direct answers",
    category: "Math & Science",
    rating: 4.8,
    users: "3.1k",
    tier: 2,
    color: "bg-indigo-500",
    initials: "SM",
    developer: "MathLab Studio",
    version: "2.1.0",
    updated: "Apr 2, 2026",
  },
  {
    id: "citation-wizard",
    name: "Citation Wizard",
    desc: "Auto-format citations in APA, MLA, or Chicago from any URL or DOI",
    category: "Citation",
    rating: 4.6,
    users: "5.2k",
    tier: 1,
    color: "bg-emerald-500",
    initials: "CW",
    developer: "RefWorks Inc.",
    version: "2.1.0",
    updated: "Apr 8, 2026",
  },
  {
    id: "writing-coach",
    name: "Writing Coach",
    desc: "Essay structure feedback with argument strength analysis",
    category: "Writing",
    rating: 4.5,
    users: "4.0k",
    tier: 2,
    color: "bg-rose-500",
    initials: "WC",
    developer: "Inkwell AI",
    version: "1.4.2",
    updated: "Mar 28, 2026",
  },
  {
    id: "latex-formatter",
    name: "LaTeX Formatter",
    desc: "Convert plain text equations to LaTeX with live preview",
    category: "Math & Science",
    rating: 4.7,
    users: "1.8k",
    tier: 1,
    color: "bg-amber-500",
    initials: "LF",
    developer: "TeXTools",
    version: "3.0.1",
    updated: "Apr 10, 2026",
  },
  {
    id: "research-synth",
    name: "Research Synthesizer",
    desc: "Summarize and compare multiple papers on a topic",
    category: "Research",
    rating: 4.4,
    users: "2.1k",
    tier: 3,
    color: "bg-sky-600",
    initials: "RS",
    developer: "Scholar AI Labs",
    version: "1.2.0",
    updated: "Apr 1, 2026",
  },
  {
    id: "code-explainer",
    name: "Code Explainer",
    desc: "Paste code, get line-by-line explanation tuned to your course",
    category: "Code",
    rating: 4.6,
    users: "3.5k",
    tier: 2,
    color: "bg-violet-600",
    initials: "CE",
    developer: "DevTutor",
    version: "2.3.1",
    updated: "Apr 6, 2026",
  },
  {
    id: "peer-review",
    name: "Peer Review Helper",
    desc: "Structured feedback templates for peer review assignments",
    category: "Writing",
    rating: 4.3,
    users: "1.2k",
    tier: 1,
    color: "bg-pink-500",
    initials: "PR",
    developer: "ClassroomTools",
    version: "1.1.0",
    updated: "Mar 24, 2026",
  },
  {
    id: "flashcard-gen",
    name: "Flashcard Generator",
    desc: "Generate spaced-repetition flashcards from your textbook chapters",
    category: "Research",
    rating: 4.5,
    users: "2.8k",
    tier: 1,
    color: "bg-teal-500",
    initials: "FG",
    developer: "MemoryLane",
    version: "1.6.0",
    updated: "Apr 5, 2026",
  },
  {
    id: "grammar-style",
    name: "Grammar & Style Checker",
    desc: "Academic writing style with discipline-specific suggestions",
    category: "Writing",
    rating: 4.4,
    users: "3.9k",
    tier: 1,
    color: "bg-lime-600",
    initials: "GS",
    developer: "Inkwell AI",
    version: "2.0.0",
    updated: "Apr 7, 2026",
  },
  {
    id: "stats-viz",
    name: "Statistics Visualizer",
    desc: "Describe your data, get R/Python code and chart recommendations",
    category: "Math & Science",
    rating: 4.2,
    users: "1.5k",
    tier: 2,
    color: "bg-orange-500",
    initials: "SV",
    developer: "DataLab",
    version: "1.3.0",
    updated: "Apr 3, 2026",
  },
];

export const PERMISSIONS = {
  "citation-wizard": [
    { scope: "read:courses", desc: "Read your enrolled course list" },
    { scope: "read:scholar_files", desc: "Read files you share with this app" },
    { scope: "write:annotations", desc: "Add annotations to your documents" },
  ],
  default: [
    { scope: "read:courses", desc: "Read your enrolled course list" },
    { scope: "read:scholar_files", desc: "Read files you share with this app" },
  ],
};

export const LONG_DESC = {
  "socratic-math": "Instead of handing you the answer, Socratic Math Tutor walks you through each step with targeted questions until you solve it yourself. It adapts to your course's notation, tracks which concepts you've mastered, and flags gaps in your reasoning — ideal for problem sets where the process matters more than the final number.",
  "citation-wizard": "Paste any URL, DOI, or ISBN and Citation Wizard instantly formats it in APA, MLA, or Chicago with proper punctuation, italics, and hanging indents. It builds a persistent library per course, exports to BibTeX, and auto-detects the style your syllabus expects.",
  "writing-coach": "Upload a draft essay and Writing Coach gives you structural feedback — thesis clarity, argument strength, evidence coverage, and paragraph cohesion. It never rewrites your sentences; it highlights weak spots and asks questions so your voice stays yours.",
  "latex-formatter": "Type equations in plain English or pseudo-math and LaTeX Formatter converts them to clean LaTeX with live preview. Supports matrices, integrals, aligned environments, and chemistry notation. Copy-paste ready for Overleaf, Word, or Markdown.",
  "research-synth": "Drop in a set of papers on a topic and Research Synthesizer extracts shared claims, contradictions, and methodological differences. It produces a comparison matrix, a thematic outline, and a list of under-explored questions — perfect for literature reviews.",
  "code-explainer": "Paste a snippet and Code Explainer walks through it line by line in the style of your course. It uses the same terminology your lectures do, flags idioms you haven't covered yet, and links each concept back to the relevant module in your syllabus.",
  "peer-review": "Peer Review Helper gives you a structured rubric — clarity, evidence, argumentation, style — so your feedback to classmates is specific and actionable. It suggests concrete comments instead of vague praise, and reminds you to balance strengths with growth areas.",
  "flashcard-gen": "Upload a chapter PDF and Flashcard Generator builds spaced-repetition cards covering the key terms, definitions, and relationships. You control difficulty and card type (cloze, Q&A, image occlusion) and export directly to Anki or stay inside ScholarStack.",
  "grammar-style": "Unlike consumer grammar tools, Grammar & Style Checker knows academic conventions: hedging, nominalizations, passive voice in methods sections, discipline-specific terminology. It flags style issues without flattening your writing into generic prose.",
  "stats-viz": "Describe your dataset in plain English and Statistics Visualizer recommends appropriate charts, hands you runnable R or Python code, and explains why each visualization fits your data type. Great for labs where you need to justify your choices, not just copy them.",
};

export const APP_REVIEWS = {
  "socratic-math": [
    { user: "Diego R.", stars: 5, text: "Finally a tutor that makes me think. I was stuck on systems of equations for a week and one session here cracked it open." },
    { user: "Amina S.", stars: 5, text: "The progress tracker is clutch for exam prep — you actually see which topics are weak instead of guessing." },
    { user: "Lukas B.", stars: 4, text: "Sometimes the hints are a bit too vague at first, but once you get the rhythm it's the best study tool I've used." },
  ],
  "citation-wizard": [
    { user: "Maya P.", stars: 5, text: "Saved me hours on my literature review. The DOI lookup is flawless." },
    { user: "Jordan K.", stars: 4, text: "Great for APA. Wish it supported more obscure styles, but coverage is solid." },
    { user: "Riley T.", stars: 5, text: "Honestly the cleanest citation tool I've used in college. Worth installing." },
  ],
  "writing-coach": [
    { user: "Priya N.", stars: 5, text: "It pointed out that my thesis didn't actually match my conclusion — three drafts and no one else had caught it." },
    { user: "Marcus L.", stars: 4, text: "Feedback is way more useful than the TA comments I usually get. Only wish it handled creative writing better." },
    { user: "Hana K.", stars: 5, text: "I love that it doesn't rewrite anything. It asks questions and the essay stays mine." },
  ],
  "latex-formatter": [
    { user: "Theo W.", stars: 5, text: "Typing matrices in plain text and getting clean LaTeX back is magic. Cut my homework time in half." },
    { user: "Yuki T.", stars: 5, text: "The live preview catches bracket mistakes immediately. Wish I'd had this freshman year." },
    { user: "Sam O.", stars: 4, text: "Works perfectly for calc and linear algebra. Chemistry notation is a little hit or miss." },
  ],
  "research-synth": [
    { user: "Elena V.", stars: 4, text: "The contradictions matrix is genuinely useful — helped me find a gap for my thesis topic I hadn't seen." },
    { user: "Raj P.", stars: 5, text: "Synthesized 12 papers for my lit review in an afternoon. I still had to read them but the outline was a lifesaver." },
    { user: "Claire M.", stars: 4, text: "Great for STEM papers. A bit weaker when the sources are humanities-heavy and argument-driven." },
  ],
  "code-explainer": [
    { user: "Oliver H.", stars: 5, text: "It explains recursion using the same framing our professor uses. That alone is worth installing." },
    { user: "Zoe F.", stars: 4, text: "Caught an off-by-one error I'd been staring at for an hour. Also taught me what a generator was." },
    { user: "Kenji I.", stars: 5, text: "Finally an explainer that doesn't assume I already know everything. It meets you where you are." },
  ],
  "peer-review": [
    { user: "Ava C.", stars: 4, text: "My peer reviews are way more useful now. The rubric keeps me from writing 'good job' five times." },
    { user: "Nate D.", stars: 4, text: "Helped me balance critique with actual encouragement. My partner said it was the best feedback they got." },
    { user: "Inés G.", stars: 5, text: "Love the specific comment suggestions. I tweak them instead of starting from scratch." },
  ],
  "flashcard-gen": [
    { user: "Mei Lin", stars: 5, text: "Generated 80 cards from one chapter in seconds. The cloze deletions are exactly what I'd make by hand." },
    { user: "Tomás A.", stars: 4, text: "Anki export works great. Occasionally picks weird terms to highlight but easy to prune." },
    { user: "Jade W.", stars: 5, text: "Perfect for bio memorization. Built me a full deck for the final and I scored my best yet." },
  ],
  "grammar-style": [
    { user: "Harper J.", stars: 4, text: "Actually knows what nominalizations are. Consumer grammar tools just don't." },
    { user: "Noah B.", stars: 4, text: "Tightened up my methods section without making it sound robotic. Good balance." },
    { user: "Simone P.", stars: 5, text: "Caught passive voice where it belonged and flagged it where it didn't. Finally a tool that gets academic writing." },
  ],
  "stats-viz": [
    { user: "Felix K.", stars: 4, text: "The 'why this chart' explanations are the best part. I can actually defend my choices in the report." },
    { user: "Rina S.", stars: 5, text: "Gave me ggplot code that dropped straight into my R Markdown. No debugging needed." },
    { user: "Owen G.", stars: 4, text: "Solid recommendations. Sometimes it suggests a fancy chart when a boring bar chart would do." },
  ],
};

export const REVIEWS = APP_REVIEWS["citation-wizard"];

export const TRACE_STEPS = [
  { icon: "✅", name: "Auth Check", time: "2ms", desc: "Student role, valid token", color: "text-emerald-600" },
  { icon: "✅", name: "Input Filter", time: "15ms", desc: "No injection detected, no PII", color: "text-emerald-600" },
  { icon: "🔀", name: "Router", time: "5ms", desc: "→ Tier 1 (Haiku) — citation formatting task", color: "text-blue-600" },
  { icon: "📚", name: "RAG", time: "48ms", desc: "Hit: APA Style Guide (shared KB) — relevance 0.94", color: "text-violet-600" },
  { icon: "🤖", name: "LLM", time: "280ms", desc: "Haiku · 320 in / 85 out tokens", color: "text-blue-600" },
  { icon: "✅", name: "Output Filter", time: "8ms", desc: "No PII, no harmful content", color: "text-emerald-600" },
  { icon: "📦", name: "Response", time: "3ms", desc: "Delivered to client", color: "text-emerald-600" },
];

export const REQUESTS_BY_TIER = [
  { day: "Mon", "Tier 1": 420, "Tier 2": 220, "Tier 3": 60 },
  { day: "Tue", "Tier 1": 480, "Tier 2": 260, "Tier 3": 70 },
  { day: "Wed", "Tier 1": 510, "Tier 2": 280, "Tier 3": 90 },
  { day: "Thu", "Tier 1": 460, "Tier 2": 240, "Tier 3": 80 },
  { day: "Fri", "Tier 1": 520, "Tier 2": 300, "Tier 3": 100 },
  { day: "Sat", "Tier 1": 380, "Tier 2": 200, "Tier 3": 50 },
  { day: "Sun", "Tier 1": 360, "Tier 2": 190, "Tier 3": 45 },
];

export const LATENCY_DATA = [
  { day: "Mon", p50: 320, p95: 780 },
  { day: "Tue", p50: 340, p95: 810 },
  { day: "Wed", p50: 350, p95: 830 },
  { day: "Thu", p50: 330, p95: 790 },
  { day: "Fri", p50: 360, p95: 850 },
  { day: "Sat", p50: 310, p95: 760 },
  { day: "Sun", p50: 340, p95: 800 },
];

export const DEV_ERRORS = [
  { id: "trace_a8f3c1", time: "2 min ago", error: "Tool call timeout", tier: "Tier 2", status: "🔍 Investigating" },
  { id: "trace_7bc412", time: "15 min ago", error: "RAG retrieval empty", tier: "Tier 1", status: "✅ Resolved" },
  { id: "trace_e9d201", time: "1 hr ago", error: "Output filter blocked (PII)", tier: "Tier 3", status: "✅ Auto-resolved" },
];

export const DEV_APPS = [
  { id: "socratic-math", name: "Socratic Math Tutor", status: "published", installs: "3.1k" },
  { id: "latex-formatter", name: "LaTeX Formatter", status: "published", installs: "1.8k" },
  { id: "equation-pro", name: "Equation Solver Pro", status: "review", step: "Step 2/3: Human Policy Review" },
  { id: "homework-helper", name: "Homework Helper", status: "rejected", reason: "Academic integrity: generates complete answers instead of guidance" },
];

export const SAFETY_EVENTS = [
  { time: "5 min ago", app: "Code Explainer", event: "Prompt injection attempt", layer: "Input Filter", action: "Blocked" },
  { time: "12 min ago", app: "Writing Coach", event: "PII in output", layer: "Output Filter", action: "Redacted" },
  { time: "30 min ago", app: "Research Synthesizer", event: "Excessive tokens", layer: "Processing", action: "Rate limited" },
  { time: "1 hr ago", app: "Flashcard Generator", event: "Off-topic request", layer: "Input Filter", action: "Blocked" },
];

export const SAFETY_EVENTS_CHART = [
  { day: "Mon", flagged: 24, blocked: 12 },
  { day: "Tue", flagged: 30, blocked: 16 },
  { day: "Wed", flagged: 28, blocked: 14 },
  { day: "Thu", flagged: 35, blocked: 20 },
  { day: "Fri", flagged: 38, blocked: 22 },
  { day: "Sat", flagged: 18, blocked: 9 },
  { day: "Sun", flagged: 16, blocked: 8 },
];

export const COST_BY_TIER = [
  { name: "Tier 1", value: 15 },
  { name: "Tier 2", value: 35 },
  { name: "Tier 3", value: 50 },
];

export const REVIEW_QUEUE = [
  {
    id: "socratic-math-v3",
    name: "Socratic Math Tutor v3.0",
    developer: "MathLab Studio",
    submitted: "Apr 12, 2026",
    progress: { auto: "passed", human: "pending", eval: "not_started" },
    tier: 2,
    scopes: ["read:courses", "read:scholar_files", "write:annotations"],
    sensitive: [],
    systemPrompt: `You are a Socratic math tutor. Guide students through problems by asking leading questions. Never provide direct answers. Always encourage the student to think through each step.`,
    toolSchema: `{
  "name": "check_step",
  "description": "Validate a student's intermediate step",
  "parameters": {
    "expression": { "type": "string" },
    "expected": { "type": "string" }
  }
}`,
    evalResults: null,
  },
  {
    id: "essay-graderx",
    name: "Essay Grader X",
    developer: "WriteLab",
    submitted: "Apr 11, 2026",
    progress: { auto: "passed", human: "passed", eval: "failed" },
    tier: 3,
    scopes: ["read:courses", "read:scholar_files", "read:grades", "write:submissions"],
    sensitive: ["read:grades", "write:submissions"],
    systemPrompt: `You are an essay grading assistant. Provide rubric-based feedback on student essays.`,
    toolSchema: `{
  "name": "grade_essay",
  "description": "Apply a rubric to an essay and return per-criterion scores",
  "parameters": {
    "essay_text": { "type": "string" },
    "rubric_id": { "type": "string" }
  }
}`,
    evalResults: {
      passed: 18,
      total: 20,
      failures: [
        { case: "jailbreak_resistance_02", desc: "Model bypassed safety prompt when given nested injection" },
        { case: "scope_boundary_05", desc: "App attempted to access grades without scope" },
      ],
    },
  },
  {
    id: "lab-report-coach",
    name: "Lab Report Coach",
    developer: "SciHelp",
    submitted: "Apr 10, 2026",
    progress: { auto: "passed", human: "passed", eval: "passed" },
    tier: 2,
    scopes: ["read:courses", "read:scholar_files"],
    sensitive: [],
    systemPrompt: `You are a lab report writing assistant. Help students structure their methods, results, and discussion sections.`,
    toolSchema: `{
  "name": "outline_section",
  "description": "Generate an outline for a lab report section",
  "parameters": { "section": { "type": "string" } }
}`,
    evalResults: { passed: 20, total: 20, failures: [] },
  },
];
