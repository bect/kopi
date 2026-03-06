# Contributing to Kopi

First off, thanks for taking the time to contribute! ❤️

All types of contributions are encouraged and valued. See the [Table of Contents](#table-of-contents) for different ways to help and details about how this project handles them. Please make sure to read the relevant section before making your contribution.

## Table of Contents

- [I Have a Question](#i-have-a-question)
- [I Want To Contribute](#i-want-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
- [Development Workflow](#development-workflow)
- [Styleguides](#styleguides)

## I Have a Question

If you want to ask a question, we assume that you have read the available [Documentation](README.md).

Before you ask a question, it is best to search for existing [Issues](https://github.com/bect/kopi/issues) that might help you. In case you have found a suitable issue and still need clarification, you can write your question in this issue.

## I Want To Contribute

### Reporting Bugs

A good bug report shouldn't leave others needing to chase you up for more information. Therefore, we ask you to investigate carefully, collect information and describe the issue in detail in your report.

- **Use a clear and descriptive title** for the issue to identify the problem.
- **Describe the exact steps to reproduce the problem** in as many details as possible.
- **Provide specific examples to demonstrate the steps**.
- **Describe the behavior you observed after following the steps** and point out what exactly is the problem with that behavior.
- **Explain which behavior you expected to see instead and why.**
- **Include screenshots** which show you following the described steps and clearly demonstrate the problem.

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion for Kopi, **including completely new features and minor improvements to existing functionality**.

- **Use a clear and descriptive title** for the issue to identify the suggestion.
- **Provide a step-by-step description of the suggested enhancement** in as many details as possible.
- **Explain why this enhancement would be useful** to most Kopi users.

## Development Workflow

To run the example site locally:

1.  Clone the repository:
    ```bash
    git clone https://github.com/bect/kopi.git
    ```

2.  Navigate to the example site directory:
    ```bash
    cd kopi/exampleSite
    ```

3.  Create the symbolic link to the theme:
    ```bash
    mkdir -p themes
    cd themes
    ln -s ../.. kopi
    cd .. 
    ```

4.  Start the Hugo server:
    ```bash
    hugo server
    ```

## Styleguides

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries such as documentation generation

Example: `feat: add radio player widget`

### Code Style

- **HTML/Templates**: Keep indentation consistent (2 or 4 spaces). Use Hugo's template syntax `{{ }}` cleanly.
- **CSS/SCSS**: Use meaningful class names.
- **JavaScript**: Use modern ES6+ syntax.

## License

By contributing, you agree that your contributions will be licensed under its MIT License.