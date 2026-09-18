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

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
