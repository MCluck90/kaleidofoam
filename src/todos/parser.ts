import {
  text,
  regexp,
  maybe,
  constant,
  zeroOrMore,
  Parser,
  pair,
} from 'parsnip-ts'
import { cStyleLineComment } from 'parsnip-ts/comments'
import { ParseError } from 'parsnip-ts/error'
import { createToken } from 'parsnip-ts/token'
import { whitespace, ws } from 'parsnip-ts/whitespace'
import { Todo, TodoState } from './types'

const token = createToken(whitespace)

const incompleteTodoState = text('[ ]').and(constant(TodoState.Incomplete))
const completeTodoState = text('[x]').and(constant(TodoState.Complete))
const forwardedTodoState = text('[>]').and(constant(TodoState.Forwarded))
const cancelledTodoState = text('x').and(constant(TodoState.Cancelled))
const noneTodoState = constant(TodoState.None)

const todoState = regexp(/-\s+/y).and(
  incompleteTodoState
    .or(completeTodoState)
    .or(forwardedTodoState)
    .or(cancelledTodoState)
    .or(noneTodoState)
)

const time = token(/\d{2}:\d{2}/y).map((hhmm) => {
  const [hour, minute] = hhmm.split(':')
  const deadline = new Date()
  deadline.setHours(Number(hour))
  deadline.setMinutes(Number(minute))
  return deadline
})

const deadline = time.skip(text('|'))

const link = regexp(/\[[^\]]*\]\(http[^)]+\)/y)
const notComment = regexp(/[^\/][^\/]/y)

const message = zeroOrMore(link.or(notComment)).map((s) => s.join('').trim())

enum TodoTag {
  Focus = '@focus',
  Urgent = '@urgent',
  Optional = '@optional',
}

// TODO: Define an actual grammar for TODO items then convert to parser
const tag = (() => {
  const focus = text('@focus').map(() => TodoTag.Focus)
  const urgent = text('@urgent').map(() => TodoTag.Urgent)
  const optional = text('@optional').map(() => TodoTag.Optional)
  return focus.or(urgent).or(optional)
})()

const comment = cStyleLineComment.map((c) => c.slice(2).trim())

let todoParser: Parser<Todo>

const todoParserHelper = (depth = 0): Parser<Todo> =>
  todoState.bind((state) =>
    ws
      .and(
        maybe(deadline).bind((deadline) =>
          message.bind((message) =>
            pair(ws.and(maybe(tag)), ws.and(maybe(comment))).map(
              ([tag, comment]): Todo => {
                const completionTimeResult = time.parseToEnd(comment || '')
                const completionTime =
                  completionTimeResult instanceof ParseError
                    ? null
                    : completionTimeResult

                return {
                  state,
                  tag,
                  message,
                  comment,
                  deadline,
                  completionTime,
                  children: [],
                }
              }
            )
          )
        )
      )
      .bind((todo) =>
        maybe(regexp(/\r?\n(\s\s)+/y)).bind((maybeIndent) => {
          const childDepth = (maybeIndent || '').length / 2

          if (childDepth > depth) {
            return zeroOrMore(todoParserHelper(childDepth)).map((children) => ({
              ...todo,
              children,
            }))
          }

          return constant(todo)
        })
      )
  )

todoParser = todoParserHelper(0)

export { todoParser }
