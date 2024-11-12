import process from "node:process"
import path from "node:path"

const CWD = process.cwd()
const RESULTS_DIRNAME = "results"
const CSV_RESULTS_DIRNAME = "csv"
const XLSX_RESULTS_DIRNAME = "xlsx"
const CONFIG_JSON_FILENAME = "config.json"

export const RESULTS_DIRPATH = path.join(CWD, RESULTS_DIRNAME)
export const CSV_RESULTS_DIRPATH = path.join(RESULTS_DIRPATH, CSV_RESULTS_DIRNAME)
export const XLSX_RESULTS_DIRPATH = path.join(RESULTS_DIRPATH, XLSX_RESULTS_DIRNAME)
export const CONFIG_JSON_FILEPATH = path.join(CWD, CONFIG_JSON_FILENAME)
