const path = require('path');
const ExcelJS = require('exceljs');
const { writeFile } = require('fs');

let file = {};
let fileIdx = 1;

function createFile(name, headers) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Results');
  ws.columns = headers.map((header) => ({ header, width: header.length + 2 }));
  file = {
    name,
    wb,
    ws,
  };
}

function writeRow(entries) {
  file.ws.addRow(entries);
}

function saveFile(dir, cb) {
  stylizeSheet(file.ws);
  file.wb.xlsx
    .writeBuffer()
    .then((blob) =>
      writeFile(
        path.join(dir, `${file.name}_${fileIdx++}.xlsx`),
        blob,
        cb
      )
    );
}

function stylizeSheet(ws) {
  var borderline = { style: 'thin' };
  var borderStyle = {
    top: borderline,
    left: borderline,
    bottom: borderline,
    right: borderline,
  };

  rows = ws.getRows(2, ws.rowCount - 1);
  rows.forEach((r) => {
    for (let c = 1; c <= ws.columnCount; c++) {
      let cell = r.getCell(c);
      cell.border = borderStyle;
      cell.font = { name: 'Arial', size: 10, bold: false };
    }
  });

  headerRow = ws.getRow(1);
  for (let c = 1; c <= ws.columnCount; c++) {
    let cell = headerRow.getCell(c);
    cell.font = { name: 'Arial', size: 10, bold: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'darkVertical',
      fgColor: { argb: 'FFc0c0c0' },
    };
    cell.border = borderStyle;
  }
}

module.exports = {
  writeRow,
  createFile,
  saveFile,
};
