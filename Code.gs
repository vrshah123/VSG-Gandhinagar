// VSG Vihar Seva — Google Apps Script Backend
// Sheet ID: 1tvZ2SVEUYX8dzGg1wZXeTvMZURjxwntOKrECiWqLcEA
//
// HOW TO DEPLOY:
// 1. Open Google Sheet → Extensions → Apps Script
// 2. Paste this entire file → Save (Ctrl+S)
// 3. Click Deploy → New deployment → Web App
//    - Execute as: Me
//    - Who has access: Anyone
// 4. Click Deploy → Copy the Web App URL

const SS = SpreadsheetApp.openById('1tvZ2SVEUYX8dzGg1wZXeTvMZURjxwntOKrECiWqLcEA');

const SHEETS = {
  VIHAR:     'Vihar Seva',
  MASTER:    'Master Data',
  USERS:     'Users',
  CONTACTS:  'Important Contacts',
  CONFIG:    'App Config',
};

const VIHAR_HEADERS = [
  'ID', 'Vihar No.', 'Date', 'Start Time', 'End Time',
  'Sadhviji Bhagvant', 'Sadhu Bhagvant', 'Maharaj Saheb Names',
  'KM', 'From', 'To',
  'Vihar Sevak', 'Vihar Sevika',
  'Saved At', 'Deleted', 'Saved By',
];

// ── Entry point ─────────────────────────────────────────────────────────────

function doGet(e) {
  const action = e.parameter.action;
  let result;

  try {
    if      (action === 'getAll')    result = getAll();
    else if (action === 'save')      result = saveEntry(e.parameter.data);
    else if (action === 'delete')    result = deleteEntry(e.parameter.id);
    else if (action === 'getConfig') result = getConfig();
    else if (action === 'login')     result = login(e.parameter.username, e.parameter.password);
    else if (action === 'newYear')   result = newYear(e.parameter.year);
    else                             result = { error: 'Unknown action: ' + action };
  } catch (err) {
    result = { error: err.message };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── getAll ───────────────────────────────────────────────────────────────────

function getAll() {
  const sheet = getOrCreateViharSheet();
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  const headers = rows[0];
  return rows.slice(1)
    .filter(r => r[headers.indexOf('Deleted')] !== true && r[headers.indexOf('Deleted')] !== 'TRUE')
    .map(r => rowToEntry(headers, r));
}

// ── saveEntry ────────────────────────────────────────────────────────────────

function saveEntry(dataStr) {
  const entry = JSON.parse(dataStr);
  const sheet = getOrCreateViharSheet();
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];

  // Look for existing row by ID
  const idCol = headers.indexOf('ID');
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][idCol] === entry.id) {
      sheet.getRange(i + 1, 1, 1, headers.length).setValues([entryToRow(headers, entry)]);
      return { success: true, action: 'updated' };
    }
  }

  // New row
  sheet.appendRow(entryToRow(headers, entry));
  return { success: true, action: 'inserted' };
}

// ── deleteEntry ──────────────────────────────────────────────────────────────

function deleteEntry(id) {
  const sheet = getOrCreateViharSheet();
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const idCol = headers.indexOf('ID');
  const delCol = headers.indexOf('Deleted');

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][idCol] === id) {
      sheet.getRange(i + 1, delCol + 1).setValue(true);
      return { success: true };
    }
  }
  return { error: 'Entry not found: ' + id };
}

// ── getConfig ────────────────────────────────────────────────────────────────

function getConfig() {
  const config = {
    places: [],
    sevakNames: [],
    sevikaNames: [],
    importantContacts: [],
    appConfig: {},
  };

  // Master Data
  const master = SS.getSheetByName(SHEETS.MASTER);
  if (master) {
    const data = master.getDataRange().getValues();
    data.slice(1).forEach(r => {
      if (r[0]) config.places.push(String(r[0]));
      if (r[1]) config.sevakNames.push(String(r[1]));
      if (r[2]) config.sevikaNames.push(String(r[2]));
    });
  }

  // Important Contacts
  const contacts = SS.getSheetByName(SHEETS.CONTACTS);
  if (contacts) {
    const data = contacts.getDataRange().getValues();
    data.slice(1).forEach(r => {
      if (r[1]) config.importantContacts.push({
        section: r[0] || 'Others',
        name: r[1],
        phone: r[2] ? String(r[2]) : '',
        note: r[3] || '',
      });
    });
  }

  // App Config
  const appCfg = SS.getSheetByName(SHEETS.CONFIG);
  if (appCfg) {
    const data = appCfg.getDataRange().getValues();
    data.slice(1).forEach(r => {
      if (r[0]) config.appConfig[r[0]] = r[1];
    });
  }

  return config;
}

