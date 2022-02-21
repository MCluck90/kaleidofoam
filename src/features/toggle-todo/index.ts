import * as vscode from 'vscode'
import { getCurrentTime } from '../../util/date'
import { Feature } from '../types'

function checkTodo(todoText: string, isDailyNote: boolean) {
  const time = isDailyNote ? ` // ${getCurrentTime()}` : ''
  const result = todoText
    .replace('- [ ]', '- [x]')
    .replace(' @focus', '')
    .replace(' @urgent', '')
    .replace(' @optional', '')
  return result + time
}

function uncheckTodo(todoText: string, isDailyNote: boolean) {
  const result = todoText.replace('- [x]', '- [ ]')
  return isDailyNote ? result.replace(/ \/\/.*$/, '') : result
}

/**
 * Toggle a todo item. Add timestamps to daily note todo items
 */
export const toggleTodoFeature: Feature = {
  setup(context) {
    context.subscriptions.push(
      vscode.commands.registerCommand('kaleidofoam.toggleTodo', async () => {
        const editor = vscode.window.activeTextEditor
        if (!editor) {
          vscode.window.showErrorMessage(
            'Must be editing a note to check off a todo item.'
          )
          return
        }

        const cursorPosition = editor.selection.active
        const line = editor.document.lineAt(cursorPosition.line)
        const todoIsUnchecked = line.text.includes('- [ ]')
        const todoIsChecked = line.text.includes('- [x]')
        if (!todoIsChecked && !todoIsUnchecked) {
          vscode.window.showErrorMessage(
            'Cursor must be on a line with a todo item.'
          )
          return
        }

        const isDailyNote = editor.document.uri.fsPath.includes('dailies')
        await editor.edit((editBuilder) => {
          editBuilder.replace(
            line.range,
            todoIsUnchecked
              ? checkTodo(line.text, isDailyNote)
              : uncheckTodo(line.text, isDailyNote)
          )
        })
      })
    )
  },
}
