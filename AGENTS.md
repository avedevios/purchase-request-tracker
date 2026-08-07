# Purchase Request Tracker — AI Agent Architecture Map

This repository is optimized for **maximum AI agent token efficiency**. All JavaScript logic and CSS styles are divided into laser-focused micro-modules under 200 lines.

## ⚡ Task → File Quick Reference

| I want to... | Edit this file |
|---|---|
| Change status / priority / role options | [`js/constants.js`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/js/constants.js) |
| Change SVG icons | [`js/config.js`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/js/config.js) |
| Add / edit a header button | [`index.html`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/index.html) + [`js/app/listeners.js`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/js/app/listeners.js) |
| Change table row layout | [`js/views/table.js`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/js/views/table.js) |
| Change kanban card layout | [`js/views/kanban.js`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/js/views/kanban.js) |
| Change stat card layout | [`js/views/stats.js`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/js/views/stats.js) |
| Change how data is saved / loaded | [`js/api.js`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/js/api.js) |
| Change the Cloudflare Worker backend | [`worker.js`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/worker.js) |
| Change HTML badge / select / button rendering | [`js/components.js`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/js/components.js) |
| Change item mutation logic (status, priority, delete) | [`js/app/actions.js`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/js/app/actions.js) |
| Change discussion chat modal | [`js/ui/modal.js`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/js/ui/modal.js) |
| Change dark/light theme | [`js/ui/theme.js`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/js/ui/theme.js) + [`css/tokens.css`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/css/tokens.css) |
| Change fireworks / rain animations | [`js/ui/animations.js`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/js/ui/animations.js) |
| Change toast notification | [`js/ui/toast.js`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/js/ui/toast.js) + [`css/components/toast.css`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/css/components/toast.css) |
| Change CSS colors / spacing tokens | [`css/tokens.css`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/css/tokens.css) |
| Add automated tests | [`tests/tracker.test.js`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/tests/tracker.test.js) or [`tests/helpers.test.js`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/tests/helpers.test.js) |

---

## 📁 Repository Sitemap & Micro-Module Directory

### 🟢 Core Web Entrypoints
- [`index.html`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/index.html) — Semantic HTML layout (~180 lines). Loads `styles.css` and `js/app.js`. **Run via `npm run dev` (not file://).**
- [`styles.css`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/styles.css) — Global CSS `@import` manifest.
- [`worker.js`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/worker.js) — Cloudflare Worker KV database & WebSocket push backend.

### 🎨 CSS Micro-Modules (`css/`)
- [`css/tokens.css`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/css/tokens.css) — CSS design tokens, light/dark themes, and Anton/Adonis duty colors.
- [`css/layout/base.css`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/css/layout/base.css) — Base typography, container, and header layout.
- [`css/layout/table.css`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/css/layout/table.css) — Table container & 2-level category group row styling.
- [`css/layout/kanban.css`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/css/layout/kanban.css) — Kanban board grid & card column layout.
- [`css/layout/stats.css`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/css/layout/stats.css) — Interactive stats card summary grid styling.
- [`css/components/badges.css`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/css/components/badges.css) — Badges, priority switcher pill `[ M | S | C ]`, dropdown selects, editable text.
- [`css/components/buttons.css`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/css/components/buttons.css) — Icon buttons, user switcher buttons, view toggles.
- [`css/components/modal.css`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/css/components/modal.css) — Discussion chat modal UI styling.
- [`css/components/toast.css`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/css/components/toast.css) — Notification toast banner styling.

### ⚡ JavaScript Micro-Modules (`js/`)
- [`js/constants.js`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/js/constants.js) — Shared string arrays: `STATUSES`, `BALLS`, `ROLES`.
- [`js/config.js`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/js/config.js) — SVG icon string constants only.
- [`js/types.js`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/js/types.js) — Central JSDoc data schema types (`IssueItem`, `ItemStatus`, `ItemPriority`).
- [`js/components.js`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/js/components.js) — EDSL HTML string generators (`renderStatusSelect`, `renderPrioSwitcher`, `td`, `badge`).
- [`js/api.js`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/js/api.js) — Cloudflare KV fetch/save, WebSocket real-time push, and localStorage fallback sync.
- [`js/ui/theme.js`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/js/ui/theme.js) — Dark/light theme toggles and Anton/Adonis duty user states.
- [`js/ui/toast.js`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/js/ui/toast.js) — Toast banner notification manager.
- [`js/ui/modal.js`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/js/ui/modal.js) — Response discussion thread chat modal logic.
- [`js/ui/animations.js`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/js/ui/animations.js) — Canvas fireworks and rain particle animation drivers.
- [`js/views/table.js`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/js/views/table.js) — 2-Level foldable category hierarchy table renderer.
- [`js/views/kanban.js`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/js/views/kanban.js) — Kanban board column card renderer.
- [`js/views/stats.js`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/js/views/stats.js) — Dashboard stat metrics totals and interactive filter handlers.
- [`js/app/actions.js`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/js/app/actions.js) — Item property mutations, category creation, and item deletion.
- [`js/app/listeners.js`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/js/app/listeners.js) — User interaction event listeners and keyboard shortcuts.
- [`js/app.js`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/js/app.js) — Main application entrypoint & render loop coordinator.

### 🧪 Automated Tests (`tests/`)
- [`tests/tracker.test.js`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/tests/tracker.test.js) — Core logic: category parsing, selects, priority, chat, grouping.
- [`tests/helpers.test.js`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/tests/helpers.test.js) — EDSL builders, CSS class mappers, response button, dataset integrity.

---

## 🚨 Strict Rules for AI Agents
1. **NEVER commit or push git changes without explicit user approval**.
2. **Keep file line counts under 200 lines**. If adding features, create micro-modules in appropriate subfolders (`js/ui/`, `js/views/`, `css/components/`).
3. **Always run `npm test` after edits** to verify all 25 tests pass.
4. **Always run the app via `npm run dev`** — ES modules do not work on `file://` protocol.
