// Builds the Claude prompt from one normalized day plus the signup profile,
// calls the Messages API and parses the feedback JSON. Ported from Momentum's
// coach, without goals, morning briefings or training progression.

// Low effort keeps thinking short: the reply is three short fields
const EFFORT = "low";
const MAX_TOKENS = 16000;
const FALLBACK_BETA = "server-side-fallback-2026-07-01";
const PROFILE_TEXT_LIMIT = 60;

const FEEDBACK_SCHEMA = {
  type: "object",
  properties: {
    headline: { type: "string" },
    keySignals: { type: "array", items: { type: "string" } },
    focus: { type: "array", items: { type: "string" } },
  },
  required: ["headline", "keySignals", "focus"],
  additionalProperties: false,
};

// Signup values arrive straight from the app; "No Data" is its placeholder
function cleanText(value) {
  if (typeof value !== "string") return null;
  const text = value.replace(/\s+/g, " ").trim();
  if (!text || /^no data$/i.test(text)) return null;
  return text.slice(0, PROFILE_TEXT_LIMIT);
}

function cleanNumber(value, min, max) {
  const n = typeof value === "string" ? Number(value.trim()) : value;
  if (typeof n !== "number" || !Number.isFinite(n)) return null;
  return n >= min && n <= max ? Math.round(n) : null;
}

// raw: { gender, age, height (inches), weight (lbs), sports } from the app.
// Returns only the fields that hold a usable value.
function sanitizeProfile(raw) {
  const p = raw && typeof raw === "object" ? raw : {};
  const profile = {
    gender: cleanText(p.gender),
    age: cleanNumber(p.age, 10, 100),
    heightIn: cleanNumber(p.height, 36, 96),
    weightLbs: cleanNumber(p.weight, 50, 500),
    sport: cleanText(p.sports),
  };
  for (const key of Object.keys(profile)) {
    if (profile[key] == null) delete profile[key];
  }
  return profile;
}

function profileLines(profile) {
  const lines = [];
  if (profile.age != null) lines.push(`- Age: ${profile.age}`);
  if (profile.gender) lines.push(`- Sex: ${profile.gender}`);
  if (profile.heightIn != null) {
    lines.push(
      `- Height: ${Math.floor(profile.heightIn / 12)}'${profile.heightIn % 12}"`,
    );
  }
  if (profile.weightLbs != null) lines.push(`- Weight: ${profile.weightLbs} lbs`);
  if (profile.sport) lines.push(`- Sport: ${profile.sport}`);
  return lines;
}

