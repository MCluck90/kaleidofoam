import * as notifier from 'node-notifier'
import * as vscode from 'vscode'
import { timeToDate, toYYYYMMDD } from '../../util/date'
import { Feature } from '../types'

interface ScheduledItem {
  time: Date
  message: string
}

const hashScheduledItem = (item: ScheduledItem) =>
  `${item.time.getHours()}:${item.time.getMinutes()}-${item.message}`

const extractScheduledItems = (content: string): ScheduledItem[] => {
  const matches = Array.from(content.matchAll(/\[ \] (\d\d:\d\d) \| (.+)/g))
  const items = matches.map(([, time, message]) => ({
    time: timeToDate(time),
    message,
  }))
  items.sort((a, b) => +a.time - +b.time)
  return items
}

let finishedItems = new Set<string>()
let lastDay = ''

/**
 * Show notifications for scheduled todo items
 */
export const scheduledNotificationsFeature: Feature = {
  setup() {
    setTimeout(async function heartbeat() {
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
        notifier.notify({
          title: item.message,
          message: '- KaleidoFoam',
        })
      }

      setTimeout(heartbeat, 60 * 1000)
    }, 0)
  },
}
