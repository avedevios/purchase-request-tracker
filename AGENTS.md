# Purchase Request Tracker — AI Agent Architecture Map

This repository is optimized for **maximum AI agent token efficiency**. All JavaScript logic and CSS styles are divided into laser-focused micro-modules under 200 lines.

## 📁 Repository Sitemap & Micro-Module Directory

### 🟢 Core Web Entrypoints
- [`index.html`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/index.html) — Semantic HTML layout structure (~180 lines). Loads `styles.css` and `js/app.js`.
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
- [`js/types.js`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/js/types.js) — Central JSDoc data schema types (`IssueItem`, `ItemStatus`, `ItemPriority`).
- [`js/config.js`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/js/config.js) — SVG icons and global app constants.
- [`js/components.js`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/js/components.js) — EDSL HTML string generators (`renderStatusSelect`, `renderPrioSwitcher`, `td`, `badge`).
- [`js/api.js`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/js/api.js) — LocalStorage fallback, Cloudflare KV API, and WebSocket real-time push handlers.
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
- [`tests/tracker.test.js`](file:///c:/Users/anton.a/Documents/antigravity/optimistic-raman/tests/tracker.test.js) — Node.js test suite (`npm test`).

## 🚨 Strict Rules for AI Agents
1. **NEVER commit or push git changes without explicit user approval**.
2. **Keep file line counts under 200 lines**. If adding features, create micro-modules in appropriate subfolders (`js/ui/`, `js/views/`, `css/components/`).
