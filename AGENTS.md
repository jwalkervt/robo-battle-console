# Project Agents Guide

This document provides essential guidelines for developers and AI agents working on this project. Following these conventions ensures consistency, quality, and smooth collaboration.

## 1. Core Technologies

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **UI Components:** shadcn/ui
- **State Management:** Zustand
- **Server:** Tank Royale (run via Docker)
- **Linting & Formatting:** ESLint, Prettier
- **Package Manager:** npm

## 2. Getting Started & Common Commands

### Frontend GUI (`/`)

- **Install dependencies:**
  ```bash
  npm install
  ```
- **Run the development server (localhost:3000):**
  ```bash
  npm run dev
  ```
- **Build for production and start the server:**
  ```bash
  npm run build && npm run start
  ```
- **Run linter to check for code quality issues:**
  ```bash
  npm run lint
  ```

### Tank Royale Server (`/tank-royale-server`)

- **Install Python dependencies:**
  ```bash
  pip install -r tank-royale-server/requirements.txt
  ```
- **Download the latest server JAR and run it in Docker:**
  ```bash
  python3 tank-royale-server/run_server.py
  ```

### Testing

- **Run a specific test file or test case using pytest:**
  ```bash
  pytest <path/to/test_file.py>::<test_name>
  ```

## 3. Code Style & Conventions

### General

- **Formatting:** Code is automatically formatted by **Prettier**. Run `npm run lint` to check.
- **Configuration:**
  - **Prettier (`.prettierrc.json`):** `semi`, `tabWidth=2`, `singleQuote=false`, `trailingComma="es5"`, `arrowParens="always"`.
  - **ESLint (`eslint.config.mjs`):** Extends `next/core-web-vitals` and `next/typescript`.
  - **TypeScript (`tsconfig.json`):** `strict=true`, with path alias `@/*` for `src/*`.

### TypeScript & React

- **Import Order:** Keep imports organized in the following order:
  1.  External libraries (e.g., `react`, `zod`)
  2.  Absolute imports using the `@/` alias (e.g., `@/components/ui/button`)
  3.  Relative imports (e.g., `./local-utility`)
- **Component Naming:** Use **PascalCase** for React components (e.g., `GameBoard`, `PlayerInfo`).
- **Variable & Hook Naming:** Use **camelCase** for variables, functions, and custom hooks (e.g., `usePlayerState`, `fetchGameData`).
- **Error Handling:** Use `try/catch` blocks for operations that can fail (e.g., API calls). Log errors to the console using `console.error` in the frontend or raise exceptions in backend scripts.

## 4. Agent Instructions

- **Cursor/Copilot Rules:** None. Feel free to use AI-assisted development tools.
- **Commit Messages:** Follow a conventional commit format (e.g., `feat: add new game board component`, `fix: resolve issue with player scoring`).
- **Pull Requests:** Provide a clear description of the changes and link to any relevant issues.
