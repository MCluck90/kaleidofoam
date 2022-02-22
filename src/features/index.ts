import { addToLogFeature } from './add-to-log'
import { addTodoFeature } from './add-todo'
import { dailyEdgeLinksFeature } from './daily-edge-links'
import { dailyNoteFeature } from './daily-note'
import { forwardTodoFeature } from './forward-todo'
import { lastWeekSnippetsFeature } from './last-week-snippets'
import { scheduledNotificationsFeature } from './scheduled-notifications'
import { toggleTodoFeature } from './toggle-todo'
import { toggleTodoTagsFeature } from './toggle-todo-tags'
import { toggleWordWrapColumnFeature } from './toggle-word-wrap-column'
import { Feature } from './types'
import { weeklyNotesFeature } from './weekly-notes'

export const features: Feature[] = [
  addToLogFeature,
  addTodoFeature,
  dailyEdgeLinksFeature,
  dailyNoteFeature,
  forwardTodoFeature,
  lastWeekSnippetsFeature,
  scheduledNotificationsFeature,
  toggleTodoFeature,
  toggleTodoTagsFeature,
  toggleWordWrapColumnFeature,
  weeklyNotesFeature,
]
