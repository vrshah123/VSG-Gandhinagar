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
  } else if (typeof timeStr === 'string' && timeStr.trim().match(/[AaPp][Mm]$/)) {
    const match = timeStr.trim().match(/^(\d{1,2})\s*:\s*(\d{1,2})\s*([AaPp][Mm])$/);
    if (!match) return timeStr;
    let hours = Number(match[1]);
    const minutes = Number(match[2]);
    const ampm = match[3].toLowerCase();
    if (isNaN(hours) || isNaN(minutes)) return timeStr;
    if (hours === 12) hours = 0;
    if (ampm === 'pm') hours += 12;
    h = hours;
    m = minutes;
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
    km, from, via, to,
    sevak, sevika,
  } = entry;

  const lines = [];
  lines.push(`🚶🏻‍♂️*VSG GANDHINAGAR*🚶🏻`);
  lines.push(`*🔢 Vihar No :-* ${viharNo}`);
  lines.push('');
  lines.push(`📅 *Date :* ${formatDate(date)}`);
  lines.push(`⏰ *Time :* ${formatTime(startTime)} to ${formatTime(endTime)}`);
  lines.push('');

  // Thana — only if at least one count is filled
  const sd = Number(sadhu) || 0;
  const sv = Number(sadhviji) || 0;
  const thanaParts = [];
  if (sd > 0) thanaParts.push(`${sd} Sadhu Bhagvant`);
  if (sv > 0) thanaParts.push(`${sv} Sadhviji Bhagvant`);
  if (thanaParts.length > 0) {
    lines.push(`🙏🏻 *Thana :* ${thanaParts.join(' + ')}`);
  }

  // Maharaj names — only if filled
  const names = (maharajNames || []).filter(Boolean);
  if (names.length > 0) {
    lines.push(`👤 *M.Sa. Names:* ${names.join(', ')}`);
  }

  lines.push(`🛣 *K.M :* ${km} K.M`);
  lines.push('');
  lines.push(`*🏫 VIHAR DHAM*`);
  lines.push(`🛕 *From :* ${from}`);
  if (via && String(via).trim()) lines.push(`🛣️ *Via :*  ${String(via).trim()}`);
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
