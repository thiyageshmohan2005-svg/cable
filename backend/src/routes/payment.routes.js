const router = require("express").Router();
const Payment = require("../controllers/payment.controller");
const asyncHandler = require("../utils/asyncHandler");
const { authenticate, authorize } = require("../middleware/auth");

router.use(authenticate);
router.get("/recent", asyncHandler(Payment.recent));
router.post("/mark-paid", authorize("admin", "collector"), asyncHandler(Payment.markPaid));
router.get("/customer/:customerId", asyncHandler(Payment.listByCustomer));
router.get("/:paymentId/receipt.pdf", asyncHandler(Payment.receiptPdf));

module.exports = router;
