import { TextEncoder } from 'util'
import * as vscode from 'vscode'
import {
  addDays,
  getDayOfTheWeek,
  toWeeklyLink,
  toYYYYMMDD,
} from '../../util/date'
import { createDailyNote, createWeeklyNote } from '../../note-creation'
import { Feature } from '../types'
import { getNoteType, isDateNote, isWeeklyNote } from '../../util/note-type'
import { isNone } from 'fp-ts/lib/Option'

async function forwardFromDailyNote(
  editor: vscode.TextEditor,
  workspaceFolder: vscode.WorkspaceFolder,
  date: Date
) {
  const nextWeekOfDays = new Array(7)
    .fill(0)
    .map((_, i) => addDays(date, i + 1))

  const weekOfDayLookup = Object.fromEntries(
    nextWeekOfDays.map((date, i) => {
      // Doing it this way means I can either type the day of the week or how many days in to the future
      // and it will get me the right option.
      const index = `${i + 1}`
      if (i === 0) {
        return [`${index}: Tomorrow`, date]
      }
      if (i === 6) {
        return [`${index}: Next week`, date]
      }
      return [`${i + 1}: ${getDayOfTheWeek(date)}`, date]
    })
  )

  const selectedDay = await vscode.window.showQuickPick(
    Object.keys(weekOfDayLookup)
  )

  if (selectedDay === undefined) {
    return
  }

  const cursorPosition = editor.selection.active
  const line = editor.document.lineAt(cursorPosition.line)

  const nextDate = weekOfDayLookup[selectedDay]
  await createDailyNote(nextDate, workspaceFolder.uri)

  // Copy the item to the designated note
  const nextDateNotePath = vscode.Uri.joinPath(
    workspaceFolder.uri,
    `dailies/${toYYYYMMDD(nextDate)}.md`
  )
  const nextDateNoteContents = (
    await vscode.workspace.fs.readFile(nextDateNotePath)
  ).toString()
  await vscode.workspace.fs.writeFile(
    nextDateNotePath,
    new TextEncoder().encode(
      nextDateNoteContents.replace('## TODO\n', `## TODO\n${line.text}\n`)
    )
  )

  // Update the current item to show as forwarded
  await editor.edit((editBuilder) => {
    editBuilder.replace(
      line.range,
      line.text.replace('- [ ]', '- [>]') + ` [[${toYYYYMMDD(nextDate)}]]`
    )
  })
}

async function unforwardTodo(editor: vscode.TextEditor) {
  const cursorPosition = editor.selection.active
  const line = editor.document.lineAt(cursorPosition.line)

  const forwardedDateMatch = line.text.match(/\s*\[\[(\d{4}-\d{2}-\d{2})]]$/)

  if (forwardedDateMatch) {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]
    if (!workspaceFolder) {
      vscode.window.showErrorMessage('Unable to access workspace folder.')
      return
    }

    // Remove the item from the forward date
    const forwardedDateNotePath = vscode.Uri.joinPath(
      workspaceFolder.uri,
      `dailies/${forwardedDateMatch[1]}.md`
    )

    const expectedForwardedLine = line.text
      .replace('- [>]', '- [ ]')
      .replace(/\s*\[\[\d{4}-\d{2}-\d{2}]]$/, '')
    const forwardedDateNoteContents = (
      await vscode.workspace.fs.readFile(forwardedDateNotePath)
    ).toString()

    await vscode.workspace.fs.writeFile(
      forwardedDateNotePath,
      new TextEncoder().encode(
        forwardedDateNoteContents.replace(`${expectedForwardedLine}\n`, '')
      )
    )
  }

  await editor.edit((editBuilder) => {
    editBuilder.replace(
      line.range,
      line.text
        .replace('- [>]', '- [ ]')
        .replace(/\s*\[\[\d{4}-\d{2}-\d{2}]]$/, '')
    )
  })
}

async function forwardFromWeeklyNote(editor: vscode.TextEditor, start: Date) {
  const nextFewWeeks = new Array(3)
    .fill(0)
    .map((_, i) => addDays(start, (i + 1) * 7))

  const weeklyLookup = Object.fromEntries(
    nextFewWeeks.map((date, i) => {
      const index = `${i + 1}`
      if (i === 0) {
        return [`${index}: Next week`, date]
      }
      return [`${index}: In ${index} weeks`, date]
    })
  )

  const selectedWeek = await vscode.window.showQuickPick(
    Object.keys(weeklyLookup)
  )

  if (selectedWeek === undefined) {
    return
  }

  const cursorPosition = editor.selection.active
  const line = editor.document.lineAt(cursorPosition.line)

  const nextStart = weeklyLookup[selectedWeek]
  const nextWeeklyNotePath = await createWeeklyNote(nextStart)
  if (!nextWeeklyNotePath) {
    return vscode.window.showErrorMessage(
      'Failed to read or create new weekly note'
    )
  }

  // Copy the item to the designated note
  const nextDateNoteContents = (
    await vscode.workspace.fs.readFile(nextWeeklyNotePath)
  ).toString()
  await vscode.workspace.fs.writeFile(
    nextWeeklyNotePath,
    new TextEncoder().encode(
      nextDateNoteContents.replace('## TODO\n', `## TODO\n${line.text}\n`)
    )
  )

  // Update the current item to show as forwarded
  await editor.edit((editBuilder) => {
    editBuilder.replace(
      line.range,
      line.text.replace('- [ ]', '- [>]') +
        ` ${toWeeklyLink(nextStart, addDays(nextStart, 6))}`
    )
  })
}

