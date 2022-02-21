import * as vscode from 'vscode'
import { features } from './features'

export function activate(context: vscode.ExtensionContext) {
  // Setup all of the features
  for (const feature of features) {
    feature.setup(context)
  }
}

export function deactivate() {}
