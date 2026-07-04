const multer = require("multer");
const router = require("express").Router();
const Customer = require("../controllers/customer.controller");
const asyncHandler = require("../utils/asyncHandler");
const { authenticate, authorize, collectorAreaFilter } = require("../middleware/auth");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.use(authenticate, collectorAreaFilter);
router.get("/", asyncHandler(Customer.list));
router.post("/", authorize("admin"), asyncHandler(Customer.create));
router.post("/import", authorize("admin"), upload.single("file"), asyncHandler(Customer.importExcel));
router.get("/:id", asyncHandler(Customer.show));
router.get("/:id/qr", asyncHandler(Customer.qr));
router.put("/:id", authorize("admin"), asyncHandler(Customer.update));
router.delete("/:id", authorize("admin"), asyncHandler(Customer.remove));

module.exports = router;
