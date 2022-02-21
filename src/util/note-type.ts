import { none, Option, some } from 'fp-ts/lib/Option'
import * as vscode from 'vscode'
import { fromWeeklyNoteName, fromYYYYMMDD } from './date'
import { isObject } from './type-guards'

export interface DateNote {
  date: Date
}

export interface WeeklyNote {
  start: Date
  end: Date
}

/**
 * Is the given object a `DateNote`?
 */
export const isDateNote = (obj: unknown): obj is DateNote =>
  isObject(obj) && 'date' in obj && obj.date instanceof Date

/**
 * Is the given object a `WeeklyNote`?
 */
export const isWeeklyNote = (obj: unknown): obj is WeeklyNote =>
  isObject(obj) &&
  'start' in obj &&
  'end' in obj &&
  obj.start instanceof Date &&
  obj.end instanceof Date

/**
 * Get the note type for a given document.
 */
export const getNoteType = (
  document: vscode.TextDocument
): Option<DateNote | WeeklyNote> => {
  const title = document.lineAt(0).text.replace('#', '').trim()
  const date = fromYYYYMMDD(title)
  if (date !== null) {
    return some({ date })
  }

  const range = fromWeeklyNoteName(title)
  if (range !== null) {
    return some({
      start: range[0],
      end: range[0],
    })
  }

  return none
}
