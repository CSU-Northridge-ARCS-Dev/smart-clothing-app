const {
  FEEDBACK_SCHEMA,
  FALLBACK_BETA,
  sanitizeProfile,
  buildSystemPrompt,
  buildUserMessage,
  hasCoachableData,
  parseInsight,
  recoverPartialInsight,
  toStringArray,
  getFeedback,
} = require("../src/lib/coach");
const sampleDay = require("./fixtures/day-sample.json");

const INSIGHT = {
  headline: "Hard run on short sleep - recover first",
  keySignals: ["6h22m sleep - marginal recovery", "7min peak on the run"],
  focus: ["Short sleep after a hard run - keep tomorrow easy"],
};

function fakeClient(response) {
  return { beta: { messages: { create: jest.fn().mockResolvedValue(response) } } };
}

function textResponse(text, extra = {}) {
  return {
    model: "claude-opus-5-5",
    stop_reason: "end_turn",
    content: [
      { type: "thinking", thinking: "" },
      { type: "text", text },
    ],
    usage: { input_tokens: 1800, output_tokens: 240 },
    ...extra,
  };
}

const emptyDay = (overrides = {}) => ({
  date: "2026-10-12",
  steps: null,
  sleep: null,
  heart: { restingHeartRate: null, previousRestingHeartRate: null, zones: {} },
  workouts: [],
  ...overrides,
});

describe("sanitizeProfile", () => {
  it("keeps the signup fields and renames them for the prompt", () => {
    expect(
      sanitizeProfile({
        gender: "Male",
        age: 21,
        height: 70,
        weight: "165",
        sports: "Track and field",
      }),
    ).toEqual({
      gender: "Male",
      age: 21,
      heightIn: 70,
      weightLbs: 165,
      sport: "Track and field",
    });
  });

  it("drops the app's No Data placeholder and empty values", () => {
    expect(
      sanitizeProfile({
        gender: "No Data",
        height: "No Data",
        weight: "",
        sports: "   ",
      }),
    ).toEqual({});
  });

  it("drops numbers outside a sensible range", () => {
    expect(sanitizeProfile({ age: 3, height: 500, weight: -1 })).toEqual({});
  });

  it("trims long free text and collapses whitespace", () => {
    const { sport } = sanitizeProfile({ sports: `Soccer\n\n${"x".repeat(200)}` });
    expect(sport.length).toBe(60);
    expect(sport).not.toMatch(/\n/);
  });

  it("returns an empty profile for a missing or invalid value", () => {
    expect(sanitizeProfile(undefined)).toEqual({});
    expect(sanitizeProfile("athlete")).toEqual({});
  });
});

describe("buildSystemPrompt", () => {
  it("lists the profile fields it has", () => {
    const prompt = buildSystemPrompt({
      gender: "Female",
      age: 20,
      heightIn: 65,
      weightLbs: 130,
      sport: "Volleyball",
    });
    expect(prompt).toContain("- Age: 20");
    expect(prompt).toContain("- Sex: Female");
    expect(prompt).toContain(`- Height: 5'5"`);
    expect(prompt).toContain("- Weight: 130 lbs");
    expect(prompt).toContain("- Sport: Volleyball");
  });

  it("leaves out fields it doesn't have", () => {
    const prompt = buildSystemPrompt({ age: 20 });
    expect(prompt).toContain("- Age: 20");
    expect(prompt).not.toContain("- Sport:");
    expect(prompt).not.toContain("- Weight:");
  });

  it("says so when the profile is empty", () => {
    expect(buildSystemPrompt({})).toContain("hasn't filled in their profile");
    expect(buildSystemPrompt()).toContain("hasn't filled in their profile");
  });

  it("has no goal or training-progression coaching", () => {
    const prompt = buildSystemPrompt({ age: 20 });
    expect(prompt).not.toMatch(/goal/i);
    expect(prompt).not.toMatch(/trainingNote|progressive overload/i);
  });

  it("keeps the grounding rules", () => {
    expect(buildSystemPrompt({})).toContain("Only mention workouts listed");
  });
});

describe("buildUserMessage", () => {
  const message = buildUserMessage(sampleDay);

  it("has the sleep summary, stages and clock times", () => {
    expect(message).toContain("Sleep: 6h 22min asleep (91% efficiency)");
    expect(message).toContain("58min deep, 221min light, 72min REM, 41min awake");
    expect(message).toContain("Bedtime: 11:48 PM, woke up: 7:11 AM");
  });

  it("has today's and yesterday's resting heart rate", () => {
    expect(message).toContain("Resting heart rate: 61 bpm");
    expect(message).toContain("Yesterday's resting heart rate: 59 bpm");
  });

  it("labels steps as daily movement", () => {
    expect(message).toContain("Steps (daily movement): 8,412");
  });

  it("lists workouts with distance in km and pace", () => {
    expect(message).toContain(
      "- Run at 8:53 PM: 12min, avg HR 175 bpm, 1.6 km, 7.5 min/km, zones: 1min fat burn, 4min cardio, 7min peak",
    );
  });

  it("never sends the sleep timeline, ids or calories", () => {
    expect(message).not.toContain("levels");
    expect(message).not.toContain("2026-10-11T00:23");
    expect(message).not.toContain("904183528666901765");
    expect(message).not.toMatch(/calorie/i);
    expect(message).not.toMatch(/gps/i);
  });

  it("says when there is no sleep, heart rate or workout", () => {
    const empty = buildUserMessage(emptyDay());
    expect(empty).toContain("Sleep: no data");
    expect(empty).toContain("Resting heart rate: no data");
    expect(empty).toContain("Workouts: none recorded on the watch");
    expect(empty).not.toContain("Steps");
  });

  it("skips stage lines for a classic sleep log", () => {
    const day = emptyDay({
      sleep: { totalMinutes: 420, efficiency: null, deep: null, bedTime: null, wakeTime: null },
    });
    const text = buildUserMessage(day);
    expect(text).toContain("Sleep: 7h asleep");
    expect(text).not.toContain("Stages:");
    expect(text).toContain("Bedtime: N/A");
  });
});

