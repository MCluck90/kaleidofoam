# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.1.0](https://github.com/MCluck90/kaleidofoam/compare/v1.0.0...v1.1.0) (2022-02-22)


### Features

* **daily-note:** add command for generating and opening the daily note ([58a5785](https://github.com/MCluck90/kaleidofoam/commit/58a5785d111d4f8b357cb5fa127d397224e484bc))

## 1.0.0 (2022-02-21)

- Add feature for automatically adding log entries (`kaleidofoam.addToLog`)
- Add feature for automatically adding todo entries (`kaleidofoam.addTodo`)
- Add feature for generating links between daily and weekly notes (`kaleidofoam.generateDailyEdgeLinks`)
- Add feature for forwarding todos (`kaleidofoam.forwardTodo`)
- Add snippets for referencing days from the previous week (`/last-monday`, `/last-tuesday`, etc.)
- Add scheduled notifications for todo items (`- [ ] 10:00 | Do something`)
- Add feature for toggling todos (`kaleidofoam.toggleTodo`)
- Add feature for toggling labels on todo items
  - `kaleidofoam.toggleTodoTag.focus`
  - `kaleidofoam.toggleTodoTag.urgent`
  - `kaleidofoam.toggleTodoTag.optional`
- Add feature to quickly toggle between word wrap column sizes (`kaleidofoam.toggleWordWrapColumn`)
- Add feature for generating weekly notes
  - `kaleidofoam.openLastWeek`
  - `kaleidofoam.openThisWeek`
  - `kaleidofoam.openNextWeek`
- Add feature for opening the weekly note associated with a given daily note (`kaleidofoam.openWeekOfNote`)
