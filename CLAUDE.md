# VSG Vihar Seva — Project Context for Claude

## What this app is
A PWA (Progressive Web App) for VSG Gandhinagar community to track Vihar Seva (religious walking processions). ~50 users, trust-based (no real auth in Phase 1). Data stored in Google Sheets, app hosted on GitHub Pages.

## Stack
- **Frontend:** React 19 + Vite 8, Tailwind CSS v4, React Router v7, Lucide React
- **Backend:** Google Apps Script (`Code.gs`) — single file, deployed as Web App
- **Database:** Google Sheets (Sheet ID: `1tvZ2SVEUYX8dzGg1wZXeTvMZURjxwntOKrECiWqLcEA`)
- **Hosting:** GitHub Pages, build output → `/docs` directory
- **Language:** JavaScript (no TypeScript)

## Key file map
```
src/
  components/
    AutoComplete.jsx   — dropdown input; opens ONLY on user typing (not on pre-fill)
    ListInput.jsx      — dynamic add/remove list wrapping AutoComplete
    Medal.jsx          — ranking badge (🥇🥈🥉 for top 3, #N for rest); add to MEDALS array for more
    BottomNav.jsx      — 4-tab fixed nav
    SettingsModal.jsx  — paste Apps Script URL
    Toast.jsx          — temporary notifications
  pages/
    Dashboard.jsx      — home: monthly stats + rankings
    AddEntry.jsx       — create/edit vihar entry form
    EntryConfirm.jsx   — success screen after save, shows WhatsApp message
    Entries.jsx        — searchable list of all entries
    Reports.jsx        — annual report: totals, month table, Top 5 leaderboard
    ImportantContacts.jsx — contact directory by section
  hooks/useSheets.js   — ALL Google Sheets API calls
  config/sheets.js     — Sheet ID, Script URL, roles, permissions
  utils/
    formatters.js      — date/time formatting, buildWhatsAppMessage()
    reportHelpers.js   — stats calculation, Top 5 logic
  context/AuthContext.jsx — hardcoded admin session (Phase 1)
  App.jsx              — HashRouter + layout shell
  index.css            — global styles, scroll-area class, iOS safe-area fixes
public/
  manifest.json        — PWA manifest; icons → logo.jpg
  logo.jpg             — VSG logo (copied from src/assets/logo.jfif)
  favicon.svg
Code.gs                — Google Apps Script backend (deploy separately in GAS editor)
```

## Google Sheets tabs
| Tab | Columns |
|-----|---------|
| Vihar Seva | ID, Vihar No., Date, Start Time, End Time, Sadhviji Bhagvant, Sadhu Bhagvant, Maharaj Saheb Names, KM, From, To, Vihar Sevak, Vihar Sevika, Saved At, Deleted, Saved By |
| Master Data | Places \| Sevak Names \| Sevika Names |
| Important Contacts | Section \| Name \| Phone \| Note |
| App Config | Key \| Value |
| Users | (Phase 2, not active) |

## API actions (Code.gs)
- `?action=getAll` — fetch all non-deleted entries
- `?action=save&data=JSON` — insert/update entry
- `?action=delete&id=STRING` — soft-delete
- `?action=getConfig` — Master Data + Contacts + App Config
- `?action=newYear&year=LABEL` — archive current sheet, clear for new year

## Important behaviours / gotchas
- **Time fields:** Google Sheets auto-converts "04:45" strings into Date objects. `Code.gs rowToEntry` uses `formatTimeValue()` to convert back to HH:mm. `formatters.js formatTime()` also handles ISO strings for stale cache.
- **AutoComplete dropdown:** only opens when user actively types (3+ chars). Pre-filled values in edit mode do NOT open the dropdown. Mobile tap uses `onTouchStart + preventDefault` to prevent blur-before-select.
- **PWA install icon:** `public/logo.jpg` referenced in `manifest.json` (Android) and `apple-touch-icon` in `index.html` (iOS).
- **Width layout:** all page containers need `w-full` alongside `max-w-[480px] mx-auto` — without it, `mx-auto` in a flex-col context sizes to content width on mobile.
- **`scroll-area` class** (index.css): flex:1, overflow-y:auto, overflow-x:hidden, padding-bottom accounts for bottom nav + iOS safe area.
- **Deployment:** `npm run build` → output to `/docs` → commit + push → GitHub Pages auto-publishes. `Code.gs` changes need separate re-deploy in Google Apps Script editor.
- **localStorage keys:** `vsg-entries-v5`, `vsg-config-v1`. Cache is source of truth for offline; sync on mount.
- **Badges (Medal.jsx):** `MEDALS` array drives emoji for top N ranks. Adding emojis to array auto-applies to leaderboards without other code changes.

## Color palette
| Token | Hex | Use |
|-------|-----|-----|
| Saffron (primary) | `#C96800` | buttons, headers, Sevak |
| Dark orange | `#A85000` | hover, alternate |
| Background | `#FFFDF5` | page bg |
| Dark text | `#3D1F00` | body text |
| Muted | `#8B6525` | labels |
| Border | `#E8C97A` | inputs, cards |
| Green | `#1B7A3A` | KM, phone button |
| Purple | `#7B2D8B` | Sevika sections |
| Red | `#B71C1C` | delete/errors |

## Dev commands
```bash
npm run dev    # Vite dev server at localhost:5173
npm run build  # build to /docs
```

## Phase 2 (not built yet)
Multi-user login with SHA-256 password hashing, role-based permissions (admin/captain/member). Users sheet exists but login flow not wired to UI.
