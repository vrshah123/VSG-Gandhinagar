import { useState } from 'react';
import { X, Link2, CheckCircle } from 'lucide-react';

export default function SettingsModal({ currentUrl, onSave, onClose }) {
  const [url, setUrl] = useState(currentUrl || '');
  const [saved, setSaved] = useState(false);

  function handleSave() {
    const trimmed = url.trim();
    if (!trimmed) return;
    onSave(trimmed);
    setSaved(true);
    setTimeout(onClose, 1200);
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[150] flex items-end justify-center">
      <div className="w-full max-w-[480px] bg-white rounded-t-2xl px-5 pt-5 pb-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-[#3D1F00] text-base">Settings</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl text-[#8B6525] hover:bg-[#FFF3D6]">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#8B6525] flex items-center gap-1.5">
            <Link2 size={13} /> Google Apps Script URL
          </label>
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/…/exec"
            className="w-full border border-[#E8C97A] rounded-xl px-3 py-2.5 text-sm bg-[#FFFDF5] focus:outline-none focus:border-[#C96800]"
          />
          <p className="text-[10px] text-[#8B6525]">
            Paste the deployed Web App URL from Google Apps Script. App will sync immediately after saving.
          </p>
        </div>

        {saved ? (
          <div className="flex items-center justify-center gap-2 text-green-600 font-bold py-3">
            <CheckCircle size={18} /> Saved — syncing…
          </div>
        ) : (
          <button
            onClick={handleSave}
            disabled={!url.trim()}
            className="w-full bg-[#C96800] text-white font-black rounded-xl py-3.5 text-sm disabled:opacity-50"
          >
            Save & Sync
          </button>
        )}
      </div>
    </div>
  );
}
