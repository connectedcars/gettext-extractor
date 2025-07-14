# Contribution Guidelines

Thank you for considering to contribute to this project. These guidelines will help you get going with development and outline the most important rules to follow when submitting pull requests for this project.

<br/>

## Development

#### Setup

##### Prerequisites

- [NodeJS]
- [npm]

##### Steps

1. Clone the (forked) repository
1. Run `npm install` in the project directory

#### Building

```text
npm run build
```

This will run the TypeScript compiler and write the JavaScript output to `dist`.

#### Linting

```text
npm run lint
```

This will run [tslint] to check for code style errors.

#### Running Tests

```text
npm test
```

This will run automated tests with [jest]. There are also some end-to-end tests which can be run with `npm run test:e2e`.

> **Note:** The E2E tests expect a built version of the package to be present in `dist/` so it's best to run `npm run build` first.

<br/>


## Submitting Changes

To get changes merged, create a pull request. Here are a few things to pay attention to when doing so: 

#### Commit Messages

The summary of a commit should be concise and worded in an imperative mood.  
...a *what* mood? This should clear things up: *[How to Write a Git Commit Message][git-commit-message]*

#### Code Style

It is required that you follow the existing code style. Use `npm run lint` to check. 

#### Tests

If it makes sense, writing tests for your PRs is always appreciated and will help get them merged.

[NodeJS]: https://nodejs.org
[npm]: https://www.npmjs.com/
[tslint]: https://palantir.github.io/tslint/
[jest]: https://facebook.github.io/jest/
[git-commit-message]: https://chris.beams.io/posts/git-commit/
