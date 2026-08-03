import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";

export const exportToExcel = (dataOrRows, headers, rowMapperOrFileName, fileName) => {
  let rows = [];

  if (typeof rowMapperOrFileName === "function") {
    const data = dataOrRows;
    const rowMapper = rowMapperOrFileName;
    fileName = fileName || "Report";
    rows = data.map(rowMapper);
  } else {
    rows = dataOrRows;
    fileName = rowMapperOrFileName || "Report";
  }

  if (!rows.length) {
    alert("No data to export!");
    return;
  }

  const aoa = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  const range = XLSX.utils.decode_range(ws["!ref"]);

  const borderStyle = {
    top: { style: "thin", color: { rgb: "CCCCCC" } },
    bottom: { style: "thin", color: { rgb: "CCCCCC" } },
    left: { style: "thin", color: { rgb: "CCCCCC" } },
    right: { style: "thin", color: { rgb: "CCCCCC" } }
  };

  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellAddr = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = ws[cellAddr];
      if (!cell) continue;

      cell.s = {
        border: borderStyle,
        alignment: {
          vertical: "center",
          horizontal: R === 0 ? "center" : "left"
        }
      };

      if (R === 0) {
        cell.s = {
          border: borderStyle,
          alignment: { horizontal: "center", vertical: "center" },
          font: { bold: true, color: { rgb: "000000" }, sz: 12 },
          fill: { fgColor: { rgb: "E6F2FF" } }
        };
      }
    }
  }

  ws["!cols"] = headers.map(() => ({ wch: 25 }));
  ws["!rows"] = aoa.map(() => ({ hpt: 22 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");

  const excelBuffer = XLSX.write(wb, {
    bookType: "xlsx",
    type: "array",
    cellStyles: true
  });

  saveAs(
    new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }),
    `${fileName}.xlsx`
  );
};
