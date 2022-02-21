# KaleidoFoam

A kaleidoscope of features built for [Foam](https://foambubble.github.io/).

I built these features to help my daily notes work better for me. My daily notes are formatted like this:

```md
# $date

[[$weekly-note]]

[[$yesterday]] | [[$tomorrow]]

---

## TODO

## Log
```

Personally, I have most of the features here [bound to a keyboard shortcut](https://code.visualstudio.com/docs/getstarted/keybindings#_keyboard-shortcuts-editor) but this extension does not add these bindings for you.

## Getting Started

Run `KaleidoFoam: Open This Week` to generate your daily notes for the week.

## Features
### Add to Log
Command: `kaleidofoam.addToLog`

Add a timestamped entry to the "Log" section.

Example:

```md
## Log
- 10:42 Worked on writing up the README for KaleidoFoam
```

### Add Todo
Command: `kaleidofoam.addTodo`

Adds a todo item to the "TODO" section.

Example:

```md
## TODO
- [ ] Write up documentation for KaleidoFoam
```

### Daily Edge Links
Command: `kaleidofoam.generateDailyEdgeLinks`

Adds links to the weekly, yesterday, and tomorrow notes for the current daily note.

Example:

```md
[[week-of-2022-02-20_2022-02-26]]

[[2022-02-20]] | [[2022-02-22]]
```

### Forward Todo
Command: `kaleidofoam.forwardTodo`

Forwards a note to a future date. Provides a dropdown recommending days in the next week.

Example:

```md
- [>] Write up documentation for KaleidoFoam [[2022-02-22]]
```

### Last Week Snippets
Snippets for referencing days in the last week.

- `/last-sunday`
- `/last-monday`
- `/last-tuesday`
- `/last-wednesday`
- `/last-thursday`
- `/last-friday`
- `/last-saturday`

### Scheduled Notifications
Allows you to schedule notifications for a given todo item.

Example:

```md
- [ ] 11:00 | Check email
```

By default, this will send a notification at 11:00 telling you to check your email. You can configure how long before the time to send the notification with the `kaleidofoam.minutesBeforeNotifications` setting.

### Toggle Todo
Command: `kaleidofoam.toggleTodo`

Toggles a todo as complete or incomplete. Adds and removes a timestamp.

Example:

```md
- [ ] Check email
```

becomes

```md
- [x] Check email // 10:55
```

### Toggle Todo Tags
Commands:
- `kaleidofoam.toggleTodoTag.focus`
- `kaleidofoam.toggleTodoTag.urgent`
- `kaleidofoam.toggleTodoTag.optional`

Toggles tags on a todo item.

Example:

```md
- [ ] Check out that new VS Code extension @optional
```

### Toggle Word Wrap Column
Command: `kaleidofoam.toggleWordWrapColumn`

Toggles the word wrap column width between 80 and 120 because that's what I like. This would be pretty easy to make configurable if anyone wants to submit a PR 😉

### Weekly Notes
Commands:
- `kaleidofoam.openLastWeek`,
- `kaleidofoam.openThisWeek`,
- `kaleidofoam.openNextWeek`,

Generates and opens a weekly note. Contains references to all of the daily notes for that week and contains a TODO section.
