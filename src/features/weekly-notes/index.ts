import * as vscode from 'vscode'
import { addDays, getDateFromDocument } from '../../util/date'
import { createAndOpenWeeklyNote, createWeeklyNote } from '../../note-creation'
import { Feature } from '../types'
import { weeklyNoteSnippetCompletions } from './snippets'

/**
 * Create and open weekly level notes
 */
export const weeklyNotesFeature: Feature = {
  setup(context) {
    vscode.languages.registerCompletionItemProvider(
      'markdown',
      weeklyNoteSnippetCompletions,
      '/'
    )

    context.subscriptions.push(
      vscode.commands.registerCommand('kaleidofoam.openLastWeek', () => {
        createAndOpenWeeklyNote(addDays(new Date(), -7))
      })
    )
    context.subscriptions.push(
      vscode.commands.registerCommand('kaleidofoam.openThisWeek', () => {
        createAndOpenWeeklyNote(addDays(new Date(), 0))
      })
    )
    context.subscriptions.push(
      vscode.commands.registerCommand('kaleidofoam.openNextWeek', () => {
        createAndOpenWeeklyNote(addDays(new Date(), 7))
      })
    )
    context.subscriptions.push(
      vscode.commands.registerCommand('kaleidofoam.openWeekOfNote', () => {
        const editor = vscode.window.activeTextEditor
        const isDailyNote = editor?.document.uri.fsPath.includes('dailies')
        if (!editor || !isDailyNote) {
          vscode.window.showErrorMessage('Must be editing a daily note.')
          return
        }

        const noteDate = getDateFromDocument(editor.document)
        createAndOpenWeeklyNote(noteDate)
      })
    )
    context.subscriptions.push(
      vscode.commands.registerCommand('kaleidofoam.createWeeklyNote', (date) =>
        createWeeklyNote(date)
      )
    )
  },
}
