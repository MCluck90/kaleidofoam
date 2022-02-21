import * as assert from 'assert'
import { ParseError } from 'parsnip-ts/error'
import { dateToTime, timeToDate } from '../../util/date'
import { serializeTodo, Todo, todoParser, TodoState } from '../../todos'

suite('Todo Parser Test Suite', () => {
  interface ExpectTodoResultProps {
    title: string
    source: string
    expected: Todo
  }

  function compareTodos(actual: Todo, expected: Todo) {
    assert.strictEqual(actual.state, expected.state, 'Expected equal `state`')
    assert.strictEqual(
      actual.message,
      expected.message,
      'Expected equal `message`'
    )

    assert.strictEqual(
      actual.comment,
      expected.comment,
      'Expected equal `comment`'
    )

    if (expected.deadline && actual.deadline) {
      assert.strictEqual(
        dateToTime(actual.deadline),
        dateToTime(expected.deadline),
        'Mismatched deadline'
      )
    } else if (expected.deadline) {
      throw new Error(
        'Expected to receive a deadline. Did not receive a deadline'
      )
    } else if (actual.deadline) {
      throw new Error(
        `Expected not to receive a deadline. Did receive a deadline: ${dateToTime(
          actual.deadline
        )}`
      )
    }

    if (expected.completionTime && actual.completionTime) {
      assert.strictEqual(
        dateToTime(actual.completionTime),
        dateToTime(expected.completionTime),
        'Mismatched completion time'
      )
    } else if (expected.completionTime) {
      throw new Error(
        'Expected to receive a completion time. Did not receive a completion time'
      )
    } else if (actual.completionTime) {
      throw new Error(
        `Expected not to receive a completion time. Did receive a completion time: ${dateToTime(
          actual.completionTime
        )}`
      )
    }

    if (expected.children.length && !actual.children.length) {
      throw new Error('Expected to receive children. Received none')
    } else if (!expected.children.length && actual.children.length) {
      throw new Error(
        `Expected not to receive children. Received ${actual.children.length}`
      )
    } else if (expected.children.length !== actual.children.length) {
      throw new Error(
        `Expected ${expected.children.length} children. Received ${actual.children.length}`
      )
    }

    for (let i = 0; i < expected.children.length; i++) {
      compareTodos(expected.children[i], actual.children[i])
    }
  }

  function expectTodoResult({
    title,
    source,
    expected,
  }: ExpectTodoResultProps) {
    test(title, () => {
      const actual = todoParser.parseToEnd(source.trim())
      if (actual instanceof ParseError) {
        throw actual
      }

      compareTodos(actual, expected)
    })
  }

  const baseTodo: Todo = {
    state: TodoState.None,
    message: '',
    tag: null,
    comment: null,
    deadline: null,
    completionTime: null,
    children: [],
  }

  expectTodoResult({
    title: 'Can parse a simple incomplete todo',
    source: '- [ ] Incomplete todo',
    expected: {
      ...baseTodo,
      state: TodoState.Incomplete,
      message: 'Incomplete todo',
    },
  })

  expectTodoResult({
    title: 'Can parse a simple complete todo',
    source: '- [x] Complete todo',
    expected: {
      ...baseTodo,
      state: TodoState.Complete,
      message: 'Complete todo',
    },
  })

  expectTodoResult({
    title: 'Can parse a simple forwarded todo',
    source: '- [>] Forwarded todo',
    expected: {
      ...baseTodo,
      state: TodoState.Forwarded,
      message: 'Forwarded todo',
    },
  })

  expectTodoResult({
    title: 'Can parse a simple cancelled todo',
    source: '- x Cancelled todo',
    expected: {
      ...baseTodo,
      state: TodoState.Cancelled,
      message: 'Cancelled todo',
    },
  })

  expectTodoResult({
    title: 'Can parse a todo with a deadline',
    source: '- [ ] 11:00 | Message',
    expected: {
      ...baseTodo,
      state: TodoState.Incomplete,
      message: 'Message',
      deadline: timeToDate('11:00'),
    },
  })

  expectTodoResult({
    title: 'Can parse a todo with a comment',
    source: '- [ ] Go to meeting // or not',
    expected: {
      ...baseTodo,
      state: TodoState.Incomplete,
      message: 'Go to meeting',
      comment: 'or not',
    },
  })

  expectTodoResult({
    title: 'Can parse a todo with a completion time',
    source: '- [x] Go to meeting // 11:05',
    expected: {
      ...baseTodo,
      state: TodoState.Complete,
      message: 'Go to meeting',
      comment: '11:05',
      completionTime: timeToDate('11:05'),
    },
  })

  expectTodoResult({
    title: 'Can parse a simple line item',
    source: '- A simple line item',
    expected: {
      ...baseTodo,
      state: TodoState.None,
      message: 'A simple line item',
    },
  })

  expectTodoResult({
    title: 'Can parse a todo item with a child note',
    source: `
- [ ] Contains a note
  - Note A
    `,
    expected: {
      ...baseTodo,
      state: TodoState.Incomplete,
      message: 'Contains a note',
      children: [
        {
          ...baseTodo,
          state: TodoState.None,
          message: 'Note A',
        },
      ],
    },
  })

  expectTodoResult({
    title: 'Can parse a todo item with multiple children',
    source: `
- [ ] Contains 3 children
  - Child 1
  - Child 2
  - Child 3
    `,
    expected: {
      ...baseTodo,
      state: TodoState.Incomplete,
      message: 'Contains 3 children',
      children: [
        { ...baseTodo, state: TodoState.None, message: 'Child 1' },
        { ...baseTodo, state: TodoState.None, message: 'Child 2' },
        { ...baseTodo, state: TodoState.None, message: 'Child 3' },
      ],
    },
  })

  expectTodoResult({
    title: 'Can parse multi-level deep items',
    source: `
- Level 1
  - [ ] Level 2
    - [x] Level 3
      - [>] Level 4
        - x Level 5
    `,
    expected: {
      ...baseTodo,
      state: TodoState.None,
      message: 'Level 1',
      children: [
        {
          ...baseTodo,
          state: TodoState.Incomplete,
          message: 'Level 2',
          children: [
            {
              ...baseTodo,
              state: TodoState.Complete,
              message: 'Level 3',
              children: [
                {
                  ...baseTodo,
                  state: TodoState.Forwarded,
                  message: 'Level 4',
                  children: [
                    {
                      ...baseTodo,
                      state: TodoState.Cancelled,
                      message: 'Level 5',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  })

  expectTodoResult({
    title: 'Can parse a todo item with mixed depth children',
    source: `
- [ ] Contains 2 children
  - [ ] Contains 1 child
    - Child 1 note
  - [ ] Contains another child
    - Child 2 note
    `,
    expected: {
      ...baseTodo,
      state: TodoState.Incomplete,
      message: 'Contains 2 children',
      children: [
        {
          ...baseTodo,
          state: TodoState.Incomplete,
          message: 'Contains 1 child',
          children: [
            {
              ...baseTodo,
              state: TodoState.None,
              message: 'Child 1 note',
            },
          ],
        },
        {
          ...baseTodo,
          state: TodoState.Incomplete,
          message: 'Contains another child',
          children: [
            {
              ...baseTodo,
              state: TodoState.None,
              message: 'Child 2 note',
            },
          ],
        },
      ],
    },
  })
})

suite('Todo Serialization', () => {
  interface SerializationTestProps {
    title: string
    source: Todo
    expected: string
  }

  function testSerialization({
    title,
    source,
    expected,
  }: SerializationTestProps) {
    test(title, () => {
      assert.strictEqual(serializeTodo(source), expected)
    })
  }

  const baseTodo: Todo = {
    state: TodoState.Incomplete,
    message: '',
    tag: null,
    comment: null,
    deadline: null,
    completionTime: null,
    children: [],
  }

  testSerialization({
    title: 'Can serialize a simple todo',
    source: {
      ...baseTodo,
      state: TodoState.Incomplete,
      message: 'A todo message',
    },
    expected: '- [ ] A todo message',
  })

  testSerialization({
    title: 'Can serialize a completed todo',
    source: {
      ...baseTodo,
      state: TodoState.Complete,
      message: 'A completed todo',
    },
    expected: '- [x] A completed todo',
  })

  testSerialization({
    title: 'Can serialize a forwarded todo',
    source: {
      ...baseTodo,
      state: TodoState.Forwarded,
      message: 'A forwarded todo',
    },
    expected: '- [>] A forwarded todo',
  })

  testSerialization({
    title: 'Can serialize a cancelled todo',
    source: {
      ...baseTodo,
      state: TodoState.Cancelled,
      message: 'A cancelled todo',
    },
    expected: '- x A cancelled todo',
  })

  testSerialization({
    title: 'Can serialize a simple line item',
    source: {
      ...baseTodo,
      state: TodoState.None,
      message: 'A simple line item',
    },
    expected: '- A simple line item',
  })
})

suite('Parsing and Serializing', () => {
  test('Parsing and serializing should be an identity function', () => {
    const parseAndSerialize = (source: string) => {
      source = source.trim()
      const parseResult = todoParser.parseToEnd(source)
      if (parseResult instanceof ParseError) {
        throw parseResult
      }

      const output = serializeTodo(parseResult)
      assert.strictEqual(output, source)
    }

    parseAndSerialize('- [ ] A plain todo')
    parseAndSerialize('- [x] A checked todo')
    parseAndSerialize('- [>] A forwarded todo')
    parseAndSerialize('- x A cancelled todo')
    parseAndSerialize('- [ ] 15:00 | This one has a due date')
    parseAndSerialize('- [x] This one has been completed // 15:15')
    parseAndSerialize(
      '- [>] This one has been forwarded at a particular time // 15:15'
    )
    parseAndSerialize(
      '- x This one has been cancelled with a comment // Why it was cancelled'
    )
    parseAndSerialize('- This is a simple line item')
    parseAndSerialize(`
- [ ] Level 1
  - [x] Level 2
    - [>] Level 3
      - x Level 4
        - Level 5
    `)
  })
})
