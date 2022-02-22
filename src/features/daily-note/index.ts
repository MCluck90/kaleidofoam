import * as vscode from 'vscode'
import { createAndOpenDailyNote } from '../../note-creation'
import { Feature } from '../types'

/**
 * Create/Open a daily note
 */
export const dailyNoteFeature: Feature = {
  setup: function (context): void | Promise<void> {
    vscode.commands.registerCommand('kaleidofoam.openToday', () => {
      createAndOpenDailyNote(new Date())
    })
  },
}
