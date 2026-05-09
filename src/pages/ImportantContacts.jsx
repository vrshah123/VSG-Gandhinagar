import { useEffect } from 'react';
import { Phone, RefreshCw } from 'lucide-react';
import { useSheets } from '../hooks/useSheets';

const SECTION_ORDER = ['Captains', 'Admins', 'Doctors', 'Others'];
const SECTION_COLORS = {
  Captains: '#C96800',
  Admins: '#A85000',
  Doctors: '#1B7A3A',
  Others: '#7B2D8B',
};

export default function ImportantContacts() {
  const { config, loading, syncConfig } = useSheets();

  useEffect(() => { syncConfig(); }, []);

  const contacts = config?.importantContacts || [];

  const grouped = SECTION_ORDER.reduce((acc, section) => {
    const list = contacts.filter(c => c.section === section);
    if (list.length) acc[section] = list;
    return acc;
  }, {});

  contacts.forEach(c => {
    if (!SECTION_ORDER.includes(c.section) && c.section) {
      if (!grouped[c.section]) grouped[c.section] = [];
      if (!grouped[c.section].find(x => x.name === c.name)) grouped[c.section].push(c);
    }
  });

  return (
    <div className="flex flex-col h-full max-w-[480px] mx-auto bg-[#FFFDF5]">
      <header className="px-4 pt-4 pb-3 bg-[#C96800] flex items-center gap-3">
        <h1 className="text-white font-black text-base flex-1">Important Contacts</h1>
        <button onClick={syncConfig} className="text-white p-2 rounded-xl hover:bg-orange-700">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      <div className="scroll-area px-4 pt-4 space-y-5">
        {Object.keys(grouped).length === 0 && (
          <div className="text-center py-12">
            <Phone size={40} className="text-[#E8C97A] mx-auto mb-3" />
            <p className="text-[#8B6525] font-semibold text-sm">No contacts found.</p>
            <p className="text-xs text-[#8B6525] mt-1">Add contacts to the "Important Contacts" tab in your Google Sheet.</p>
          </div>
        )}

        {Object.entries(grouped).map(([section, list]) => (
          <div key={section}>
            <h2
              className="font-black text-sm mb-2 px-1"
              style={{ color: SECTION_COLORS[section] || '#C96800' }}
            >
              {section}
            </h2>
            <div className="space-y-2">
              {list.map((c, i) => (
                <div key={i} className="bg-white border border-[#F5E5B0] rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#3D1F00] text-sm">{c.name}</p>
                    {c.note && <p className="text-xs text-[#8B6525] mt-0.5">{c.note}</p>}
                  </div>
                  {c.phone && (
                    <a
                      href={`tel:${c.phone}`}
                      className="flex items-center justify-center w-10 h-10 bg-[#1B7A3A] text-white rounded-xl flex-shrink-0"
                    >
                      <Phone size={16} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
