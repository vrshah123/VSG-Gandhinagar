# VSG Vihar Seva — Project Specification & Developer Handoff

**Version:** Phase 1 (May 2026)  
**App URL:** Deployed on GitHub Pages (see repo Settings → Pages)  
**Purpose:** Mobile PWA for VSG Gandhinagar to track Jain monk/nun walking service (Vihar Seva). Replaces manual WhatsApp messages. ~50 users.

---

## 1. Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React 18 + Vite | Component-based, fast build |
| Styling | Tailwind CSS v4 (Vite plugin) | Utility classes, no CSS files per component |
| Routing | React Router v6 (HashRouter) | HashRouter required for GitHub Pages static hosting |
| Icons | Lucide React | Consistent icon set |
| Backend | Google Apps Script | Free REST API, no server to maintain |
| Database | Google Sheets | Free, admin can edit data directly in the sheet |
| Hosting | GitHub Pages | Free forever for this scale |

**No TypeScript. No Redux. No test framework.** Keep it simple — this serves 50 users.

---

## 2. Folder Structure

```
vsg-vihar-seva/
├── public/
│   └── manifest.json          # PWA manifest (name, icons, theme colour)
├── src/
│   ├── assets/                # Images — replace files here to update images
│   │   ├── logo.jfif          # VSG Gandhinagar logo (shown in header)
│   │   ├── sadhviji.jfif      # Sadhviji Bhagwant illustration
│   │   └── sadhu.jfif         # Sadhu Bhagwant illustration
│   ├── components/            # Reusable UI pieces
│   │   ├── AutoComplete.jsx   # Text input with dropdown (triggers at 3 chars)
│   │   ├── BottomNav.jsx      # Fixed 4-tab navigation bar
│   │   ├── ListInput.jsx      # Dynamic add/remove list of names
│   │   ├── Medal.jsx          # 🥇🥈🥉 ranking badge
│   │   ├── SettingsModal.jsx  # Bottom-sheet to paste Apps Script URL
│   │   └── Toast.jsx          # Temporary notification message
│   ├── pages/                 # One file = one screen
│   │   ├── Dashboard.jsx      # Home — current month stats + Sevak/Sevika rankings
│   │   ├── AddEntry.jsx       # Add or Edit a Vihar entry (form)
│   │   ├── EntryConfirm.jsx   # Success screen after saving — shows WhatsApp preview
│   │   ├── Entries.jsx        # Full list of all entries (searchable by Vihar No.)
│   │   ├── Reports.jsx        # Annual report — totals, month table, Top 5 leaderboard
│   │   └── ImportantContacts.jsx  # Contact directory (from Google Sheet)
│   ├── hooks/
│   │   └── useSheets.js       # ALL Google Sheets API calls live here — nowhere else
│   ├── context/
│   │   └── AuthContext.jsx    # User session (Phase 1: admin hardcoded)
│   ├── config/
│   │   └── sheets.js          # ★ CENTRAL CONFIG — Sheet ID, Script URL, roles
│   ├── utils/
│   │   ├── formatters.js      # Date/time formatters + WhatsApp message builder
│   │   └── reportHelpers.js   # Month grouping, stats aggregation, Top 5 logic
│   ├── App.jsx                # Router setup + layout shell
│   ├── main.jsx               # React entry point
│   └── index.css              # Global CSS (fonts, scroll area, iOS fixes)
├── Code.gs                    # Google Apps Script backend — paste into Apps Script editor
├── docs/                      # Built output — committed to git for GitHub Pages
├── vite.config.js
├── tailwind.config.js
├── .gitignore
└── package.json
```

### The golden rule for finding things

