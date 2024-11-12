import path from "node:path"
import fs from "node:fs"

import { scrapper } from "./scrapper"
import { convertCsvToXlsx } from "./conversor"
import { generateCsvResultsFilename, generateXlsxResultsFilename } from "./utils/string"
import { handleResultsDirStructure } from "./utils/file"
import { CONFIG_JSON_FILEPATH, CSV_RESULTS_DIRPATH, XLSX_RESULTS_DIRPATH } from "./contants"
import type { ConfigJson } from "./interface/configJson"
import { configJsonSchema } from "./schema"

async function main() {
  const rawConfigJson: ConfigJson = JSON.parse(fs.readFileSync(CONFIG_JSON_FILEPATH).toString("utf8"))

  console.log("------------------------")
  console.log("| STARTING APPLICATION |")
  console.log("------------------------\n")

  const configJson = await configJsonSchema.parseAsync(rawConfigJson)

  console.log(`${configJson.properties.length} properties identified to be searched\n`)

  handleResultsDirStructure()

  for (let i = 1; i <= configJson.properties.length; i++) {
    console.log(`Searching by property ${i} of ${configJson.properties.length}\n`)

    const property = configJson.properties[i - 1]
    const parsedPropertyUrl = property.url.split("?")[0]

    const parsedStartDate = new Date(property.startDate)
    const parsedEndDate = new Date(property.endDate)

    const replaceIsoStringNonFilepathSafeCharsRegEx = /[.:]+/g

    const resultsFilenameTimestamp =
      new Date().toISOString().replace(replaceIsoStringNonFilepathSafeCharsRegEx, "-")

    const resultsFilenameCsv = generateCsvResultsFilename(
      property.name,
      resultsFilenameTimestamp,
      property.startDate,
      property.endDate
    )
    const resultsFilenameXlsx = generateXlsxResultsFilename(
      property.name,
      resultsFilenameTimestamp,
      property.startDate,
      property.endDate
    )

    const resultsFilepathCsv = path.join(CSV_RESULTS_DIRPATH, resultsFilenameCsv)
    const resultsFilepathXlsx = path.join(XLSX_RESULTS_DIRPATH, resultsFilenameXlsx)

    await scrapper({
      url: parsedPropertyUrl,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      maxBundleSize: property.maxBundleSize,
      resultsFilepath: resultsFilepathCsv,
      adultsAmmount: property.adultsAmmount || 2,
    })

    console.log(`Saving search results of property ${i} of ${configJson.properties.length} to file "${resultsFilenameXlsx}"\n`)

    await convertCsvToXlsx(resultsFilepathCsv, resultsFilepathXlsx)
  }

  console.log("-----------------------------")
  console.log("| SHUTTING APPLICATION DOWN |")
  console.log("-----------------------------\n")
}
main()