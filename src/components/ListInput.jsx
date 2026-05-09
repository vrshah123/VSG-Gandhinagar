import { Plus, X } from 'lucide-react';
import AutoComplete from './AutoComplete';

export default function ListInput({ items, onChange, suggestions = [], placeholder, accentColor = '#C96800', strict = false }) {
  function updateItem(i, val) {
    const next = [...items];
    next[i] = val;
    onChange(next);
  }

  function removeItem(i) {
    onChange(items.filter((_, idx) => idx !== i));
  }

  function addItem() {
    onChange([...items, '']);
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-center">
          <div className="flex-1">
            <AutoComplete
              value={item}
              onChange={v => updateItem(i, v)}
              suggestions={suggestions}
              placeholder={placeholder}
              strict={strict}
            />
          </div>
          <button
            type="button"
            onClick={() => removeItem(i)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-red-200 text-red-500 hover:bg-red-50 flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        style={{ color: accentColor, borderColor: accentColor }}
        className="flex items-center gap-1.5 text-sm font-semibold border rounded-xl px-3 py-2 hover:bg-orange-50"
      >
        <Plus size={15} /> Add name
      </button>
    </div>
  );
}
