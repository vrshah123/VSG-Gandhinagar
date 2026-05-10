import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Copy, Check } from 'lucide-react';
import { useSheets } from '../hooks/useSheets';
import { useAuth } from '../context/AuthContext';
import { todayISO, buildWhatsAppMessage } from '../utils/formatters';
import AutoComplete from '../components/AutoComplete';
import ListInput from '../components/ListInput';
import Toast from '../components/Toast';
import sadhviji from '../assets/sadhviji.jfif';
import sadhu from '../assets/sadhu.jfif';

function parseTimeForInput(val) {
  if (!val) return '';
  if (typeof val === 'string' && val.includes('T')) {
    const d = new Date(val);
    if (!isNaN(d)) return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
  }
  return String(val);
}

const DEFAULT_FORM = {
  date: todayISO(),
  startTime: '04:45',
  endTime: '07:45',
  sadhviji: '',
  sadhu: '',
  maharajNames: [],
  km: '',
  from: '',
  to: '',
  sevak: [''],
  sevika: [''],
};

export default function AddEntry() {
  const navigate = useNavigate();
  const location = useLocation();
  const { entries, config, saveEntry, nextViharNo, syncConfig } = useSheets();
  const { session } = useAuth();

  const editEntry = location.state?.entry || null;

  const [form, setForm] = useState(() => editEntry ? {
    ...DEFAULT_FORM,
    ...editEntry,
    startTime: parseTimeForInput(editEntry.startTime) || DEFAULT_FORM.startTime,
    endTime: parseTimeForInput(editEntry.endTime) || DEFAULT_FORM.endTime,
    maharajNames: editEntry.maharajNames || [],
    sevak: editEntry.sevak?.length ? editEntry.sevak : [''],
    sevika: editEntry.sevika?.length ? editEntry.sevika : [''],
  } : DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { syncConfig(); }, []);

  const places = config?.places || [];
  const sevakNames = config?.sevakNames || [];
  const sevikaNames = config?.sevikaNames || [];
  const viharNo = editEntry?.viharNo ?? nextViharNo;
  const whatsAppMsg = buildWhatsAppMessage({ ...form, viharNo });

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function validate() {
    if (!form.date) return 'Date is required';
    if (!form.from.trim()) return 'From location is required';
    if (!form.to.trim()) return 'To location is required';
    if (!form.km || Number(form.km) <= 0) return 'Distance (KM) is required';

    const sv = Number(form.sadhviji) || 0;
    const sd = Number(form.sadhu) || 0;
    if (sv === 0 && sd === 0) return 'Enter count for at least Sadhviji Bhagwant or Sadhu Bhagwant';

    const hasSevak = form.sevak.some(Boolean);
    const hasSevika = form.sevika.some(Boolean);
    if (!hasSevak && !hasSevika) return 'At least one Vihar Sevak or Vihar Sevika must be added';

    // Duplicate check — same date + from + to
    const isDuplicate = entries.some(e =>
      e.date === form.date &&
      e.from?.toLowerCase().trim() === form.from.toLowerCase().trim() &&
      e.to?.toLowerCase().trim() === form.to.toLowerCase().trim() &&
      (!editEntry || e.id !== editEntry.id)
    );
    if (isDuplicate) return `A vihar entry from "${form.from}" to "${form.to}" on this date already exists`;

    return null;
  }

  function handleCopy() {
    navigator.clipboard.writeText(whatsAppMsg).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleSave() {
    const err = validate();
    if (err) { setToast({ message: err, type: 'error' }); return; }

    setSaving(true);
    try {
      const entry = {
        ...form,
        viharNo,
        id: editEntry?.id || `vsg-${Date.now()}`,
        sevak: form.sevak.filter(Boolean),
        sevika: form.sevika.filter(Boolean),
        maharajNames: form.maharajNames.filter(Boolean),
        savedBy: session.username,
        savedAt: new Date().toISOString(),
      };
      await saveEntry(entry);
      navigate('/confirm', { state: { entry } });
    } catch (e) {
      setToast({ message: e.message || 'Save failed', type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col h-full w-full max-w-[480px] mx-auto bg-[#FFFDF5]">
      <header className="flex items-center gap-3 px-4 pt-4 pb-3 bg-[#C96800]">
        <button onClick={() => navigate(-1)} className="text-white p-1.5 rounded-xl hover:bg-orange-700">
          <ChevronLeft size={22} />
        </button>
        <div className="flex-1">
          <h1 className="text-white font-black text-base">{editEntry ? 'Edit Vihar' : 'New Vihar Entry'}</h1>
          <p className="text-orange-100 text-xs font-semibold">Vihar No. {viharNo}</p>
        </div>
      </header>

      <div className="scroll-area px-4 pt-4 space-y-5">
        {/* Date & Time */}
        <Section title="Date & Time">
          <Field label="Date" required>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Time" required>
              <input type="time" value={form.startTime} onChange={e => set('startTime', e.target.value)} className={inputCls} />
            </Field>
            <Field label="End Time" required>
              <input type="time" value={form.endTime} onChange={e => set('endTime', e.target.value)} className={inputCls} />
            </Field>
          </div>
        </Section>

        {/* Thana */}
        <Section title="Thana & Distance">
          <p className="text-[10px] text-[#8B6525]">At least one count is required <span className="text-red-500">*</span></p>
          <div className="grid grid-cols-2 gap-3">
            <Field label={
              <span className="flex items-center gap-1.5">
                <img src={sadhviji} className="w-5 h-5 object-contain" alt="" />
                Sadhviji Bhagwant
              </span>
            }>
              <input type="text" inputMode="numeric" value={form.sadhviji} onChange={e => set('sadhviji', e.target.value)}
                placeholder="e.g. 9" className={inputCls} />
            </Field>
            <Field label={
              <span className="flex items-center gap-1.5">
                <img src={sadhu} className="w-5 h-5 object-contain" alt="" />
                Sadhu Bhagwant
              </span>
            }>
              <input type="text" inputMode="numeric" value={form.sadhu} onChange={e => set('sadhu', e.target.value)}
                placeholder="e.g. 3" className={inputCls} />
            </Field>
          </div>
          <Field label="Maharaj Saheb Names">
            <ListInput
              items={form.maharajNames}
              onChange={v => set('maharajNames', v)}
              placeholder="Add name..."
            />
          </Field>
          <Field label="Distance (KM)" required>
            <input type="text" inputMode="decimal" value={form.km} onChange={e => set('km', e.target.value)}
              placeholder="e.g. 12" className={inputCls} />
          </Field>
        </Section>

        {/* Route */}
        <Section title="Route">
          <Field label="From" required>
            <AutoComplete
              value={form.from}
              onChange={v => set('from', v)}
              suggestions={places}
              placeholder="Starting location"
              strict={places.length > 0}
            />
          </Field>
          <Field label="To" required>
            <AutoComplete
              value={form.to}
              onChange={v => set('to', v)}
              suggestions={places}
              placeholder="Destination"
              strict={places.length > 0}
            />
          </Field>
        </Section>

        {/* Sevak */}
        <Section title={<span>Vihar Sevak (Male) <RequiredNote /></span>} accent="#C96800">
          <ListInput
            items={form.sevak}
            onChange={v => set('sevak', v)}
            suggestions={sevakNames}
            placeholder="Sevak name..."
            accentColor="#C96800"
            strict={sevakNames.length > 0}
          />
        </Section>

        {/* Sevika */}
        <Section title={<span>Vihar Sevika (Female) <RequiredNote /></span>} accent="#7B2D8B">
          <ListInput
            items={form.sevika}
            onChange={v => set('sevika', v)}
            suggestions={sevikaNames}
            placeholder="Sevika name..."
            accentColor="#7B2D8B"
            strict={sevikaNames.length > 0}
          />
        </Section>

        <p className="text-[10px] text-[#8B6525] px-1">
          <span className="text-red-500">*</span> Required &nbsp;·&nbsp;
          Sadhviji or Sadhu count mandatory &nbsp;·&nbsp; At least one Sevak or Sevika mandatory
        </p>

        {/* Preview — toggle with inline copy */}
        <div className="bg-white border border-[#F5E5B0] rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setPreview(p => !p)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-[#C96800]"
          >
            <span>👁 Preview WhatsApp Message</span>
            <span className="text-xs font-semibold text-[#8B6525]">{preview ? 'Hide ▲' : 'Show ▼'}</span>
          </button>

          {preview && (
            <div className="border-t border-[#F5E5B0]">
              <div className="px-4 pt-3 pb-2">
                <pre className="bg-[#DCF8C6] rounded-xl p-3.5 text-xs text-[#3D1F00] whitespace-pre-wrap font-sans border border-green-200 leading-relaxed">
                  {whatsAppMsg}
                </pre>
              </div>
              <div className="px-4 pb-3">
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`w-full flex items-center justify-center gap-2 font-bold rounded-xl py-2.5 text-sm transition-colors ${
                    copied ? 'bg-green-600 text-white' : 'bg-[#25D366] text-white hover:bg-green-600'
                  }`}
                >
                  {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy for WhatsApp</>}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Save */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#C96800] text-white font-black rounded-xl py-4 text-base disabled:opacity-60 mb-2"
        >
          {saving ? 'Saving…' : editEntry ? 'Update Entry' : 'Save Entry'}
        </button>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

function Section({ title, children, accent = '#C96800' }) {
  return (
    <div className="bg-white border border-[#F5E5B0] rounded-2xl p-4 space-y-3">
      <h3 className="font-black text-sm" style={{ color: accent }}>{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children, required }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-bold text-[#8B6525] flex items-center gap-0.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function RequiredNote() {
  return <span className="text-red-500 font-black text-sm ml-0.5">*</span>;
}

const inputCls = 'w-full border border-[#E8C97A] rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-[#C96800]';
