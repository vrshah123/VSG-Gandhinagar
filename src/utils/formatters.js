export function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

export function formatTime(timeStr) {
  if (!timeStr) return '';
  let h, m;
  // Handle ISO datetime strings Google Sheets returns when reading time cells
  if (typeof timeStr === 'string' && timeStr.includes('T')) {
    const d = new Date(timeStr);
    if (!isNaN(d)) { h = d.getUTCHours(); m = d.getUTCMinutes(); }
    else return timeStr;
  } else {
    [h, m] = String(timeStr).split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return String(timeStr);
  }
  const ampm = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function buildWhatsAppMessage(entry) {
  const {
    viharNo, date, startTime, endTime,
    sadhviji, sadhu, maharajNames,
    km, from, to,
    sevak, sevika,
  } = entry;

  const lines = [];
  lines.push(`🚶🏻‍♂️*VSG GANDHINAGAR*🚶🏻`);
  lines.push(`*🔢 VIHAR NO.-* ${viharNo}`);
  lines.push('');
  lines.push(`📅 *DATE:* ${formatDate(date)}`);
  lines.push(`⏰ *TIME:* ${formatTime(startTime)} to ${formatTime(endTime)}`);
  lines.push('');

  // Thana — only if at least one count is filled
  const sv = Number(sadhviji) || 0;
  const sd = Number(sadhu) || 0;
  const thanaParts = [];
  if (sv > 0) thanaParts.push(`${sv} Sadhviji Bhagvant`);
  if (sd > 0) thanaParts.push(`${sd} Sadhu Bhagvant M.Sa.`);
  if (thanaParts.length > 0) {
    lines.push(`🙏🏻 *THANA:* ${thanaParts.join(' + ')}`);
  }

  // Maharaj names — only if filled
  const names = (maharajNames || []).filter(Boolean);
  if (names.length > 0) {
    lines.push(`👤 *M.SA. NAMES:* ${names.join(', ')}`);
  }

  lines.push(`🛣 *K.M.:* ${km} K.M.`);
  lines.push('');
  lines.push(`*🏫 VIHAR DHAM*`);
  lines.push(`🛕 *From :* ${from}`);
  lines.push(`🛕 *To :*  ${to}`);

  // Sevak — only if filled
  const sevakList = (sevak || []).filter(Boolean);
  if (sevakList.length > 0) {
    lines.push('');
    lines.push(`*🙋 VIHAR SEVAK*`);
    sevakList.forEach(n => lines.push(`🚶${n}`));
  }

  // Sevika — only if filled
  const sevikaList = (sevika || []).filter(Boolean);
  if (sevikaList.length > 0) {
    lines.push('');
    lines.push(`*🙋‍♀️ VIHAR SEVIKA*`);
    sevikaList.forEach(n => lines.push(`🚶‍♀️${n}`));
  }

  lines.push('');
  lines.push(`*🌸 विहार सेवा🙏🏻अनमोल सेवा*`);

  return lines.join('\n');
}

export function getMonthLabel(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
}

export function getMonthKey(dateStr) {
  if (!dateStr) return '';
  return dateStr.slice(0, 7); // "YYYY-MM"
}
