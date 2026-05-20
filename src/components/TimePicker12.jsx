import { useMemo } from 'react';

function parse12(value) {
  const m = String(value || '').trim().match(/^(\d{1,2})\s*:\s*(\d{2})\s*([AaPp][Mm])$/);
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  const ampm = m[3].toUpperCase();
  if (!Number.isFinite(hour) || hour < 1 || hour > 12) return null;
  if (!Number.isFinite(minute) || minute < 0 || minute > 59) return null;
  return { hour, minute, ampm };
}

function fmt({ hour, minute, ampm }) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${ampm}`;
}

export default function TimePicker12({ value, onChange, minuteStep = 5 }) {
  const parsed = useMemo(() => parse12(value) || { hour: 12, minute: 0, ampm: 'AM' }, [value]);

  const hours = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const minutes = useMemo(() => {
    const step = Math.max(1, Math.min(60, Number(minuteStep) || 1));
    const list = [];
    for (let m = 0; m < 60; m += step) list.push(m);
    return list;
  }, [minuteStep]);

  return (
    <div className="flex items-center gap-2">
      <select
        value={parsed.hour}
        onChange={(e) => onChange(fmt({ ...parsed, hour: Number(e.target.value) }))}
        className="flex-1 bg-white border border-[#E8C97A] rounded-xl px-3 py-2 text-sm font-semibold text-[#3D1F00] outline-none"
        aria-label="Hour"
      >
        {hours.map((h) => (
          <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
        ))}
      </select>

      <span className="text-sm font-black text-[#8B6525]">:</span>

      <select
        value={parsed.minute}
        onChange={(e) => onChange(fmt({ ...parsed, minute: Number(e.target.value) }))}
        className="flex-1 bg-white border border-[#E8C97A] rounded-xl px-3 py-2 text-sm font-semibold text-[#3D1F00] outline-none"
        aria-label="Minute"
      >
        {minutes.map((m) => (
          <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
        ))}
      </select>

      <select
        value={parsed.ampm}
        onChange={(e) => onChange(fmt({ ...parsed, ampm: e.target.value }))}
        className="w-24 bg-white border border-[#E8C97A] rounded-xl px-3 py-2 text-sm font-semibold text-[#3D1F00] outline-none"
        aria-label="AM/PM"
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}

