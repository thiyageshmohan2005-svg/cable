const router = require("express").Router();
const Notification = require("../controllers/notification.controller");
const asyncHandler = require("../utils/asyncHandler");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);
router.get("/", asyncHandler(Notification.list));
router.post("/sms-reminders", asyncHandler(Notification.smsReminders));
router.post("/whatsapp-alerts", asyncHandler(Notification.whatsappAlerts));

module.exports = router;
