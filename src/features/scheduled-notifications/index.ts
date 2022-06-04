import * as notifier from 'node-notifier'
import * as vscode from 'vscode'
import { timeToDate, toYYYYMMDD } from '../../util/date'
import { Feature } from '../types'

interface ScheduledItem {
  line: Number
  time: Date
  message: string
}

enum Notifications {
  None = 'none',
  System = 'system',
  VSCode = 'vscode',
}

const hashScheduledItem = (item: ScheduledItem) =>
  `${item.time.getHours()}:${item.time.getMinutes()}-${item.message}`

const extractScheduledItems = (content: string): ScheduledItem[] => {
  const matches = Array.from(content.matchAll(/\[ \] (\d\d:\d\d) \| (.+)/g))
  const items = matches.map(({ 1: time, 2: message, index, input = '' }) => ({
    line: input.substring(0, index).split('\n').length || 1,
    time: timeToDate(time),
    message,
  }))
  items.sort((a, b) => +a.time - +b.time)
  return items
}

const notify = (message: string, path: string = '', line: Number = 1) => {
  const notifications = vscode.workspace
    .getConfiguration('kaleidofoam')
    .get<Notifications>('notifications')

  switch (notifications) {
    case Notifications.VSCode:
      vscode.window.showInformationMessage(
        `KaleidoFoam reminder - [${message}](${path}#L${line})`
      )
      break

    case Notifications.System:
      notifier.notify({
        title: 'KaleidoFoam reminder',
        message: message,
      })
      break
  }
}

let finishedItems = new Set<string>()
let lastDay = ''

/**
 * Show notifications for scheduled todo items
 */
export const scheduledNotificationsFeature: Feature = {
  setup() {
    setTimeout(async function heartbeat() {
      const notifications = vscode.workspace
        .getConfiguration('kaleidofoam')
        .get<Notifications>('notifications')

      if (notifications === Notifications.None) {
        setTimeout(heartbeat, 1000)
        return
      }

      const minutesBeforeItem =
        vscode.workspace
          .getConfiguration('kaleidofoam')
          .get<number>('minutesBeforeNotifications') || 0
      const today = toYYYYMMDD(new Date())
      if (today !== lastDay) {
        finishedItems = new Set()
        lastDay = today
      }

      const files = await vscode.workspace.findFiles(`dailies/${today}.md`)
      if (files.length === 0) {
        setTimeout(heartbeat, 1000)
        return
      }

      const dailyNote = files[0]
      const content = (await vscode.workspace.fs.readFile(dailyNote)).toString()

      const now = new Date()
      now.setSeconds(0)
      now.setMilliseconds(0)
      const scheduledItems = extractScheduledItems(content)
      const upcomingItems = scheduledItems.filter(
        (item) =>
          +item.time >= +now &&
          +item.time - +now <= minutesBeforeItem * 60 * 1000 &&
          !finishedItems.has(hashScheduledItem(item))
      )

      for (const item of upcomingItems) {
        finishedItems.add(hashScheduledItem(item))
        notify(item.message, dailyNote.toString(), item.line)
      }

      setTimeout(heartbeat, 60 * 1000)
    }, 0)
  },
}
