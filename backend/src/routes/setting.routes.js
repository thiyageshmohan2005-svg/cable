const router = require("express").Router();
const Setting = require("../controllers/setting.controller");
const asyncHandler = require("../utils/asyncHandler");
const { authenticate, authorize } = require("../middleware/auth");

router.use(authenticate, authorize("admin"));
router.get("/", asyncHandler(Setting.all));
router.put("/", asyncHandler(Setting.update));

module.exports = router;
