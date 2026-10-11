jest.mock("../src/lib/firebaseAdmin", () => ({ verifyIdToken: jest.fn() }));

const { verifyIdToken } = require("../src/lib/firebaseAdmin");
const requireFirebaseUser = require("../src/middleware/requireFirebaseUser");

function makeReq(authorization) {
  return {
    get: (name) => (name === "Authorization" ? authorization : undefined),
  };
}

function makeRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe("requireFirebaseUser", () => {
  beforeEach(() => {
    verifyIdToken.mockReset();
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    console.warn.mockRestore();
  });

  it("returns 401 when the Authorization header is missing", async () => {
    const res = makeRes();
    const next = jest.fn();
    await requireFirebaseUser(makeReq(undefined), res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "UNAUTHENTICATED" });
    expect(next).not.toHaveBeenCalled();
    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it("returns 401 when the header is not a Bearer token", async () => {
    const res = makeRes();
    const next = jest.fn();
    await requireFirebaseUser(makeReq("Basic abc"), res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when verifyIdToken rejects", async () => {
    verifyIdToken.mockRejectedValue(
      Object.assign(new Error("expired"), { code: "auth/id-token-expired" }),
    );
    const res = makeRes();
    const next = jest.fn();
    await requireFirebaseUser(makeReq("Bearer bad-token"), res, next);
    expect(verifyIdToken).toHaveBeenCalledWith("bad-token");
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("sets req.uid and calls next for a valid token", async () => {
    verifyIdToken.mockResolvedValue({ uid: "user-1" });
    const req = makeReq("Bearer good-token");
    const res = makeRes();
    const next = jest.fn();
    await requireFirebaseUser(req, res, next);
    expect(req.uid).toBe("user-1");
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
