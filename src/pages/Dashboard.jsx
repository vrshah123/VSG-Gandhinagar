import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, RefreshCw, Settings } from 'lucide-react';
import { useSheets } from '../hooks/useSheets';
import { useAuth } from '../context/AuthContext';
import { PERMISSIONS } from '../config/sheets';
import { getMonthKey, getMonthLabel } from '../utils/formatters';
import { calcMonthStats } from '../utils/reportHelpers';
import SettingsModal from '../components/SettingsModal';
import logo from '../assets/VSG Logo.jpeg';
import sadhviji from '../assets/SadhvijiMs.png';
import sadhu from '../assets/SadhuMs.png';
import road from '../assets/Road.png';
import number from '../assets/Number.png'
export default function Dashboard() {
  const { entries, loading, syncAll, scriptUrl, saveScriptUrl } = useSheets();
  const { fullName, role } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => { syncAll(); }, []);

  const currentMonthKey = getMonthKey(new Date().toISOString().slice(0, 10));
  const currentMonthEntries = entries.filter(e => getMonthKey(e.date) === currentMonthKey);
  const stats = calcMonthStats(currentMonthEntries);
  const monthLabel = getMonthLabel(new Date().toISOString().slice(0, 10));

  function handleSaveUrl(url) {
    saveScriptUrl(url);
  }

  return (
    <div className="flex flex-col h-full w-full max-w-[480px] mx-auto bg-[#FFFDF5]">
      {/* Header */}
      <header className="flex items-center gap-2.5 px-4 pt-4 pb-3 bg-[#C96800]">
        <img src={logo} alt="VSG Logo" className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-orange-300" />
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-black text-base leading-tight">Vihar Seva Group , Gandhinagar </h1>
          <p className="text-orange-100 text-xs font-semibold truncate">Welcome, {fullName}</p>
        </div>

        {/* Setting Icon Excel Sheet sync */}
        {/* <button onClick={() => setShowSettings(true)} className="text-white p-2 rounded-xl hover:bg-orange-700" title="Settings">
          <Settings size={18} />
        </button> */}

        <button onClick={syncAll} className="text-white p-2 rounded-xl hover:bg-orange-700" title="Sync">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
        {PERMISSIONS.canAddEntry(role) && (
          <Link to="/add" className="flex items-center gap-1 bg-white text-[#C96800] font-bold text-sm px-3 py-2 rounded-xl flex-shrink-0">
            <Plus size={16} /> Add
          </Link>
        )}
      </header>

      <div className="scroll-area px-4 pt-4 space-y-4">
        {/* Month heading — no duplicate capsule */}
        <h2 className="font-black text-[#3D1F00] text-base">{monthLabel}</h2>

        {/* Row 1: Total Vihar + Total KM */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total Vihar" value={stats.total} color="#1B7A3A" image={number} />
          <StatCard label="Total KM" value={`${stats.km} km`} color="#1B7A3A" image={road} />
        </div>

        {/* Row 2: Sadhviji + Sadhu side by side */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Sadhviji Bhagvant"
            value={stats.sadhviji}
            // icon={<img src={sadhviji} alt="" className="w-10 h-10 object-contain" />}
            image={sadhviji}
            color="#1B7A3A"
          />
          <StatCard
            label="Sadhu Bhagvant"
            value={stats.sadhu}
            // icon={<img src={sadhu} alt="" className="w-10 h-10 object-contain" />}
            image={sadhu}
            color="#1B7A3A"
          />
        </div>

        {/* Sevak this month */}
        {stats.sevakRanking.length > 0 && (
          <Section title="Vihar Sevak" color="#C96800">
            {stats.sevakRanking.map((r, i) => (
              <RankRow key={r.name} rank={i + 1} name={r.name} count={r.count} color="#C96800" />
            ))}
          </Section>
        )}

        {/* Sevika this month */}
        {stats.sevikaRanking.length > 0 && (
          <Section title="Vihar Sevika" color="#C96800">
            {stats.sevikaRanking.map((r, i) => (
              <RankRow key={r.name} rank={i + 1} name={r.name} count={r.count} color="#C96800" />
            ))}
          </Section>
        )}

        {currentMonthEntries.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-[#8B6525] font-semibold text-sm">No entries for {monthLabel} yet.</p>
            {!scriptUrl && (
              <button
                onClick={() => setShowSettings(true)}
                className="mt-3 text-xs font-bold text-[#C96800] border border-[#C96800] rounded-xl px-4 py-2"
              >
                ⚙️ Connect Google Sheets
              </button>
            )}
          </div>
        )}
      </div>

      {showSettings && (
        <SettingsModal
          currentUrl={scriptUrl}
          onSave={handleSaveUrl}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color, image }) {
  return (
   <div className="bg-white border border-[#F5E5B0] rounded-xl px-4 py-3 flex items-center gap-3">
  
  <div>
    {/* {icon && <span>{icon}</span>} */}
     <img
          src={image}
          alt=""
          className="w-10 h-10 object-contain"
        />
  </div>

  <div className="flex flex-col">
    <span className="text-sm font-bold text-[#C96800] leading-tight">
      {label}
    </span>

    <span
      className="font-black text-xl"
      style={{ color }}
    >
      {value}
    </span>
  </div>

</div>
  );
}

function Section({ title, color, children }) {
  return (
    <div className="bg-white border border-[#F5E5B0] rounded-2xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-[#F5E5B0] bg-[#FFFDF5]">
        <p className="font-black text-sm" style={{ color }}>{title}</p>
      </div>
      <div className="px-4 py-2 divide-y divide-[#F5E5B0]">
        {children}
      </div>
    </div>
  );
}

function RankRow({ rank, name, count, color }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className="text-xs font-black text-[#8B6525] w-5 text-center">{rank}.</span>
      <span className="flex-1 text-sm font-semibold text-[#3D1F00]">{name}</span>
      <span className="text-sm font-black" style={{ color }}>{count}</span>
    </div>
  );
}