| Want to change… | Go to… |
|---|---|
| Sheet ID or Script URL | `src/config/sheets.js` |
| WhatsApp message format | `src/utils/formatters.js` → `buildWhatsAppMessage()` |
| A page's layout or content | `src/pages/[PageName].jsx` |
| A shared UI element | `src/components/[ComponentName].jsx` |
| An image | `src/assets/` — replace the file, keep the same filename |
| Colour palette | `src/index.css` CSS variables, or search Tailwind classes in components |
| Google Sheet reading/writing logic | `src/hooks/useSheets.js` |
| Stats / report calculations | `src/utils/reportHelpers.js` |
| Backend (Sheet structure, login) | `Code.gs` |

---

## 3. Google Sheets Structure

**Sheet ID:** `1tvZ2SVEUYX8dzGg1wZXeTvMZURjxwntOKrECiWqLcEA`

### Tab 1 — `Vihar Seva` (main data, auto-created by app)
| Column | Notes |
|---|---|
| ID | Unique string, e.g. `vsg-1746123456789` |
| Vihar No. | Auto-incremented integer |
| Date | `YYYY-MM-DD` |
| Start Time | `HH:MM` (24h) |
| End Time | `HH:MM` (24h) |
| Sadhviji Bhagvant | Count (number) |
| Sadhu Bhagvant | Count (number) |
| Maharaj Saheb Names | Comma-separated string, e.g. `Muni A, Muni B` |
| KM | Number |
| From | Place name string |
| To | Place name string |
| Vihar Sevak | Comma-separated names |
| Vihar Sevika | Comma-separated names |
| Saved At | ISO timestamp |
| Deleted | `TRUE` or blank (soft delete) |
| Saved By | Username string |

### Tab 2 — `Master Data` (autocomplete source, admin fills manually)
| Column A | Column B | Column C |
|---|---|---|
| Places | Sevak Names | Sevika Names |
| Borij | Mitul Shah | Priya Ben |
| … | … | … |

Add a new row for each new place/person. App reads this on every load.

### Tab 3 — `Users` (Phase 2 — not used yet)
`Username | Password (SHA-256 hash) | Role | Full Name | Active`

### Tab 4 — `Important Contacts` (admin fills manually)
`Section | Name | Phone | Note`  
Section values: `Captains`, `Admins`, `Doctors`, `Others`

### Tab 5 — `App Config` (admin controlled)
| Key | Value |
|---|---|
| `current_year_label` | `2025-26` |

---

## 4. Google Apps Script API (`Code.gs`)

All calls are HTTP GET to the deployed Web App URL with a `?action=` parameter.

| Action | Extra Params | What it does |
|---|---|---|
| `getAll` | — | Returns all non-deleted Vihar Seva entries as JSON array |
| `save` | `data=JSON` | Insert new entry or update existing (matched by `id`) |
| `delete` | `id=STRING` | Soft-delete: sets `Deleted = TRUE`, entry stays in sheet |
| `getConfig` | — | Returns `{ places, sevakNames, sevikaNames, importantContacts, appConfig }` |
| `login` | `username`, `password` | Phase 2 — validates against Users tab (SHA-256 hash) |
| `newYear` | `year=YYYY` | Archives current sheet as "Vihar Seva YYYY", creates fresh tab |

**Every time `Code.gs` is changed**, you must re-deploy in Apps Script:
> Deploy → Manage deployments → Edit (pencil) → New version → Deploy

The URL does not change when creating a new version.

---

## 5. Data Flow

```
User fills form (AddEntry.jsx)
  ↓
useSheets.saveEntry(entry)          ← all API calls go through this hook
  ↓
fetch(SCRIPT_URL + "?action=save&data=JSON")
  ↓
Code.gs doGet() → saveEntry()       ← writes row to "Vihar Seva" sheet
  ↓
syncEntries() called automatically  ← updates local state + localStorage cache
  ↓
EntryConfirm.jsx shown              ← displays WhatsApp message
```

**localStorage is a cache only.** Google Sheets is always the source of truth. On every page visit and every sync button tap, the app overwrites the cache with fresh Sheet data.

---

## 6. Roles & Permissions (Phase 1 — hardcoded admin)

