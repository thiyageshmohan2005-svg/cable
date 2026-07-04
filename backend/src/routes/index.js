const router = require("express").Router();

router.use("/auth", require("./auth.routes"));
router.use("/users", require("./user.routes"));
router.use("/areas", require("./area.routes"));
router.use("/plans", require("./plan.routes"));
router.use("/customers", require("./customer.routes"));
router.use("/payments", require("./payment.routes"));
router.use("/dashboard", require("./dashboard.routes"));
router.use("/reports", require("./report.routes"));
router.use("/notifications", require("./notification.routes"));
router.use("/settings", require("./setting.routes"));

module.exports = router;
