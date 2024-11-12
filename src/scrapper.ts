import puppeteer from "puppeteer";

import type { BBlock2, BookingEnvData } from "./interface/bookingEnvData";
import type { CustomWindow } from "./interface/customWindow";

import {
  generateBookingQueryParamDate,
  generateFinalResultDate,
  getDatesBetween
} from "./utils/date";
import { writeToFile } from "./utils/file";
import { generateNewBookingUrl } from "./utils/string";
import { wait } from "./utils/promise";

interface ScrapperParams {
  url: string,
  startDate: Date,
  endDate: Date,
  maxBundleSize: number,
  resultsFilepath: string,
  adultsAmmount: number
}

export async function scrapper({
  url,
  startDate,
  endDate,
  maxBundleSize,
  resultsFilepath,
  adultsAmmount,
}: ScrapperParams): Promise<void> {
  const dates = getDatesBetween(startDate, endDate)

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const mainPage = await browser.newPage()

  let currentUrl = url

  // TODO: Clicar no botão de pesquisa da disponibilidade da própria propriedade
  // // Aguardar a navegação
  // // Utilizar a URL gerada dessa navagação para as consultas, alterando apenas os
  // // parâmetros de checkin e checkout

  let i = 1
  let ammountOfDatesToJumpAfterBundleFound = null
  for (const date of dates) {
    const currentExecution = i
    i++

    let validBundleFound = false
    let lastBundleSize: number | null = null

    if (
      ammountOfDatesToJumpAfterBundleFound &&
      ammountOfDatesToJumpAfterBundleFound <= 0
    ) {
      ammountOfDatesToJumpAfterBundleFound = null
    }

    if (ammountOfDatesToJumpAfterBundleFound) {
      ammountOfDatesToJumpAfterBundleFound--
      console.log(`Price ${currentExecution} of ${dates.length} extracted`)
      continue
    }

    for (let bundleSize = 1; bundleSize <= maxBundleSize; bundleSize++) {
      lastBundleSize = bundleSize
      let nextDayDate = new Date(date.getTime())
      nextDayDate.setUTCDate(nextDayDate.getUTCDate() + bundleSize)

      const bookingQueryParamCurrentDate = generateBookingQueryParamDate(date)
      const bookingQueryParamNextDayDate = generateBookingQueryParamDate(nextDayDate)

      currentUrl = generateNewBookingUrl(
        url,
        bookingQueryParamCurrentDate,
        bookingQueryParamNextDayDate,
        adultsAmmount
      )

      try {
        await Promise.all([
          mainPage.waitForNavigation(),
          mainPage.goto(currentUrl)
        ])

        await wait(4000)

        const bookingData: BookingEnvData = await mainPage.evaluate(() => {
          // const customWindow: CustomWindow = window as any

          // return customWindow.booking.env
          return (window as unknown as CustomWindow).booking.env
        })

        if (!bookingData.b_rooms_available_and_soldout.length) {
          continue
        }

        let validRoomBlocks: BBlock2[] = []
        for (const room of bookingData.b_rooms_available_and_soldout) {
          const filteredRoomBlocks = room.b_blocks.filter((roomBlock) => {
            return roomBlock.b_max_persons === adultsAmmount
          })

          if (!filteredRoomBlocks.length) continue

          validRoomBlocks = validRoomBlocks.concat(filteredRoomBlocks)
        }

        if (!validRoomBlocks.length) {
          continue
        }

        validBundleFound = true

        validRoomBlocks.sort((roomBlockA, roomBlockB) => {
          return roomBlockA.b_price_breakdown_simplified.b_headline_price_amount - roomBlockB.b_price_breakdown_simplified.b_headline_price_amount
        })

        const cheapestRoomBlock = validRoomBlocks[0]

        const selectedBlockPrice = cheapestRoomBlock.b_price_breakdown_simplified.b_headline_price_amount
        const calculatedSelectedBlockPrice = selectedBlockPrice / bundleSize

        const selectedBlockPriceString = calculatedSelectedBlockPrice.toFixed(2)
        const selectedBlockPriceStringParsedToBrazilLocale =
          selectedBlockPriceString.split(".").join(",")

        if (bundleSize > 1) {
          ammountOfDatesToJumpAfterBundleFound = bundleSize - 1
        }

        for (let saveResultExecution = 1; saveResultExecution <= bundleSize; saveResultExecution++) {
          const bundlePartDate = dates[(currentExecution - 1) + (saveResultExecution - 1)]

          if (!bundlePartDate) break

          let nextBundleDayDate = new Date(bundlePartDate.getTime())
          nextBundleDayDate.setUTCDate(nextBundleDayDate.getUTCDate() + 1)

          const finalResultCurrentDate = generateFinalResultDate(bundlePartDate)
          const finalResultNextDayDate = generateFinalResultDate(nextBundleDayDate)

          // TODO: Tirar último item do CSV depois
          const value = `${finalResultCurrentDate};${finalResultNextDayDate};${selectedBlockPriceStringParsedToBrazilLocale};${bundleSize > 1 ? "BUNDLE " + bundleSize : ""}`
          await writeToFile(resultsFilepath, value)
        }

        break
      } catch (error) {
        console.error(error)
        continue
      }
    }

    if (!validBundleFound && lastBundleSize) {
      for (let saveResultExecution = 1; saveResultExecution <= lastBundleSize; saveResultExecution++) {
        const bundlePartDate = dates[(currentExecution - 1) + (saveResultExecution - 1)]

        if (!bundlePartDate) break

        let nextBundleDayDate = new Date(bundlePartDate.getTime())
        nextBundleDayDate.setUTCDate(nextBundleDayDate.getUTCDate() + 1)

        const finalResultCurrentDate = generateFinalResultDate(bundlePartDate)
        const finalResultNextDayDate = generateFinalResultDate(nextBundleDayDate)

        const value = `${finalResultCurrentDate};${finalResultNextDayDate};S/D;`
        await writeToFile(resultsFilepath, value)
      }
    }

    console.log(`Price ${currentExecution} of ${dates.length} extracted`)
  }

  await wait(5000)
  await browser.close()
}
