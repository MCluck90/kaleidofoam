import * as vscode from 'vscode'
import { Feature } from '../types'

interface MarkdownSection {
  'editor.wordWrapColumn'?: number
  'editor.rulers'?: number[]
}

const isMarkdownSection = (obj: unknown): obj is MarkdownSection =>
  obj !== null && obj !== undefined

/**
 * Toggles the word wrap column between 120 and 80. Useful when switching between full size and split screen
 */
export const toggleWordWrapColumnFeature: Feature = {
  setup(context) {
    context.subscriptions.push(
      vscode.commands.registerCommand(
        'kaleidofoam.toggleWordWrapColumn',
        async () => {
          const workspaceFolder = vscode.workspace.workspaceFolders?.[0]
          if (!workspaceFolder) {
            vscode.window.showErrorMessage('Unable to access workspace folder')
            return
          }

          const config = vscode.workspace.getConfiguration(
            undefined,
            workspaceFolder
          )
          const configValue = config.inspect('[markdown]')?.workspaceFolderValue
          if (isMarkdownSection(configValue)) {
            if (
              !configValue['editor.wordWrapColumn'] ||
              configValue['editor.wordWrapColumn'] === 80
            ) {
              configValue['editor.wordWrapColumn'] = 120
              configValue['editor.rulers'] = [120]
            } else {
              configValue['editor.wordWrapColumn'] = 80
              configValue['editor.rulers'] = [80]
            }
            config.update('[markdown]', configValue)
          } else {
            vscode.window.showErrorMessage(
              'Could not find [markdown] section in workspace settings'
            )
          }
        }
      )
    )
  },
}
