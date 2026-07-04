const router = require("express").Router();
const Area = require("../controllers/area.controller");
const asyncHandler = require("../utils/asyncHandler");
const { authenticate, authorize } = require("../middleware/auth");

router.use(authenticate);
router.get("/", asyncHandler(Area.list));
router.post("/", authorize("admin"), asyncHandler(Area.create));
router.put("/:id", authorize("admin"), asyncHandler(Area.update));
router.delete("/:id", authorize("admin"), asyncHandler(Area.remove));

module.exports = router;
