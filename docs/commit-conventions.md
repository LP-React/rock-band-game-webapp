# Commit conventions

Create small, modular commits with one clear purpose. Each commit should be understandable and reviewable independently.

## Format

```text
type(scope): description
```

- Write the message in English.
- Use a concise description in the imperative mood: `add`, `fix`, `update`, `remove`.
- Choose a scope that identifies the affected area, such as `navigation`, `auth`, `ui`, or `project`.
- Use lowercase types and scopes. Do not add a final period.

| Type | Purpose |
| --- | --- |
| `feat` | Add functionality |
| `fix` | Correct a defect |
| `perf` | Improve performance |
| `refactor` | Restructure code without changing behavior |
| `docs` | Update documentation |
| `test` | Add or improve tests |
| `chore` | Maintain tooling, configuration, or dependencies |
| `style` | Change code formatting without changing behavior |

## Before committing

- Review the diff and stage only relevant files.
- Run the checks appropriate to the change. Fix failures introduced by the change and report pre-existing failures.
- Keep a dependency manifest and its lockfile in the same commit.
- Exclude secrets, generated build output, and unrelated changes.
- Keep documentation with its associated change when useful; separate independent changes into their own commits.

## Examples

```text
feat(navigation): add section links
fix(auth): handle expired sessions
perf(ui): reduce unnecessary renders
refactor(api): extract request helpers
docs(project): clarify setup instructions
chore(deps): update development dependencies
```