async function unforwardWeeklyNote(editor: vscode.TextEditor) {
  const cursorPosition = editor.selection.active
  const line = editor.document.lineAt(cursorPosition.line)

  const forwardedDateMatch = line.text.match(
    /\s*\[\[(week-of-\d{4}-\d{2}-\d{2}_\d{4}-\d{2}-\d{2})]]$/
  )

  if (forwardedDateMatch) {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]
    if (!workspaceFolder) {
      vscode.window.showErrorMessage('Unable to access workspace folder.')
      return
    }

    // Remove the item from the forward date
    const forwardedWeekNotePath = vscode.Uri.joinPath(
      workspaceFolder.uri,
      `weeklies/${forwardedDateMatch[1]}.md`
    )

    const expectedForwardedLine = line.text
      .replace('- [>]', '- [ ]')
      .replace(/\s*\[\[week-of-\d{4}-\d{2}-\d{2}_\d{4}-\d{2}-\d{2}]]$/, '')
    const forwardedWeekNoteContents = (
      await vscode.workspace.fs.readFile(forwardedWeekNotePath)
    ).toString()

    await vscode.workspace.fs.writeFile(
      forwardedWeekNotePath,
      new TextEncoder().encode(
        forwardedWeekNoteContents.replace(`${expectedForwardedLine}\n`, '')
      )
    )
  }

  await editor.edit((editBuilder) => {
    editBuilder.replace(
      line.range,
      line.text
        .replace('- [>]', '- [ ]')
        .replace(/\s*\[\[week-of-\d{4}-\d{2}-\d{2}_\d{4}-\d{2}-\d{2}]]$/, '')
    )
  })
}

/**
 * Forward a todo item to a future date.
 */
export const forwardTodoFeature: Feature = {
  setup(context) {
    context.subscriptions.push(
      vscode.commands.registerCommand('kaleidofoam.forwardTodo', async () => {
        const editor = vscode.window.activeTextEditor
        if (!editor) {
          return vscode.window.showErrorMessage(
            'Must open an editor to forward a todo'
          )
        }

        const workspaceFolder = vscode.workspace.workspaceFolders?.[0]
        if (!workspaceFolder) {
          vscode.window.showErrorMessage('Unable to access workspace folder.')
          return
        }

        const noteTypeOption = getNoteType(editor.document)
        if (isNone(noteTypeOption)) {
          // If this isn't a daily or weekly note, just mark it as forwarded and forget it
          const cursorPosition = editor.selection.active
          const line = editor.document.lineAt(cursorPosition.line)
          await editor.edit((editBuilder) => {
            editBuilder.replace(line.range, line.text.replace('- [ ]', '- [>]'))
          })
          return
        }

        const noteType = noteTypeOption.value
        if (isDateNote(noteType)) {
          forwardFromDailyNote(editor, workspaceFolder, noteType.date)
        } else if (isWeeklyNote(noteType)) {
          forwardFromWeeklyNote(editor, noteType.start)
        }
      })
    )

    context.subscriptions.push(
      vscode.commands.registerCommand('kaleidofoam.unforwardTodo', async () => {
        const editor = vscode.window.activeTextEditor
        if (!editor) {
          return vscode.window.showErrorMessage(
            'Must open an editor to unforward a todo'
          )
        }

        const workspaceFolder = vscode.workspace.workspaceFolders?.[0]
        if (!workspaceFolder) {
          vscode.window.showErrorMessage('Unable to access workspace folder.')
          return
        }

        const noteTypeOption = getNoteType(editor.document)
        if (isNone(noteTypeOption)) {
          // If this isn't a daily or weekly note, just remove the forwarded marker and forget it
          const cursorPosition = editor.selection.active
          const line = editor.document.lineAt(cursorPosition.line)
          await editor.edit((editBuilder) => {
            editBuilder.replace(line.range, line.text.replace('- [>]', '- [ ]'))
          })
          return
        }

        const noteType = noteTypeOption.value
        if (isDateNote(noteType)) {
          unforwardTodo(editor)
        } else if (isWeeklyNote(noteType)) {
          unforwardWeeklyNote(editor)
        }
      })
    )
  },
}
