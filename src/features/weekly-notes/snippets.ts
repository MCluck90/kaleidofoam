import * as vscode from 'vscode'
import {
  addDays,
  getEndOfWeek,
  getStartOfWeek,
  toWeeklyLink,
  toYYYYMMDD,
} from '../../util/date'
import { DateSnippet } from './types'

const toDaysOfWeekLinks = (start: Date) =>
  [
    ['Sunday', toYYYYMMDD(addDays(start, 0))],
    ['Monday', toYYYYMMDD(addDays(start, 1))],
    ['Tuesday', toYYYYMMDD(addDays(start, 2))],
    ['Wednesday', toYYYYMMDD(addDays(start, 3))],
    ['Thursday', toYYYYMMDD(addDays(start, 4))],
    ['Friday', toYYYYMMDD(addDays(start, 5))],
    ['Saturday', toYYYYMMDD(addDays(start, 6))],
  ]
    .map(([label, date]) => `- ${label}: [[${date}]]`)
    .join('\n')

const generateWeeklySnippets = (): DateSnippet[] => {
  const aWeekAgo = new Date()
  aWeekAgo.setDate(aWeekAgo.getDate() - 7)
  const today = new Date()
  const inAWeek = new Date()
  inAWeek.setDate(inAWeek.getDate() + 7)

  const lastWeek = {
    start: getStartOfWeek(aWeekAgo),
    end: getEndOfWeek(aWeekAgo),
  }
  const thisWeek = {
    start: getStartOfWeek(today),
    end: getEndOfWeek(today),
  }
  const nextWeek = {
    start: getStartOfWeek(inAWeek),
    end: getEndOfWeek(inAWeek),
  }
  return [
    {
      snippet: '/last-week',
      label: 'Last weeks weekly note',
      content: toWeeklyLink(lastWeek.start, lastWeek.end),
      start: lastWeek.start,
    },
    {
      snippet: '/last-week-days',
      label: 'All of the days for last week',
      content: toDaysOfWeekLinks(inAWeek),
    },
    {
      snippet: '/this-week',
      label: 'This weeks weekly note',
      content: toWeeklyLink(thisWeek.start, thisWeek.end),
      start: thisWeek.start,
    },
    {
      snippet: '/this-week-days',
      label: 'All of the days for this week',
      content: toDaysOfWeekLinks(today),
    },
    {
      snippet: '/next-week',
      label: 'Next weeks weekly note',
      content: toWeeklyLink(nextWeek.start, nextWeek.end),
      start: nextWeek.start,
    },
    {
      snippet: '/next-week-days',
      label: 'All of the days for next week',
      content: toDaysOfWeekLinks(inAWeek),
    },
  ]
}

class WeeklySnippetCompletionItem extends vscode.CompletionItem {
  startDate: Date | undefined
}

const createCompletionItem = ({
  snippet,
  label,
  content,
  start,
}: DateSnippet): WeeklySnippetCompletionItem => {
  const completionItem = new WeeklySnippetCompletionItem(
    snippet,
    vscode.CompletionItemKind.Snippet
  )
  completionItem.insertText = content
  completionItem.detail = `${completionItem.insertText} - ${label}`
  completionItem.startDate = start
  return completionItem
}

export const weeklyNoteSnippetCompletions: vscode.CompletionItemProvider = {
  provideCompletionItems: (document, position, token, context) => {
    if (context.triggerKind === vscode.CompletionTriggerKind.Invoke) {
      // Default to VS Code word-based suggestions
      return []
    }

    const range = document.getWordRangeAtPosition(position, /\S+/)
    const completionItems = generateWeeklySnippets().map((item) => {
      const completionItem = createCompletionItem(item)
      completionItem.range = range
      if (item.start) {
        completionItem.command = {
          command: 'kaleidofoam.createWeeklyNote',
          title: 'Create weekly note',
          arguments: [item.start],
        }
      }
      return completionItem
    })
    return completionItems
  },
}
