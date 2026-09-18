# Validation record

Validated on 18 September 2026, using Node.js 24.

## Passed

- Production frontend build (`npm run build`).
- Server JavaScript syntax checks (`npm run check`).
- **18 automated integration tests** (`npm test`) against real HTTP endpoints, isolated SQLite databases, and a simulated Razorpay API.
- Dependency audit (`npm audit`): **0 known vulnerabilities** reported for the installed lockfile at validation time.
- Desktop visual review of the homepage and individual programme page.
- Public navigation from homepage to catalogue to a programme.
- Free lesson preview opens, displays lesson content and closes.
- Mobile viewport review using a 390px-wide browser frame (375px content width after scrollbar); homepage and course catalogue had no horizontal overflow.
- Mobile navigation opens and the programme link works.

## Automated test coverage

1. Password hashing, HttpOnly session cookies, CSRF and exact-origin enforcement.
2. Login session rotation, invalid credentials and logout.
3. Single-use email verification.
4. Single-use/expired password reset and revocation of prior sessions.
5. Public curriculum metadata, public previews and protected lesson boundaries.
6. Server-owned prices, demo enrolment, cross-account protection and idempotent saved progress.
7. Owner role enforcement, sample/publication rules and unsafe media URL rejection.
8. Razorpay readiness checks and disabled demo completion in Razorpay mode.
9. Captured payment verification, idempotent enrolment and one access-email job.
10. Forged signatures, uncaptured payments and mismatched amounts rejected.
11. Webhook capture, duplicate events, partial/full refunds and delayed replay.
12. Invalid webhook signatures and cross-account payment verification blocked.
13. Payment-provider failure does not grant access.
14. Authentication rate limiting.
15. Unsafe production configuration rejected.
16. Repeated checkout reuses its pending order.
17. Historical demo orders do not grant access in Razorpay mode.
18. Private media authorization and absence of media locations from public course metadata.

## Not yet verified with the owner's services

- A real Razorpay test/live payment, account activation, capture settings and delivery of Razorpay's hosted checkout on the final domain.
- Actual SMTP delivery, sender reputation and inbox arrival.
- Playback of the owner's recordings; no recordings were supplied.
- Hosting-specific HTTPS, reverse proxy, persistent volumes, Docker runtime and backup restoration.
- Authenticated student/owner screens were exercised through backend integration tests and reviewed in source; a complete signed-in browser walkthrough was not performed.
- Full device/browser coverage, production load testing, independent penetration testing, legal policy review or conversion-rate measurement.
- Optional WebMCP catalogue registration is feature-detected; the available review browser did not expose `document.modelContext`, so browser tool execution could not be validated. This does not affect normal website use.

The supervised development preview reported a Vite hot-reload WebSocket warning. The compiled production frontend does not include that development connection. No claim of guaranteed zero defects is made. Repeat the launch checks in `DEPLOYMENT.md` with the final configuration and content.
