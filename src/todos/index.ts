import { dateToTime } from '../util/date'
import { Todo, TodoState } from './types'

/**
 * Convert a Todo to Markdown
 */
export const serializeTodo = (todo: Todo) => {
  const serialize = (todo: Todo, depth = 0): string => {
    const todoState = todo.state === TodoState.None ? '' : ` ${todo.state}`
    const deadline = todo.deadline ? `${dateToTime(todo.deadline)} | ` : ''
    const tag = todo.tag ? ` @${todo.tag}` : ''
    const comment = todo.comment ? `// ${todo.comment}` : ''
    const children = todo.children
      .map((child) => serialize(child, depth + 1))
      .join('\n')
    const linebreak = todo.children.length ? '\n' : ''
    const line =
      `-${todoState} ${deadline}${todo.message}${tag} ${comment}`.trim()
    const indentation = new Array(depth * 2).fill(' ').join('')
    return `${indentation}${line}${linebreak}${children}`
  }
  return serialize(todo)
}

export { todoParser } from './parser'
export * from './types'
