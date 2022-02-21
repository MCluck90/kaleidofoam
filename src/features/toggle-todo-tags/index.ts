import * as vscode from 'vscode'
import { Feature } from '../types'

export const toggleTodoTagsFeature: Feature = {
  setup(context) {
    const toggleTodoTag = (tag: string) => async () => {
      const editor = vscode.window.activeTextEditor
      if (!editor) {
        vscode.window.showErrorMessage(
          'Must be editing a note to check off a todo item.'
        )
        return
      }

      const cursorPosition = editor.selection.active
      const line = editor.document.lineAt(cursorPosition.line)
      let updatedLine = line.text
      const existingTagMatch = line.text.match(/ @(focus|urgent|optional)/)
      if (existingTagMatch) {
        if (existingTagMatch[1] === tag) {
          updatedLine = updatedLine.replace(` @${tag}`, '')
        } else {
          updatedLine = updatedLine.replace(existingTagMatch[0], ` @${tag}`)
        }
      } else {
        updatedLine += ` @${tag}`
      }

      await editor.edit((editBuilder) => {
        editBuilder.replace(line.range, updatedLine)
      })
    }

    context.subscriptions.push(
      vscode.commands.registerCommand(
        'kaleidofoam.toggleTodoTag.focus',
        toggleTodoTag('focus')
      )
    )
    context.subscriptions.push(
      vscode.commands.registerCommand(
        'kaleidofoam.toggleTodoTag.urgent',
        toggleTodoTag('urgent')
      )
    )
    context.subscriptions.push(
      vscode.commands.registerCommand(
        'kaleidofoam.toggleTodoTag.optional',
        toggleTodoTag('optional')
      )
    )
  },
}
