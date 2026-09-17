# Agent instructions

Read `docs/project-context.md` and `docs/commit-conventions.md` before working on this project.

## Working approach

- Follow the documented goal, scope, and constraints. Avoid unrelated features or refactors.
- Inspect existing code and tooling before making changes. Reuse established patterns.
- Make the smallest complete change that solves the requested problem.
- Preserve unrelated user changes. Stage only files belonging to the completed task.
- Use the project's existing package manager and keep dependency manifests and lockfiles together.
- Do not invent requirements, commands, assets, specifications, or validation results. Mark unknowns explicitly.
- Ask for clarification when missing information prevents progress; resolve routine implementation choices independently.

## Validation and documentation

- Run checks appropriate to the change, using the commands documented in the project context.
- For UI changes, verify relevant screen sizes and interactions when browser tooling is available.
- Report what changed, how it was validated, and any remaining limitations.
- Keep documentation concise and in English. Update the project context when scope, architecture, commands, or important decisions change.
- Keep the context focused on current facts, not a chronological activity log.

## Version control

- Commit each completed, meaningful change in small, modular commits with one clear purpose.
- Use English commit messages in the format `type(scope): description`.
- Run relevant checks before committing. Follow `docs/commit-conventions.md`.
- Do not amend existing commits, rewrite history, push, or deploy unless requested.
