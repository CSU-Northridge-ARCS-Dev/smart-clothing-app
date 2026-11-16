const fs = require("fs");
const os = require("os");
const path = require("path");
const { logUsage, HEADER, OLD_HEADER } = require("../src/lib/usageLog");

const ROW = {
  date: "2026-10-11",
  model: "claude-opus-5-5",
  inputTokens: 1800,
  outputTokens: 240,
  source: "health_connect",
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
        "2026-10-12T18:00:00.000Z,2026-10-11,claude-opus-5-5,1800,240,health_connect\n" +
        "2026-10-12T18:00:00.000Z,2026-10-11,claude-opus-5-5,1800,300,health_connect\n",
    );
  });

  it("prints a one-line summary", () => {
    logUsage(ROW, { filePath: path.join(dir, "log.csv"), now: NOW });
    expect(console.log).toHaveBeenCalledWith(
      "Claude usage: 2026-10-11 claude-opus-5-5 in=1800 out=240 source=health_connect",
    );
  });

  it("leaves the source empty when none is given", () => {
    const filePath = path.join(dir, "usage-log.csv");
    const { source, ...row } = ROW;
    logUsage(row, { filePath, now: NOW });
    expect(fs.readFileSync(filePath, "utf8")).toBe(
      HEADER + "2026-10-12T18:00:00.000Z,2026-10-11,claude-opus-5-5,1800,240,\n",
    );
  });

  it("gives an older file the new header and keeps its rows", () => {
    const filePath = path.join(dir, "usage-log.csv");
    const oldRow = "2026-10-12T09:00:00.000Z,2026-10-11,claude-opus-5-5,1500,200\n";
    fs.writeFileSync(filePath, OLD_HEADER + oldRow);

    logUsage(ROW, { filePath, now: NOW });
    logUsage(ROW, { filePath, now: NOW });

    const newRow =
      "2026-10-12T18:00:00.000Z,2026-10-11,claude-opus-5-5,1800,240,health_connect\n";
    expect(fs.readFileSync(filePath, "utf8")).toBe(
      HEADER + oldRow + newRow + newRow,
    );
  });

  it("does not throw when the file can't be written", () => {
    const filePath = path.join(dir, "missing-folder", "log.csv");
    expect(() => logUsage(ROW, { filePath, now: NOW })).not.toThrow();
    expect(console.error).toHaveBeenCalled();
  });
});
