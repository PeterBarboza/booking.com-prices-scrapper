import ExcelJS from "exceljs"
import fs from "node:fs"
import readline from "node:readline"

export async function convertCsvToXlsx(entryCsvFileName: string, exitXlsxFileName: string): Promise<void> {
  return new Promise((resolve) => {
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      filename: exitXlsxFileName,
    })

    const worksheet = workbook.addWorksheet("Prices")

    const csvReadStream = fs.createReadStream(
      entryCsvFileName,
      { highWaterMark: 256 }
    )
    const readlineEvents = readline.createInterface({
      input: csvReadStream,
      terminal: false
    })

    readlineEvents.on("line", (data) => {
      const [searchStartDate = "", searchEndDate = "", price = ""] = data.split(";")

      worksheet.addRow([searchStartDate, searchEndDate, price]).commit()
    })
    readlineEvents.on("close", () => {
      worksheet.commit()
      workbook.commit()

      resolve()
    })
  })
}
