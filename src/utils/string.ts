export function generateNewBookingUrl(
  url: string,
  checkin: string,
  checkout: string,
  groupAdults: number
) {
  const urlParams = new URLSearchParams()

  urlParams.append("checkin", checkin)
  urlParams.append("checkout", checkout)

  if (groupAdults && groupAdults > 0) {
    urlParams.append("group_adults", String(groupAdults))
  }

  const newUrl = `${url}?${urlParams.toString()}`

  return newUrl
}

export function generateCsvResultsFilename(propertyName: string, timestamp: string, startDate: string, endDate: string) {
  return `${propertyName}_${timestamp}_from_${startDate}_to_${endDate}.csv`
}

export function generateXlsxResultsFilename(propertyName: string, timestamp: string, startDate: string, endDate: string) {
  return `${propertyName}_${timestamp}_from_${startDate}_to_${endDate}.xlsx`
}