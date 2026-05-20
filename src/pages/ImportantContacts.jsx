import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Phone, RefreshCw, Search, X } from 'lucide-react';
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
  const [openSection, setOpenSection] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const didInitOpenSection = useRef(false);

  useEffect(() => { syncConfig(); }, []);

  const contacts = config?.importantContacts || [];
  const forceOpenSections = Boolean(searchQuery.trim());
  const filteredContacts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(c => (c?.name || '').toLowerCase().includes(q));
  }, [contacts, searchQuery]);

  const grouped = SECTION_ORDER.reduce((acc, section) => {
    const list = filteredContacts.filter(c => c.section === section);
    if (list.length) acc[section] = list;
    return acc;
  }, {});

  filteredContacts.forEach(c => {
    if (!SECTION_ORDER.includes(c.section) && c.section) {
      if (!grouped[c.section]) grouped[c.section] = [];
      if (!grouped[c.section].find(x => x.name === c.name)) grouped[c.section].push(c);
    }
  });

  const sections = useMemo(() => Object.keys(grouped), [grouped]);

  useEffect(() => {
    if (forceOpenSections) return;
    // Only auto-open the first section once after we have data.
    if (!didInitOpenSection.current && sections.length > 0) {
      didInitOpenSection.current = true;
      setOpenSection(sections[0]);
      return;
    }

    // If the currently-open section disappears (data changed), fall back to the first section.
    if (openSection !== null && sections.length > 0 && !grouped[openSection]) {
      setOpenSection(sections[0]);
    }
  }, [sections, grouped, openSection, forceOpenSections]);

  return (
    <div className="flex flex-col h-full w-full max-w-[480px] mx-auto bg-[#FFFDF5]">
      <header className="px-4 pt-4 pb-3 bg-[#C96800] flex items-center gap-3">
        {isSearchOpen ? (
          <div className="flex-1 min-w-0 flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2">
            <Search size={18} className="text-white flex-shrink-0" />
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name"
              className="w-full bg-transparent text-white placeholder:text-white/70 outline-none text-sm font-semibold"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-white p-1 rounded-lg hover:bg-white/10 flex-shrink-0"
                aria-label="Clear search"
                title="Clear"
              >
                <X size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
              className="text-white p-1 rounded-lg hover:bg-white/10 flex-shrink-0"
              aria-label="Close search"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <h1 className="text-white font-black text-base flex-1">Important Contacts</h1>
        )}

        {!isSearchOpen && (
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="text-white p-2 rounded-xl hover:bg-orange-700"
            aria-label="Search"
            title="Search"
          >
            <Search size={18} />
          </button>
        )}
        <button onClick={syncConfig} className="text-white p-2 rounded-xl hover:bg-orange-700">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      <div className="scroll-area px-4 pt-5 space-y-4">
        {Object.keys(grouped).length === 0 && (
          <div className="text-center py-12">
            <Phone size={20} className="text-[#E8C97A] mx-auto mb-3" />
            <p className="text-[#8B6525] font-semibold text-sm">
              {searchQuery.trim() ? 'No matching contacts found.' : 'No contacts found.'}
            </p>
            <p className="text-xs text-[#8B6525] mt-1">
              {searchQuery.trim()
                ? 'Try a different name or clear the search.'
                : 'Add contacts to the "Important Contacts" tab in your Google Sheet.'}
            </p>
          </div>
        )}

        {Object.entries(grouped).map(([section, list]) => (
          <div key={section} className="pb-1">
            {/* <button
              type="button"
              onClick={() => setOpenSection(prev => (prev === section ? null : section))}
              aria-expanded={openSection === section}
              className="w-full font-black text-sm mb-2 px-1 flex items-center justify-between gap-3 text-left"
              style={{ color: SECTION_COLORS[section] || '#C96800' }}
            >
              <span>{section}</span>
              <ChevronDown
                size={18}
                className={`text-[#8B6525] transition-transform ${openSection === section ? 'rotate-180' : ''}`}
              />
            </button> */}
            <button
  type="button"
  onClick={() => {
    if (forceOpenSections) return;
    setOpenSection(prev => (prev === section ? null : section));
  }}
  aria-expanded={forceOpenSections || openSection === section}
  className="w-full font-black text-sm mb-2 flex items-center justify-between gap-3 text-left px-3 py-2 rounded-xl"
  style={{ 
    backgroundColor: (SECTION_COLORS[section] || '#C96800') + '18',
    borderLeft: `4px solid ${SECTION_COLORS[section] || '#C96800'}`,
    color: SECTION_COLORS[section] || '#C96800'
  }}
>
  <span>{section}</span>
  <ChevronDown
    size={18}
    className={`transition-transform ${(forceOpenSections || openSection === section) ? 'rotate-180' : ''}`}
    style={{ color: SECTION_COLORS[section] || '#C96800' }}
  />
</button>

            {(forceOpenSections || openSection === section) && (
              <div className="space-y-1">
                {list.map((c, i) => (
                  <div key={i} className="bg-white border border-[#F5E5B0] rounded-xl px-2 py-1 flex items-center gap-3">
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
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
