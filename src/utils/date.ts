
export function getDatesBetween(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = []

  while (startDate <= endDate) {
    const newDate = new Date(startDate.getTime())

    dates.push(newDate)

    startDate.setUTCDate(startDate.getUTCDate() + 1)
  }

  return dates
}

export function generateFinalResultDate(date: Date) {
  let day: string | number = date.getUTCDate()
  let month: string | number = date.getUTCMonth() + 1
  const year = date.getUTCFullYear()

  if (day < 10) {
    day = `0${day}`
  } else {
    day = day.toString()
  }

  if (month < 10) {
    month = `0${month}`
  } else {
    month = month.toString()
  }

  return `${day}/${month}/${year}`
}

export function generateBookingQueryParamDate(date: Date) {
  let day: string | number = date.getUTCDate()
  let month: string | number = date.getUTCMonth() + 1
  const year = date.getUTCFullYear()

  if (day < 10) {
    day = `0${day}`
  } else {
    day = day.toString()
  }

  if (month < 10) {
    month = `0${month}`
  } else {
    month = month.toString()
  }

  return `${year}-${month}-${day}`
}