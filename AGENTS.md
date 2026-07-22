# Repository Guidelines

## Project Structure & Module Organization

This is a small Vite application written in TypeScript. Application entry code lives in `src/main.ts`; import styles from `src/style.css`. Put new UI modules and supporting TypeScript in `src/`, grouping related files in descriptive folders when the app grows (for example, `src/components/PaymentForm.ts`). Static files that must be served unchanged belong in `public/`. `index.html` is Vite's HTML entry point; do not edit generated `dist/` output.

## Build, Test, and Development Commands

- `npm install` installs the locked dependencies from `package-lock.json`.
- `npm run dev` starts the Vite development server with hot reloading.
- `npm run build` type-checks with `tsc` and creates the production bundle in `dist/`.
- `npm run preview` serves the latest production build locally for a final check.

There is currently no automated test runner or lint script. Always run `npm run build` before submitting changes; add focused tests and a corresponding script when introducing testable business logic.

## Coding Style & Naming Conventions

Use TypeScript and ES modules. Follow the existing two-space indentation and omit semicolons unless a file establishes a different local convention. Name files in `PascalCase` for exported UI components (for example, `CheckoutSummary.ts`) and in `camelCase` for utilities (for example, `formatCurrency.ts`). Keep imports explicit, remove unused symbols, and prefer small, single-purpose modules.

TypeScript is configured with strict practical checks including unused-local and unused-parameter errors. Resolve those errors rather than suppressing them. Keep global styling in `src/style.css`; scope new styles with clear component-oriented class names.

## Testing Guidelines

No test framework or coverage threshold is configured yet. For UI changes, verify the development server manually and run the production build. If adding a test tool, colocate tests near the code they exercise or use a `tests/` directory, use descriptive names such as `formatCurrency.test.ts`, and document the new command here.

## Commit & Pull Request Guidelines

This working copy has no accessible Git history, so use concise imperative commit subjects such as `Add payment amount validation`. Keep each commit focused. Pull requests should describe the user-visible change, list validation performed (at minimum `npm run build`), link relevant issues, and include screenshots for visual changes. Do not commit `node_modules/`, `dist/`, logs, or local configuration files.
