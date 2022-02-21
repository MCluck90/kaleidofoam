import * as vscode from 'vscode'
import { addDays, toDateLink } from '../../util/date'
import { Feature } from '../types'
import { LastWeekSnippet } from './types'

const generateLastWeekSnippets = (): LastWeekSnippet[] => {
  const lastSunday = new Date()
  lastSunday.setDate(lastSunday.getDate() - 7 - lastSunday.getDay())
  const daysOfTheWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ]

  return daysOfTheWeek.map((day, index) => ({
    snippet: `/last-${day.toLowerCase()}`,
    label: `Last ${day}`,
    content: toDateLink(addDays(lastSunday, index)),
  }))
}

const snippetCompletions: vscode.CompletionItemProvider = {
  provideCompletionItems(document, position, token, context) {
    if (context.triggerKind === vscode.CompletionTriggerKind.Invoke) {
      // Default to VS Code word-based suggestions
      return []
    }

    const range = document.getWordRangeAtPosition(position, /\S+/)
    const completionItems = generateLastWeekSnippets().map((item) => {
      const completionItem = new vscode.CompletionItem(
        item.snippet,
        vscode.CompletionItemKind.Snippet
      )
      completionItem.insertText = item.content
      completionItem.detail = `${item.content} - ${item.label}`
      completionItem.range = range
      return completionItem
    })
    return completionItems
  },
}

/**
 * Snippets for generating dates in the last week.
 * Examples: /last-friday, /last-monday
 */
export const lastWeekSnippetsFeature: Feature = {
  setup(context) {
    vscode.languages.registerCompletionItemProvider(
      'markdown',
      snippetCompletions,
      '/'
    )
  },
}
