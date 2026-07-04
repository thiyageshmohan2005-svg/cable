const router = require("express").Router();
const Plan = require("../controllers/plan.controller");
const asyncHandler = require("../utils/asyncHandler");
const { authenticate, authorize } = require("../middleware/auth");

router.use(authenticate);
router.get("/", asyncHandler(Plan.list));
router.post("/", authorize("admin"), asyncHandler(Plan.create));
router.put("/:id", authorize("admin"), asyncHandler(Plan.update));
router.delete("/:id", authorize("admin"), asyncHandler(Plan.remove));

module.exports = router;
