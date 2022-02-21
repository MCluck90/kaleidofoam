import * as vscode from 'vscode'

/**
 * Converts a single digit number to one with with leading zero
 * ```ts
 * leftPadZero(9) === '09'
 * leftPadZero(10) === '10'
 * ```
 */
const leftPadZero = (date: number) => {
  if (date < 10) {
    return `0${date}`
  }
  return `${date}`
}

/**
 * Get the first day of the week (Sunday)
 */
export const getStartOfWeek = (date: Date) => {
  const ref = new Date(date)
  ref.setDate(date.getDate() - date.getDay())
  return ref
}

/**
 * Get the last day of the week (Saturday)
 */
export const getEndOfWeek = (date: Date) => {
  const ref = new Date(date)
  ref.setDate(date.getDate() + (6 - date.getDay()))
  return ref
}

/**
 * Add a number of days to the given date.
 * Returns a new `Date`
 */
export const addDays = (date: Date, days: number) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

/**
 * Convert a date to a YYYY-MM-DD string
 */
export const toYYYYMMDD = (date: Date) => {
  const year = date.getFullYear()
  const month = leftPadZero(date.getMonth() + 1)
  const day = leftPadZero(date.getDate())
  return `${year}-${month}-${day}`
}

export const fromYYYYMMDD = (text: string) => {
  if (!text.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return null
  }

  const [year, month, day] = text.split('-').map(Number)

  const date = new Date()
  date.setFullYear(year)
  date.setMonth(month - 1)
  date.setDate(day)
  return date
}

/**
 * Convert a date to a wikilink
 */
export const toDateLink = (date: Date) => `[[${toYYYYMMDD(date)}]]`

/**
 * Convert a date range to a weekly note name
 */
export const toWeeklyNoteName = (start: Date, end: Date) =>
  `week-of-${toYYYYMMDD(start)}_${toYYYYMMDD(end)}`

/**
 * Convert a weekly note name to a range
 */
export const fromWeeklyNoteName = (name: string) => {
  const pattern = /^week-of-(\d{4}-\d{2}-\d{2})_(\d{4}-\d{2}-\d{2})$/
  const matches = name.match(pattern)
  if (!matches) {
    return null
  }

  const start = fromYYYYMMDD(matches[1])
  const end = fromYYYYMMDD(matches[2])
  if (!start || !end) {
    return null
  }
  return [start, end]
}

/**
 * Convert a date range to a weekly note link
 */
export const toWeeklyLink = (start: Date, end: Date) =>
  `[[${toWeeklyNoteName(start, end)}]]`

/**
 * Converts a time to a date.
 * Time format: `HH:MM`
 */
export const timeToDate = (time: string): Date => {
  const today = new Date()
  const [hour, minute] = time.split(':')
  today.setHours(Number(hour))
  today.setMinutes(Number(minute))
  today.setSeconds(0)
  today.setMilliseconds(0)
  return today
}

export const dateToTime = (date: Date) =>
  `${leftPadZero(date.getHours())}:${leftPadZero(date.getMinutes())}`

/**
 * Get the name of the day of the week.
 * Ex. 'Monday'
 */
export const getDayOfTheWeek = (date: Date) => {
  switch (date.getDay()) {
    case 0:
      return 'Sunday'
    case 1:
      return 'Monday'
    case 2:
      return 'Tuesday'
    case 3:
      return 'Wednesday'
    case 4:
      return 'Thursday'
    case 5:
      return 'Friday'
    case 6:
      return 'Saturday'
    default:
      throw new Error(`Unknown day: ${date.getDay()}`)
  }
}

/**
 * Get the date of a given document.
 */
export const getDateFromDocument = (document: vscode.TextDocument) => {
  const [year, month, day] = document
    .lineAt(0)
    .text.replace('#', '')
    .trim()
    .split('-')
  const date = new Date()
  date.setFullYear(Number(year))
  date.setMonth(Number(month) - 1)
  date.setDate(Number(day))
  return date
}

/**
 * Gets the current time in the format: `HH:MM`
 */
export const getCurrentTime = () => dateToTime(new Date())
