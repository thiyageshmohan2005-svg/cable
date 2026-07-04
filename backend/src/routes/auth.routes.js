const router = require("express").Router();
const Auth = require("../controllers/auth.controller");
const asyncHandler = require("../utils/asyncHandler");
const { authenticate } = require("../middleware/auth");

router.post("/login", asyncHandler(Auth.login));
router.get("/me", authenticate, asyncHandler(Auth.me));

module.exports = router;
