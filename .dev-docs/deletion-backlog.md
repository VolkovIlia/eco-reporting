# Deletion Backlog

Items to remove or simplify to preserve minimalism.

| Item | Action | Rationale |
|------|--------|-----------|
| `next-intl` (from tech stack) | Do not add for MVP | Only Russian language needed. Add when second locale is confirmed. |
| PostHog SDK | Defer to post-MVP | Use Vercel Analytics (built-in) for MVP. PostHog adds ~40KB to bundle. |
| shadcn/ui unused components | Remove after implementation | Only import components actually used. Each adds to bundle. |
| `@tailwindcss/postcss` dev dep | Evaluate | Tailwind v4 may not need separate PostCSS plugin. |
| In-memory rate limiter | Replace with middleware | MVP uses in-memory counters. Replace with Vercel WAF or Upstash Redis when scaling. |
