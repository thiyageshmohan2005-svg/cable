const router = require("express").Router();
const User = require("../controllers/user.controller");
const asyncHandler = require("../utils/asyncHandler");
const { authenticate, authorize } = require("../middleware/auth");

router.use(authenticate, authorize("admin"));
router.get("/", asyncHandler(User.list));
router.post("/", asyncHandler(User.create));
router.put("/:id", asyncHandler(User.update));
router.delete("/:id", asyncHandler(User.remove));

module.exports = router;
