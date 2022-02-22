import { TextEncoder } from 'util'
import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import {
  addDays,
  getEndOfWeek,
  getStartOfWeek,
  toWeeklyNoteName,
  toYYYYMMDD,
} from './util/date'
import { doesPathExist } from './util/fs'

type TemplateType = 'daily' | 'weekly'
const templatesDir = path.join(__dirname, 'templates')
const getTemplate = (type: TemplateType) =>
  fs.readFileSync(`${templatesDir}/${type}.md`).toString()

const toDaysOfTheWeek = (start: Date) => ({
  sunday: addDays(start, 0),
  monday: addDays(start, 1),
  tuesday: addDays(start, 2),
  wednesday: addDays(start, 3),
  thursday: addDays(start, 4),
  friday: addDays(start, 5),
  saturday: addDays(start, 6),
})

export const createDailyNote = async (date: Date, workspaceUri: vscode.Uri) => {
  const title = toYYYYMMDD(date)
  const notePath = vscode.Uri.joinPath(workspaceUri, `dailies/${title}.md`)
  if (await doesPathExist(notePath)) {
    return notePath
  }

  const startOfWeek = getStartOfWeek(date)
  const endOfWeek = getEndOfWeek(date)
  const weeklyNoteTitle = toWeeklyNoteName(startOfWeek, endOfWeek)

  const yesterday = toYYYYMMDD(addDays(date, -1))
  const tomorrow = toYYYYMMDD(addDays(date, 1))

  const template = getTemplate('daily')
  const contents = template
    .replace('$TITLE', title)
    .replace('$WEEKLY', `[[${weeklyNoteTitle}]]`)
    .replace('$YESTERDAY', `[[${yesterday}]]`)
    .replace('$TOMORROW', `[[${tomorrow}]]`)
  await vscode.workspace.fs.writeFile(
    notePath,
    new TextEncoder().encode(contents)
  )

  return notePath
}

export const createAndOpenDailyNote = async (date: Date) => {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri
  if (!workspaceFolder) {
    vscode.window.showErrorMessage('Could not get current workspace folder.')
    return
  }

  const notePath = await createDailyNote(date, workspaceFolder)
  if (notePath) {
    // Generate the week and other days of the week
    await createWeeklyNote(date)
    const document = await vscode.workspace.openTextDocument(notePath)
    vscode.window.showTextDocument(document)
  }
}

export const createWeeklyNote = async (
  date: Date
): Promise<vscode.Uri | null> => {
  const foamExtension = vscode.extensions.getExtension('foam.foam-vscode')
  if (!foamExtension) {
    vscode.window.showErrorMessage(
      "Can't make a weekly note without Foam installed."
    )
    return null
  }

  if (!foamExtension.isActive) {
    await foamExtension.activate()
  }

  const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri
  if (!workspaceFolder) {
    vscode.window.showErrorMessage('Could not get current workspace folder.')
    return null
  }

  let weeklyTemplate = ''
  try {
    weeklyTemplate = getTemplate('weekly')
  } catch (e) {
    console.error('Failed to find weekly template\n', e)
    vscode.window.showErrorMessage(
      'We could not find the weekly note template. This is a problem with the extension.'
    )
    return null
  }

  try {
    const start = getStartOfWeek(date)
    const end = getEndOfWeek(date)
    const noteName = toWeeklyNoteName(start, end)
    const weekliesPath = vscode.Uri.joinPath(workspaceFolder, 'weeklies')
    const notePath = vscode.Uri.joinPath(weekliesPath, `${noteName}.md`)
    await vscode.workspace.fs.createDirectory(weekliesPath)
    if (await doesPathExist(notePath)) {
      return notePath
    }

    const daysOfTheWeek = toDaysOfTheWeek(start)
    const contents = weeklyTemplate
      .replace(/\$TITLE/g, noteName)
      .replace(/\$SUNDAY/g, toYYYYMMDD(daysOfTheWeek.sunday))
      .replace(/\$MONDAY/g, toYYYYMMDD(daysOfTheWeek.monday))
      .replace(/\$TUESDAY/g, toYYYYMMDD(daysOfTheWeek.tuesday))
      .replace(/\$WEDNESDAY/g, toYYYYMMDD(daysOfTheWeek.wednesday))
      .replace(/\$THURSDAY/g, toYYYYMMDD(daysOfTheWeek.thursday))
      .replace(/\$FRIDAY/g, toYYYYMMDD(daysOfTheWeek.friday))
      .replace(/\$SATURDAY/g, toYYYYMMDD(daysOfTheWeek.saturday))

    await vscode.workspace.fs.writeFile(
      notePath,
      new TextEncoder().encode(contents)
    )

    const createDaysOfTheWeekPromise = Promise.all([
      createDailyNote(daysOfTheWeek.sunday, workspaceFolder),
      createDailyNote(daysOfTheWeek.monday, workspaceFolder),
      createDailyNote(daysOfTheWeek.tuesday, workspaceFolder),
      createDailyNote(daysOfTheWeek.wednesday, workspaceFolder),
      createDailyNote(daysOfTheWeek.thursday, workspaceFolder),
      createDailyNote(daysOfTheWeek.friday, workspaceFolder),
      createDailyNote(daysOfTheWeek.saturday, workspaceFolder),
    ])

    await createDaysOfTheWeekPromise

    return notePath
  } catch (err) {
    console.error(err)
    throw err
  }
}

export const createAndOpenWeeklyNote = async (date: Date) => {
  const notePath = await createWeeklyNote(date)
  if (notePath) {
    const document = await vscode.workspace.openTextDocument(notePath)
    vscode.window.showTextDocument(document)
  }
}