// ── login (Phase 2) ──────────────────────────────────────────────────────────

function login(username, password) {
  const sheet = SS.getSheetByName(SHEETS.USERS);
  if (!sheet) return { error: 'Users sheet not found' };

  const rows = sheet.getDataRange().getValues();
  const headers = rows[0]; // Username | Password | Role | Full Name | Active
  const uCol = headers.indexOf('Username');
  const pCol = headers.indexOf('Password');
  const rCol = headers.indexOf('Role');
  const nCol = headers.indexOf('Full Name');
  const aCol = headers.indexOf('Active');

  const hashed = hashSHA256(password);

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (String(r[uCol]).toLowerCase() === username.toLowerCase() &&
        r[pCol] === hashed &&
        r[aCol] !== false && r[aCol] !== 'FALSE') {
      return { success: true, username: r[uCol], role: r[rCol], fullName: r[nCol] };
    }
  }
  return { error: 'Invalid username or password' };
}

// ── newYear ──────────────────────────────────────────────────────────────────

function newYear(year) {
  const sheet = getOrCreateViharSheet();
  const archiveName = SHEETS.VIHAR + ' ' + year;

  // Duplicate current sheet as archive
  sheet.copyTo(SS).setName(archiveName);

  // Clear existing data (keep headers)
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
  }

  return { success: true, archived: archiveName };
}

// ── helpers ──────────────────────────────────────────────────────────────────

function getOrCreateViharSheet() {
  let sheet = SS.getSheetByName(SHEETS.VIHAR);
  if (!sheet) {
    sheet = SS.insertSheet(SHEETS.VIHAR);
    sheet.appendRow(VIHAR_HEADERS);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(VIHAR_HEADERS);
  }
  return sheet;
}

function rowToEntry(headers, row) {
  const e = {};
  headers.forEach((h, i) => { e[h] = row[i]; });
  return {
    id:           e['ID'],
    viharNo:      e['Vihar No.'],
    date:         e['Date'] ? Utilities.formatDate(new Date(e['Date']), 'Asia/Kolkata', 'yyyy-MM-dd') : '',
    startTime:    e['Start Time'],
    endTime:      e['End Time'],
    sadhviji:     e['Sadhviji Bhagvant'],
    sadhu:        e['Sadhu Bhagvant'],
    maharajNames: parseList(e['Maharaj Saheb Names']),
    km:           e['KM'],
    from:         e['From'],
    to:           e['To'],
    sevak:        parseList(e['Vihar Sevak']),
    sevika:       parseList(e['Vihar Sevika']),
    savedAt:      e['Saved At'],
    savedBy:      e['Saved By'],
  };
}

function entryToRow(headers, entry) {
  const map = {
    'ID':                  entry.id || '',
    'Vihar No.':           entry.viharNo || '',
    'Date':                entry.date || '',
    'Start Time':          entry.startTime || '',
    'End Time':            entry.endTime || '',
    'Sadhviji Bhagvant':   entry.sadhviji || 0,
    'Sadhu Bhagvant':      entry.sadhu || 0,
    'Maharaj Saheb Names': (entry.maharajNames || []).filter(Boolean).join(', '),
    'KM':                  entry.km || '',
    'From':                entry.from || '',
    'To':                  entry.to || '',
    'Vihar Sevak':         (entry.sevak || []).filter(Boolean).join(', '),
    'Vihar Sevika':        (entry.sevika || []).filter(Boolean).join(', '),
    'Saved At':            entry.savedAt || new Date().toISOString(),
    'Deleted':             false,
    'Saved By':            entry.savedBy || '',
  };
  return headers.map(h => map[h] !== undefined ? map[h] : '');
}

function parseList(val) {
  if (!val) return [];
  const s = String(val).trim();
  if (!s) return [];
  // Handle legacy JSON arrays saved by old code
  if (s.startsWith('[')) {
    try { return JSON.parse(s).filter(Boolean); } catch {}
  }
  // Normal comma-separated
  return s.split(',').map(x => x.trim()).filter(Boolean);
}

function hashSHA256(str) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, str);
  return bytes.map(b => ('0' + (b & 0xff).toString(16)).slice(-2)).join('');
}
