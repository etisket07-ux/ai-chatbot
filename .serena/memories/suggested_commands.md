# Suggested Commands

## Development

**Install dependencies:**

```bash
npm install
```

**Development server (Next.js + Hono):**

```bash
npm run dev
```

Runs on http://localhost:3000 by default.

**Build for production:**

```bash
npm run build
```

**Start production server:**

```bash
npm start
```

## Testing & Quality

**Run manual testing:**

- Use browser at http://localhost:3000
- Test chat functionality, message persistence, and Claude responses

**Run E2E tests (Playwright):**

```bash
npx playwright test
```

**Run single E2E test:**

```bash
npx playwright test tests/chat.spec.ts
```

**Watch mode (Playwright):**

```bash
npx playwright test --watch
```

**Lint:**

```bash
npm run lint
```

**Format:**

```bash
npm run format
```

**Type check:**

```bash
npm run type-check
```

## Environment Setup

**Create `.env.local` for local development:**

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Note:** MongoDB Atlas Development cluster is used for both local and production.

## Utilities (Windows-specific notes)

- Shell: PowerShell (default) or Bash via WSL/Git Bash
- npm commands work identically on Windows and Unix
- File paths: Use forward slashes in npm scripts for cross-platform compatibility