In Phase 1, every user is treated as admin (set in `src/context/AuthContext.jsx`).  
The permission functions are already written in `src/config/sheets.js`:

```js
PERMISSIONS.canAddEntry(role)    // admin + captain
PERMISSIONS.canEditEntry(role)   // admin + captain
PERMISSIONS.canDeleteEntry(role) // admin only
```

These are used throughout the pages. When Phase 2 login is added, just replace the hardcoded session in `AuthContext.jsx` — the permission logic doesn't change.

---

## 7. Colour Palette & Design System

| Token | Hex | Used for |
|---|---|---|
| Primary (saffron) | `#C96800` | Buttons, headers, highlights |
| Primary Dark | `#A85000` | Hover states |
| Background | `#FFFDF5` | Page/app background |
| Dark Text | `#3D1F00` | Main body text |
| Muted | `#8B6525` | Labels, secondary text |
| Border | `#E8C97A` | Card and input borders |
| Border Light | `#F5E5B0` | Card internal dividers |
| Green | `#1B7A3A` | KM stat, call button |
| Red | `#B71C1C` | Delete actions |
| Purple | `#7B2D8B` | Sevika sections |

**Font:** Nunito (Google Fonts) — loaded in `index.css`.  
**Max width:** 480px, centered on desktop — the whole app is a mobile-first column.

---

## 8. Common Changes — Step by Step

### 8.1 Replace an image
1. Put the new image file in `src/assets/`
2. Name it exactly: `logo.jfif`, `sadhviji.jfif`, or `sadhu.jfif`
3. Run `npm run build` → commit `docs/` → push

The file extension must match what's imported in the page files. If you use `.png`, update the import lines in `Dashboard.jsx`, `AddEntry.jsx`, and `Reports.jsx`.

---

### 8.2 Change a label or text in the app
Search for the text in `src/pages/` using VS Code search (Ctrl+Shift+F).  
Edit the JSX string directly. Then rebuild.

Example: to rename "Vihar Sevak" to "Vihar Seva Purusho":
- Find all occurrences in pages and components
- Change the string
- `npm run build` → push

---

### 8.3 Change the WhatsApp message format
Open `src/utils/formatters.js` → `buildWhatsAppMessage()` function.

The message is built as an array of lines then joined with `\n`. Each section is conditionally included (only shown if data exists). Emoji and bold markers (`*text*`) are WhatsApp formatting.

---

### 8.4 Add a new colour or CSS style
Either:
- Add a Tailwind utility class directly on the element in the JSX
- For a reusable value, add a CSS variable in `src/index.css` and reference it

Do not create separate `.css` files per component — Tailwind handles everything.

---

### 8.5 Year Reset process
This is intentionally done from the Google Sheet, not the app UI.

1. Open the Google Sheet → **Extensions → Apps Script**
2. In the script editor, run the `newYear` function manually (or call it via the API):
   ```
   https://SCRIPT_URL?action=newYear&year=2025
   ```
3. This will:
   - Copy the current `Vihar Seva` tab → rename it `Vihar Seva 2025` (archived)
   - Clear all data rows in the live `Vihar Seva` tab (headers stay)
   - Vihar numbering starts from 1 again automatically (app calculates next number)
4. Update the `App Config` tab → change `current_year_label` value to `2026-27`
5. The app picks up the new label on next sync — no code change needed

---

### 8.6 Enable the Delete button for admin
The delete button is **already built** in `src/pages/Entries.jsx`. It is shown/hidden based on `PERMISSIONS.canDeleteEntry(role)`.

In Phase 1 the role is hardcoded as `admin` (in `AuthContext.jsx`), so the delete button **is already visible** for all users. No code change needed.

When Phase 2 login is added, the delete button will automatically become admin-only because the permission check is already in place.

---

### 8.7 Add a new page/screen
1. Create `src/pages/NewPage.jsx` — follow the structure of any existing page
2. Import and add a `<Route>` in `src/App.jsx`
3. Add a navigation link (in `BottomNav.jsx` or as a button in an existing page)

