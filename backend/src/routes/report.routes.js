const router = require("express").Router();
const Report = require("../controllers/report.controller");
const asyncHandler = require("../utils/asyncHandler");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);
router.get("/daily", asyncHandler(Report.daily));
router.get("/monthly", asyncHandler(Report.monthly));
router.get("/pending-dues", asyncHandler(Report.pendingDues));
router.get("/export", asyncHandler(Report.exportReport));

module.exports = router;