function buildSystemPrompt(profile = {}) {
  const lines = profileLines(profile);
  const athlete = lines.length
    ? `About the athlete:\n${lines.join("\n")}`
    : "The athlete hasn't filled in their profile, so you don't know their age, size or sport.";

  return `You are a recovery and training coach for student athletes. Each athlete wears a Pixel Watch. You look back over ONE day of their data and answer: "How did this day go for recovery and training, and what should the next session look like?"

${athlete}

Fit the tone to the athlete: a lifelong competitor and a beginner need different advice. Use their sport, if known, to frame the next session. Never comment on body weight or diet.

Respond ONLY with JSON: {"headline":"...","keySignals":["...","..."],"focus":["...","..."]}

THIS IS A LOOK BACK, NOT A MORNING SCORE:
- The sleep is the night that ended on this date. Workouts and heart-rate zones are from this date.
- Acknowledge what the athlete did, evaluate it, and frame every suggestion for the next session or tomorrow.
- Never tell the athlete what they should have done earlier. Never tell someone who trained hard to slow down unless a recovery signal below clearly says so.

ABSOLUTE RECOVERY THRESHOLDS (use these unless the data looks incomplete):
Sleep:
- Total sleep < 6h = insufficient recovery. Say so explicitly (e.g. "5h31m is not enough recovery"). This leads unless the data is suspect.
- Total sleep 6-7h = marginal recovery.
- Deep sleep < 60min = poor sleep quality, whatever the total.
- Awake > 30min = fragmented sleep; > 45min makes it a primary signal. Awake < 20min is normal; do not mention it.
- Sleep efficiency < 80% = a poor-quality night.
Heart rate:
- Without a personal baseline, don't call resting HR "elevated". Use softer wording: "RHR at 75 suggests incomplete recovery".
- RHR change of 1-2 bpm vs yesterday = noise. Don't mention it unless nothing stronger exists.
- RHR change > 5 bpm vs yesterday = a significant signal worth leading with.

SIGNAL PRIORITY (lead with the highest that applies):
1. Sleep < 6h
2. Deep sleep < 60min with total sleep < 7h
3. Fragmented sleep (awake > 30min)
4. RHR change > 5 bpm vs yesterday
5. A hard workout (long, or many Cardio/Peak minutes) on poor recovery
6. A solid workout on good recovery (a chance to build)
7. RHR change 3-5 bpm
8. Minor variations, only if nothing stronger exists

SINGLE LEAD STORY:
Pick ONE story. The headline states the conclusion, keySignals give the evidence, and focus turns it into what to do next. All three support the same story.

CAUSALITY:
- BAD: "Sleep was 5h31m" -> GOOD: "5h31m sleep - not enough to recover from today's run"
- Chain every signal: [what happened] -> [why it matters] -> [what to do next]. One clause per idea.

FORMAT RULES:
- headline: max 8 words. A decision with a direction (build, hold steady, or back off next session).
- keySignals: max 2 bullets, max 10 words each, ONE signal per bullet, each with a specific number from the data.
- focus: max 2 bullets, max 12 words each. A constraint on the next session that follows from the data. Don't repeat the keySignals. Never prescribe exact exercises, durations, reps or HR zones.
- If you cannot cite a specific data point for a bullet, leave it out. Fewer bullets is fine.
- Tone: direct and concise, like a coach who knows the numbers. Not templated.

STRICT GROUNDING (never break these):
- Only mention workouts listed under "Workouts:". If it says none, do not mention workouts, training sessions or cardio.
- Steps are daily movement, not a workout. Never call steps "cardio" or a "session".
- "Workout" is a session the watch didn't name; don't guess what kind it was.
- Do not invent or assume anything that is not in the data. Every claim must point to a number or entry in the data.`;
}

function formatMinutes(total) {
  if (total == null) return "N/A";
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}min`;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

// Fitbit times are local wall-clock ISO strings; read HH:MM straight from
// the text so the server's time zone never shifts them
function formatClock(iso) {
  const match = typeof iso === "string" && iso.match(/T(\d{2}):(\d{2})/);
  if (!match) return "N/A";
  const hour = Number(match[1]);
  const suffix = hour < 12 ? "AM" : "PM";
  return `${hour % 12 || 12}:${match[2]} ${suffix}`;
}

function zoneText(zones) {
  const z = zones || {};
  return `${z.fatBurn || 0}min fat burn, ${z.cardio || 0}min cardio, ${z.peak || 0}min peak`;
}

function workoutLine(w) {
  const parts = [`${w.type} at ${formatClock(w.startTime)}: ${w.durationMin}min`];
  if (w.avgHeartRate != null) parts.push(`avg HR ${w.avgHeartRate} bpm`);
  if (w.distanceKm != null) parts.push(`${w.distanceKm} km`);
  if (w.paceMinPerKm != null) parts.push(`${w.paceMinPerKm} min/km`);
  parts.push(`zones: ${zoneText(w.zones)}`);
  return `- ${parts.join(", ")}`;
}

// The day object from normalizeDay. The hypnogram timeline (sleep.levels)
// and ids are left out: they cost tokens and say nothing new to the coach.
function buildUserMessage(day) {
  const parts = [`Here's my data for ${day.date}:`, ""];

  const s = day.sleep;
  if (s) {
    const efficiency = s.efficiency != null ? ` (${s.efficiency}% efficiency)` : "";
    parts.push(`Sleep: ${formatMinutes(s.totalMinutes)} asleep${efficiency}`);
    if (s.deep != null) {
      parts.push(
        `Stages: ${s.deep}min deep, ${s.light ?? 0}min light, ${s.rem ?? 0}min REM, ${s.wake ?? 0}min awake`,
      );
    }
    parts.push(`Bedtime: ${formatClock(s.bedTime)}, woke up: ${formatClock(s.wakeTime)}`);
  } else {
    parts.push("Sleep: no data");
  }

  const h = day.heart || {};
  if (h.restingHeartRate != null) {
    parts.push(`Resting heart rate: ${h.restingHeartRate} bpm`);
    if (h.previousRestingHeartRate != null) {
      parts.push(`Yesterday's resting heart rate: ${h.previousRestingHeartRate} bpm`);
    }
  } else {
    parts.push("Resting heart rate: no data");
  }
  parts.push(`Heart-rate zones for the whole day: ${zoneText(h.zones)}`);

  if (day.steps != null) {
    parts.push(`Steps (daily movement): ${day.steps.toLocaleString("en-US")}`);
  }

  const workouts = day.workouts || [];
  parts.push("");
  if (workouts.length) {
    parts.push("Workouts:");
    for (const w of workouts) parts.push(workoutLine(w));
  } else {
    parts.push("Workouts: none recorded on the watch");
  }

  parts.push("", "How did my day go, and what should my next session look like?");
  return parts.join("\n");
}

