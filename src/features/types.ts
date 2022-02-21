import * as vscode from 'vscode'

export interface Feature {
  setup(context: vscode.ExtensionContext): Promise<void> | void
}
