import * as vscode from 'vscode'
import { getCurrentTime } from '../../util/date'
import { Feature } from '../types'

/**
 * Add a new entry to the Log
 */
export const addToLogFeature: Feature = {
  setup(context) {
    context.subscriptions.push(
      vscode.commands.registerCommand('kaleidofoam.addToLog', async () => {
        const editor = vscode.window.activeTextEditor
        if (!editor) {
          vscode.window.showErrorMessage(
            'Must be editing a note to add to the log.'
          )
          return
        }

        let foundLog = false
        let nextFreeLine: number | null = null
        for (let i = 0; i < editor.document.lineCount; i++) {
          const line = editor.document.lineAt(i)
          if (!foundLog && line.text === '## Log') {
            foundLog = true
            continue
          }

          if (foundLog && line.text === '') {
            nextFreeLine = i
            break
          }
        }

        if (nextFreeLine === null) {
          vscode.window.showErrorMessage('Failed to find free line after log.')
          return
        }

        const nextFreeLinePosition = new vscode.Position(nextFreeLine, 0)
        editor.selection = new vscode.Selection(
          nextFreeLinePosition,
          nextFreeLinePosition
        )
        const startOfLogEntry = `- ${getCurrentTime()} `
        await editor.edit((editBuilder) => {
          editBuilder.insert(nextFreeLinePosition, `${startOfLogEntry}\n`)
        })

        const startOfLogEntryPosition = new vscode.Position(
          nextFreeLine,
          startOfLogEntry.length
        )
        editor.selection = new vscode.Selection(
          startOfLogEntryPosition,
          startOfLogEntryPosition
        )

        vscode.commands.executeCommand('revealLine', {
          lineNumber: nextFreeLine,
          at: 'center',
        })
      })
    )
  },
}
