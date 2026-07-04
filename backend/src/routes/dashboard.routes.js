const router = require("express").Router();
const Dashboard = require("../controllers/dashboard.controller");
const asyncHandler = require("../utils/asyncHandler");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);
router.get("/summary", asyncHandler(Dashboard.summary));

module.exports = router;
