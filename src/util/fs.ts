import * as vscode from 'vscode'

export const doesPathExist = async (uri: vscode.Uri) => {
  try {
    await vscode.workspace.fs.stat(uri)
    return true
  } catch {
    return false
  }
}
