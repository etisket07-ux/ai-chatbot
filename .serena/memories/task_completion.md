# Task Completion Checklist

**For all code changes:**

1. **Type checking:**

   ```bash
   npm run type-check
   ```

2. **Linting & formatting:**

   ```bash
   npm run lint      # Check for issues
   npm run format    # Auto-format code
   ```

3. **Manual testing:**
   - Test chat functionality in browser (http://localhost:3000)
   - Verify MongoDB persistence (check Atlas cluster)
   - Test Claude API responses
   - Verify RAG search returns relevant manual content
   - Test across different browser sessions (new sessionId)

4. **E2E tests (if applicable):**
   ```bash
   npx playwright test
   ```

**Before committing:**

- ✅ Type checking passes: `npm run type-check`
- ✅ No lint errors: `npm run lint`
- ✅ Code is formatted: `npm run format`
- ✅ Manual browser testing completed
- ✅ MongoDB Atlas connection verified
- ✅ Claude API responses working correctly
- ✅ Session ID persists in localStorage
- ✅ E2E tests pass (if tests exist): `npx playwright test`

**Build/production checks:**

```bash
npm run build      # Next.js build must succeed
```

**Deployment to Google Cloud:**

- Verify all environment variables are set in Google Cloud deployment
- Test in staging environment first
- Verify MongoDB Atlas IP whitelist includes Google Cloud IP range
