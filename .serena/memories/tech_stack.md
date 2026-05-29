# Tech Stack

**Frontend:**

- Next.js 15+ (App Router)
- React 19+
- TypeScript

**Backend/API:**

- Hono (lightweight framework for Route Handlers)
- Next.js API Routes (wildcard routing: `app/api/[...hono]/route.ts`)
- Node.js Runtime

**Database:**

- MongoDB Atlas (cloud cluster)
- Mongoose ODM for schema validation and queries
- Collections: `conversations`, `manuals`

**AI/LLM:**

- @anthropic-ai/sdk (Anthropic SDK)
- Claude API (latest model)

**Frontend Libraries:**

- TBD: UI framework (Tailwind CSS recommended)
- axios or fetch API for HTTP calls

**Development Tools:**

- TypeScript
- ESLint + Prettier
- Playwright (E2E testing)

**Deployment:**

- Google Cloud (App Engine or Cloud Run)

**Development Environment:**

- Platform: Windows
- MongoDB Atlas Development cluster (always used, even locally)
