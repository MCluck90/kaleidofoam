import * as vscode from 'vscode'
import { Feature } from '../types'

/**
 * Add a new TODO entry
 */
export const addTodoFeature: Feature = {
  setup(context) {
    context.subscriptions.push(
      vscode.commands.registerCommand('kaleidofoam.addTodo', async () => {
        const editor = vscode.window.activeTextEditor
        if (!editor) {
          vscode.window.showErrorMessage('Must be editing a note to add a todo')
          return
        }

        let foundTodoSection = false
        let nextFreeLine: number | null = null
        for (let i = 0; i < editor.document.lineCount; i++) {
          const line = editor.document.lineAt(i)
          if (!foundTodoSection && line.text === '## TODO') {
            foundTodoSection = true
            continue
          }

          if (foundTodoSection && line.text === '') {
            nextFreeLine = i
            break
          }
        }

        if (nextFreeLine === null) {
          vscode.window.showErrorMessage(
            'Failed to find free line after todo section.'
          )
          return
        }

        const nextFreeLinePosition = new vscode.Position(nextFreeLine, 0)
        editor.selection = new vscode.Selection(
          nextFreeLinePosition,
          nextFreeLinePosition
        )
        const startOfTodoEntry = '- [ ] '
        await editor.edit((editBuilder) => {
          editBuilder.insert(nextFreeLinePosition, `${startOfTodoEntry}\n`)
        })

        const startOfTodoEntryPosition = new vscode.Position(
          nextFreeLine,
          startOfTodoEntry.length
        )
        editor.selection = new vscode.Selection(
          startOfTodoEntryPosition,
          startOfTodoEntryPosition
        )

        vscode.commands.executeCommand('revealLine', {
          lineNumber: nextFreeLine,
          at: 'center',
        })
      })
    )
  },
}