BottomNav is limited to 4 tabs for mobile UX — if adding a 5th tab, consider replacing one tab or using a menu instead.

---

### 8.8 Add a new field to the Vihar entry form
1. Add the field to the form state `DEFAULT_FORM` in `AddEntry.jsx`
2. Add the input JSX in `AddEntry.jsx`
3. Include the field in the `entry` object passed to `saveEntry()`
4. Add the column to `VIHAR_HEADERS` array in `Code.gs`
5. Add the column mapping in `entryToRow()` in `Code.gs`
6. Add the read-back mapping in `rowToEntry()` in `Code.gs`
7. Re-deploy `Code.gs` (new version)
8. Update `buildWhatsAppMessage()` in `formatters.js` if it should appear in the WhatsApp output

---

### 8.9 Add a new autocomplete suggestion (place, sevak, sevika name)
Just add a new row in the Google Sheet `Master Data` tab:
- Column A = Places
- Column B = Sevak Names
- Column C = Sevika Names

The app fetches Master Data on every load. No code change or redeploy needed.

---

### 8.10 Change the default Start Time / End Time in the form
Open `src/pages/AddEntry.jsx` → find `DEFAULT_FORM` at the top:

```js
const DEFAULT_FORM = {
  date: todayISO(),
  startTime: '04:45',   // ← change this (24h format HH:MM)
  endTime: '07:45',     // ← change this
  ...
```

---

## 9. Deployment Workflow

### First time
```powershell
cd "D:\Project_VS\Vihar Seva\vsg-vihar-seva"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```
Then in GitHub repo → **Settings → Pages → Deploy from branch → main → /docs → Save**

### Every update
```powershell
npm run build          # rebuilds into docs/
git add docs/
git commit -m "Deploy: describe what changed"
git push
```
GitHub Pages publishes within ~1 minute.

### When Code.gs changes
1. Open Google Sheet → Extensions → Apps Script
2. Paste updated `Code.gs` → Save
3. Deploy → Manage deployments → Edit (pencil) → **New version** → Deploy
4. URL stays the same

---

## 10. Phase 2 Roadmap (not yet built)

| Feature | Where to build |
|---|---|
| Login screen | Create `src/pages/Login.jsx`, update `AuthContext.jsx` to call `?action=login` |
| Role-based UI | Replace hardcoded session in `AuthContext.jsx` — all permission checks already written |
| Session management | Store `{ username, role, fullName }` in `localStorage` on login, clear on logout |
| User management | Admin fills `Users` tab in Google Sheet with SHA-256 hashed passwords |

The `login` action is already built in `Code.gs` and ready to use.  
A SHA-256 hash generator: search "sha256 online generator" — or run `node -e "const crypto=require('crypto');console.log(crypto.createHash('sha256').update('yourpassword').digest('hex'))"`.

---

## 11. Known Limitations

| Limitation | Reason | Impact |
|---|---|---|
| No real-time sync | Google Sheets has no push/webhook | Data refreshes on page visit + sync button — acceptable for 50 users |
| Frontend-only role enforcement | Code runs in browser | Determined user could bypass role checks — acceptable for community trust-based app |
| Apps Script URL visible in source | Hardcoded in `sheets.js`, bundled in JS | URL allows anyone to read/write the sheet. Acceptable — sheet is internal anyway |
| Google Apps Script rate limit | 20,000 calls/day free | Ample for 50 users |

---

## 12. Local Development Setup

```powershell
cd "D:\Project_VS\Vihar Seva\vsg-vihar-seva"
npm install          # first time only
npm run dev          # starts dev server at http://localhost:5173
```

The `SCRIPT_URL` in `src/config/sheets.js` is already set. The app will connect to the live Google Sheet even in local dev. To use a test sheet, temporarily change `SCRIPT_URL` to point to a test deployment.

```powershell
npm run build        # builds into docs/ for deployment
```
