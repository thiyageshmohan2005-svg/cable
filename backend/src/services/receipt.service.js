const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");

async function paymentReceiptBuffer(payment) {
  const chunks = [];
  const doc = new PDFDocument({ size: "A4", margin: 48 });

  doc.on("data", (chunk) => chunks.push(chunk));
  const done = new Promise((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  const qrData = await QRCode.toDataURL(payment.receipt_no);

  doc.fontSize(22).text("CablePro", { align: "center" });
  doc.fontSize(14).text("Payment Receipt", { align: "center" });
  doc.moveDown();
  doc.fontSize(11).text(`Receipt No: ${payment.receipt_no}`);
  doc.text(`Date: ${payment.payment_date}`);
  doc.text(`Customer: ${payment.customer_name} (${payment.customer_code})`);
  doc.text(`Mobile: ${payment.mobile || "-"}`);
  doc.text(`Area: ${payment.area_name || "-"}`);
  doc.moveDown();
  doc.fontSize(13).text(`Amount Paid: Rs.${payment.amount}`);
  doc.fontSize(11).text(`Payment Method: ${payment.method}`);
  doc.text(`Previous Due: Rs.${payment.previous_due}`);
  doc.text(`Remaining Due: Rs.${payment.remaining_due}`);
  doc.text(`Collected By: ${payment.collected_by_name || "-"}`);
  doc.moveDown();
  doc.image(qrData, 420, 110, { width: 100 });
  doc.text("Thank you for your payment.", { align: "center" });
  doc.end();

  return done;
}

module.exports = {
  paymentReceiptBuffer
};
