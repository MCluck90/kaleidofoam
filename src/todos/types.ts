export enum TodoState {
  Incomplete = '[ ]',
  Complete = '[x]',
  Forwarded = '[>]',
  Cancelled = 'x',
  None = '',
}

export interface Todo {
  state: TodoState
  message: string
  tag: string | null
  comment: string | null
  deadline: Date | null
  completionTime: Date | null
  children: Todo[]
}
