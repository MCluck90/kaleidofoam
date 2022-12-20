import * as vscode from 'vscode'
import { createAndOpenDailyNote } from '../../note-creation'
import {
  addDays,
  getDateFromDocument,
  getEndOfWeek,
  getStartOfWeek,
  toWeeklyLink,
  toYYYYMMDD,
} from '../../util/date'
import { Feature } from '../types'

/**
 * Create links between the current date note, the previous date note, the next date note, and the weekly level notes
 */
export const dailyEdgeLinksFeature: Feature = {
  setup(context: vscode.ExtensionContext) {
    context.subscriptions.push(
      vscode.commands.registerCommand(
        'kaleidofoam.generateDailyEdgeLinks',
        async () => {
          const editor = vscode.window.activeTextEditor
          if (!editor) {
            vscode.window.showErrorMessage('Must be editing a daily note.')
            return
          }

          const workspaceFolder =
            vscode.workspace.workspaceFolders?.[0].uri.path
          if (!workspaceFolder) {
            vscode.window.showErrorMessage('Unable to access workspace folder.')
            return
          }

          const currentFilePath = editor.document.uri.path
          const relativePath = currentFilePath.replace(workspaceFolder, '')
          if (!relativePath.startsWith('/dailies')) {
            vscode.window.showErrorMessage(
              'Should only run this on daily notes.'
            )
            return
          }

          if (editor.document.lineCount < 3) {
            await editor.edit((editBuilder) => {
              const lastLine = editor.document.lineAt(
                editor.document.lineCount - 1
              )
              editBuilder.insert(lastLine.range.end, '\n\n')
            })
          }

          const linkLine = editor.document.lineAt(2)
          if (linkLine.text.trim() !== '') {
            return
          }

          const noteDate = getDateFromDocument(editor.document)
          const yesterday = toYYYYMMDD(addDays(noteDate, -1))
          const tomorrow = toYYYYMMDD(addDays(noteDate, 1))

          const startOfWeek = getStartOfWeek(noteDate)
          const endOfWeek = getEndOfWeek(noteDate)
          const weeklyNoteLink = toWeeklyLink(startOfWeek, endOfWeek)
          await editor.edit((editBuilder) => {
            editBuilder.insert(
              linkLine.range.end,
              `${weeklyNoteLink}\n\n[[${yesterday}]] | [[${tomorrow}]]`
            )
          })

          vscode.commands.executeCommand(
            'kaleidofoam.createWeeklyNote',
            noteDate
          )
        }
      )
    )

    const registerGoToRelativeDay = (command: string, offset: number) => {
      context.subscriptions.push(
        vscode.commands.registerCommand(command, async () => {
          const editor = vscode.window.activeTextEditor
          if (!editor) {
            vscode.window.showErrorMessage('Must be editing a daily note.')
            return
          }

          const workspaceFolder =
            vscode.workspace.workspaceFolders?.[0].uri.path
          if (!workspaceFolder) {
            vscode.window.showErrorMessage('Unable to access workspace folder.')
            return
          }

          const currentFilePath = editor.document.uri.path
          const relativePath = currentFilePath.replace(workspaceFolder, '')
          if (!relativePath.startsWith('/dailies')) {
            vscode.window.showErrorMessage(
              'Should only run this on daily notes.'
            )
            return
          }

          const noteDate = getDateFromDocument(editor.document)
          const yesterday = addDays(noteDate, offset)
          createAndOpenDailyNote(yesterday)
        })
      )
    }

    registerGoToRelativeDay('kaleidofoam.openYesterday', -1)
    registerGoToRelativeDay('kaleidofoam.openTomorrow', 1)
  },
}
