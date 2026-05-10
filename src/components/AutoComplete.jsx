import { useState } from 'react';

/**
 * strict=true: if the user types but doesn't select from the dropdown,
 * the value is cleared on blur (only when suggestions are available).
 *
 * Dropdown only opens on actual user typing — pre-filled values in edit
 * mode do NOT trigger the dropdown automatically.
 */
export default function AutoComplete({
  value,
  onChange,
  suggestions = [],
  placeholder,
  className = '',
  strict = false,
}) {
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const [invalid, setInvalid] = useState(false);

  function handleInputChange(e) {
    const val = e.target.value;
    onChange(val);
    setInvalid(false);
    if (val.length >= 3) {
      const q = val.toLowerCase();
      const matches = suggestions.filter(s => s.toLowerCase().includes(q));
      setFiltered(matches);
      setOpen(matches.length > 0);
    } else {
      setOpen(false);
    }
  }

  function pick(val) {
    onChange(val);
    setOpen(false);
    setInvalid(false);
  }

  function handleBlur() {
    setOpen(false);
    if (strict && suggestions.length > 0 && value.trim()) {
      const isKnown = suggestions.some(s => s.toLowerCase() === value.toLowerCase());
      if (!isKnown) {
        onChange('');
        setInvalid(true);
        setTimeout(() => setInvalid(false), 2000);
      }
    }
  }

  const borderCls = invalid
    ? 'border-red-400 bg-red-50'
    : 'border-[#E8C97A] focus:border-[#C96800]';

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`w-full border rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none ${borderCls} ${className}`}
      />
      {invalid && (
        <p className="text-[10px] text-red-500 mt-0.5 px-1">Please select from the list</p>
      )}
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-[#E8C97A] rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {filtered.map(s => (
            <li
              key={s}
              onMouseDown={e => { e.preventDefault(); pick(s); }}
              onTouchStart={e => { e.preventDefault(); pick(s); }}
              className="px-3 py-2.5 text-sm cursor-pointer hover:bg-[#FFF3D6] text-[#3D1F00]"
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