describe("hasCoachableData", () => {
  it("is true with sleep or a workout", () => {
    expect(hasCoachableData(sampleDay)).toBe(true);
    expect(hasCoachableData(emptyDay({ sleep: { totalMinutes: 400 } }))).toBe(true);
    expect(hasCoachableData(emptyDay({ workouts: [{ type: "Walk" }] }))).toBe(true);
  });

  it("is false with only heart rate or steps", () => {
    expect(
      hasCoachableData(emptyDay({ steps: 9000, heart: { restingHeartRate: 60 } })),
    ).toBe(false);
    expect(hasCoachableData(null)).toBe(false);
  });
});

describe("parsing", () => {
  it("parses a JSON reply", () => {
    expect(parseInsight(JSON.stringify(INSIGHT))).toEqual(INSIGHT);
  });

  it("strips code fences", () => {
    expect(parseInsight("```json\n" + JSON.stringify(INSIGHT) + "\n```")).toEqual(INSIGHT);
  });

  it("recovers fields from truncated JSON", () => {
    const cut = '{"headline":"Back off \\"tomorrow\\"","keySignals":["one","two';
    expect(recoverPartialInsight(cut)).toEqual({
      headline: 'Back off "tomorrow"',
      keySignals: ["one"],
      focus: [],
    });
    expect(parseInsight(cut).headline).toBe('Back off "tomorrow"');
  });

  it("falls back to a generic headline when nothing is usable", () => {
    expect(parseInsight("not json")).toEqual({
      headline: "Here's your update",
      keySignals: [],
      focus: [],
    });
  });

  it("flattens array-like values to strings", () => {
    expect(toStringArray('["a","b"]')).toEqual(["a", "b"]);
    expect(toStringArray("one")).toEqual(["one"]);
    expect(toStringArray([1, 2])).toEqual(["1", "2"]);
    expect(toStringArray(null)).toEqual([]);
  });
});

describe("getFeedback", () => {
  const args = { model: "claude-opus-5-5", profile: { age: 21 }, day: sampleDay };

  it("sends the model, prompt, schema, low effort and refusal fallback", async () => {
    const client = fakeClient(textResponse(JSON.stringify(INSIGHT)));
    await getFeedback(client, args);

    const params = client.beta.messages.create.mock.calls[0][0];
    expect(params.model).toBe("claude-opus-5-5");
    expect(params.system).toContain("- Age: 21");
    expect(params.messages).toEqual([
      { role: "user", content: buildUserMessage(sampleDay) },
    ]);
    expect(params.output_config).toEqual({
      effort: "low",
      format: { type: "json_schema", schema: FEEDBACK_SCHEMA },
    });
    expect(params.betas).toEqual([FALLBACK_BETA]);
    expect(params.fallbacks).toBe("default");
    expect(params).not.toHaveProperty("thinking");
  });

  it("returns the insight and token usage", async () => {
    const client = fakeClient(textResponse(JSON.stringify(INSIGHT)));
    await expect(getFeedback(client, args)).resolves.toEqual({
      insight: INSIGHT,
      usage: { model: "claude-opus-5-5", inputTokens: 1800, outputTokens: 240 },
    });
  });

  it("reports the model that served the reply after a fallback", async () => {
    const client = fakeClient(
      textResponse(JSON.stringify(INSIGHT), { model: "claude-opus-5" }),
    );
    const { usage } = await getFeedback(client, args);
    expect(usage.model).toBe("claude-opus-5");
  });

  it("recovers a reply cut off by max_tokens", async () => {
    const client = fakeClient(
      textResponse('{"headline":"Easy day next","keySignals":["6h22m sleep', {
        stop_reason: "max_tokens",
      }),
    );
    const { insight } = await getFeedback(client, args);
    expect(insight.headline).toBe("Easy day next");
  });

  it("throws COACH_REFUSED on a refusal", async () => {
    const client = fakeClient({
      model: "claude-opus-5-5",
      stop_reason: "refusal",
      stop_details: { type: "refusal", category: null },
      content: [],
      usage: { input_tokens: 10, output_tokens: 0 },
    });
    await expect(getFeedback(client, args)).rejects.toThrow("COACH_REFUSED");
  });

  it("throws COACH_API_ERROR when the API call fails", async () => {
    const client = {
      beta: {
        messages: { create: jest.fn().mockRejectedValue(new Error("overloaded")) },
      },
    };
    const error = await getFeedback(client, args).catch((e) => e);
    expect(error.message).toBe("COACH_API_ERROR");
    expect(error.cause.message).toBe("overloaded");
  });
});
