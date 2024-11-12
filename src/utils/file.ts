import fsPromise from "node:fs/promises"
import fs from "node:fs"
import { CSV_RESULTS_DIRPATH, RESULTS_DIRPATH, XLSX_RESULTS_DIRPATH } from "../contants"

export async function writeToFile(filepath: string, value: string): Promise<void> {
  const parsedValue = `${value}\n`

  await fsPromise.appendFile(filepath, parsedValue)
}

export function handleResultsDirStructure() {
  if (!fs.existsSync(RESULTS_DIRPATH)) {
    fs.mkdirSync(RESULTS_DIRPATH)
    fs.mkdirSync(CSV_RESULTS_DIRPATH)
    fs.mkdirSync(XLSX_RESULTS_DIRPATH)

    return
  }

  if (!fs.existsSync(CSV_RESULTS_DIRPATH)) {
    fs.mkdirSync(CSV_RESULTS_DIRPATH)
  }

  if (!fs.existsSync(XLSX_RESULTS_DIRPATH)) {
    fs.mkdirSync(XLSX_RESULTS_DIRPATH)
  }
}