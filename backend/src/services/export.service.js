const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");

async function rowsToWorkbookBuffer(sheetName, rows) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  const keys = rows[0] ? Object.keys(rows[0]) : ["message"];
  sheet.columns = keys.map((key) => ({
    header: key.replace(/_/g, " ").toUpperCase(),
    key,
    width: Math.max(14, key.length + 4)
  }));

  if (rows.length) {
    sheet.addRows(rows);
  } else {
    sheet.addRow({ message: "No records found" });
  }

  sheet.getRow(1).font = { bold: true };
  return workbook.xlsx.writeBuffer();
}

async function rowsToPdfBuffer(title, rows) {
  const chunks = [];
  const doc = new PDFDocument({ size: "A4", margin: 36, layout: "landscape" });

  doc.on("data", (chunk) => chunks.push(chunk));
  const done = new Promise((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  doc.fontSize(16).text(title, { align: "center" });
  doc.moveDown();

  if (!rows.length) {
    doc.fontSize(11).text("No records found");
    doc.end();
    return done;
  }

  const keys = Object.keys(rows[0]).slice(0, 8);
  const colWidth = Math.floor((doc.page.width - doc.page.margins.left - doc.page.margins.right) / keys.length);

  doc.fontSize(8).font("Helvetica-Bold");
  keys.forEach((key, index) => {
    doc.text(key.replace(/_/g, " ").toUpperCase(), doc.page.margins.left + index * colWidth, doc.y, {
      width: colWidth - 4,
      continued: index !== keys.length - 1
    });
  });
  doc.moveDown();
  doc.font("Helvetica");

  rows.forEach((row) => {
    const y = doc.y;
    keys.forEach((key, index) => {
      doc.text(String(row[key] ?? ""), doc.page.margins.left + index * colWidth, y, {
        width: colWidth - 4,
        height: 24
      });
    });
    doc.moveDown(1.3);
    if (doc.y > doc.page.height - 60) {
      doc.addPage();
    }
  });

  doc.end();
  return done;
}

module.exports = {
  rowsToWorkbookBuffer,
  rowsToPdfBuffer
};
