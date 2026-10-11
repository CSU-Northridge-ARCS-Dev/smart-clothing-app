const { Router } = require("express");

const router = Router();

// GET /api/health - liveness check (public)
router.get("/", (req, res) => {
  res.json({ ok: true });
});

module.exports = router;