// Sleep or a workout is enough to say something useful; heart rate alone
// is not, and skipping the call saves its cost
function hasCoachableData(day) {
  return Boolean(day && (day.sleep || (day.workouts && day.workouts.length)));
}

// A flat array of strings, whatever shape the model returned
function toStringArray(val) {
  if (!val) return [];
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      // not JSON: a single item
    }
    return [val];
  }
  if (Array.isArray(val)) return val.map(String);
  return [];
}

// The body of a JSON string literal, with its escapes undone
function unescapeJson(body) {
  try {
    return JSON.parse(`"${body}"`);
  } catch {
    return body;
  }
}

// Pulls the fields out of truncated JSON (a reply cut off by max_tokens)
function recoverPartialInsight(text) {
  const headlineMatch = text.match(/"headline"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  const items = (key) => {
    const section = text.match(new RegExp(`"${key}"\\s*:\\s*\\[([\\s\\S]*?)(?:\\]|$)`));
    if (!section) return [];
    return [...section[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) =>
      unescapeJson(m[1]),
    );
  };
  return {
    headline: headlineMatch ? unescapeJson(headlineMatch[1]) : "",
    keySignals: items("keySignals"),
    focus: items("focus"),
  };
}

function parseInsight(text) {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  try {
    const parsed = JSON.parse(cleaned);
    return {
      headline: typeof parsed.headline === "string" ? parsed.headline : "",
      keySignals: toStringArray(parsed.keySignals),
      focus: toStringArray(parsed.focus),
    };
  } catch {
    const recovered = recoverPartialInsight(cleaned);
    if (recovered.headline || recovered.keySignals.length) return recovered;
    return { headline: "Here's your update", keySignals: [], focus: [] };
  }
}

function coachError(code, cause) {
  const error = new Error(code);
  if (cause) error.cause = cause;
  return error;
}

// client: an Anthropic SDK client. Returns { insight, usage }; throws
// COACH_API_ERROR when the API call fails and COACH_REFUSED on a refusal.
async function getFeedback(client, { model, profile, day }) {
  let response;
  try {
    response = await client.beta.messages.create({
      model,
      max_tokens: MAX_TOKENS,
      system: buildSystemPrompt(profile),
      messages: [{ role: "user", content: buildUserMessage(day) }],
      output_config: {
        effort: EFFORT,
        format: { type: "json_schema", schema: FEEDBACK_SCHEMA },
      },
      betas: [FALLBACK_BETA],
      fallbacks: "default",
    });
  } catch (error) {
    throw coachError("COACH_API_ERROR", error);
  }

  if (response.stop_reason === "refusal") {
    throw coachError("COACH_REFUSED", response.stop_details || null);
  }

  const text = (response.content || [])
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");
  const usage = response.usage || {};

  return {
    insight: parseInsight(text),
    usage: {
      // The model that served the reply, which differs after a fallback
      model: response.model || model,
      inputTokens: usage.input_tokens ?? 0,
      outputTokens: usage.output_tokens ?? 0,
    },
  };
}

module.exports = {
  FEEDBACK_SCHEMA,
  EFFORT,
  FALLBACK_BETA,
  sanitizeProfile,
  buildSystemPrompt,
  buildUserMessage,
  hasCoachableData,
  parseInsight,
  recoverPartialInsight,
  toStringArray,
  getFeedback,
};
