const dayjs = require("dayjs");
const env = require("../config/env");

function buildReceiptNo(customerId) {
  const datePart = dayjs().format("YYYYMMDD");
  const entropy = String(Date.now()).slice(-6);
  return `${env.receiptPrefix}${datePart}${String(customerId).padStart(5, "0")}${entropy}`;
}

module.exports = {
  buildReceiptNo
};
