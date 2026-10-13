const fs = require("fs");
const os = require("os");
const path = require("path");
const { logUsage, HEADER } = require("../src/lib/usageLog");

const ROW = {
  date: "2026-10-11",
  model: "claude-opus-5-5",
  inputTokens: 1800,
  outputTokens: 240,
};
const NOW = new Date("2026-10-12T18:00:00.000Z");

describe("logUsage", () => {
  let dir;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "usage-log-"));
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
    jest.restoreAllMocks();
  });

  it("writes the header once and appends a row per call", () => {
    const filePath = path.join(dir, "usage-log.csv");
    logUsage(ROW, { filePath, now: NOW });
    logUsage({ ...ROW, outputTokens: 300 }, { filePath, now: NOW });

    expect(fs.readFileSync(filePath, "utf8")).toBe(
      HEADER +
        "2026-10-12T18:00:00.000Z,2026-10-11,claude-opus-5-5,1800,240\n" +
        "2026-10-12T18:00:00.000Z,2026-10-11,claude-opus-5-5,1800,300\n",
    );
  });

  it("prints a one-line summary", () => {
    logUsage(ROW, { filePath: path.join(dir, "log.csv"), now: NOW });
    expect(console.log).toHaveBeenCalledWith(
      "Claude usage: 2026-10-11 claude-opus-5-5 in=1800 out=240",
    );
  });

  it("does not throw when the file can't be written", () => {
    const filePath = path.join(dir, "missing-folder", "log.csv");
    expect(() => logUsage(ROW, { filePath, now: NOW })).not.toThrow();
    expect(console.error).toHaveBeenCalled();
  });
});
