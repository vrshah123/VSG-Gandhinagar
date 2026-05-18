import { useEffect } from 'react';
import { useSheets } from '../hooks/useSheets';
import { calcYearlyStats, topN } from '../utils/reportHelpers';
import Medal from '../components/Medal';
import { RefreshCw } from 'lucide-react';
import sadhviji from '../assets/SadhvijiMs.png';
import sadhu from '../assets/SadhuMs.png';
import road from '../assets/Road.png'
import number from '../assets/Number.png'

export default function Reports() {
  const { entries, config, loading, syncAll } = useSheets();

  useEffect(() => { syncAll(); }, []);

  const yearLabel = config?.appConfig?.current_year_label || new Date().getFullYear();
  const yearly = calcYearlyStats(entries);

  return (
    <div className="flex flex-col h-full w-full max-w-[480px] mx-auto bg-[#FFFDF5]">
      <header className="px-4 pt-4 pb-3 bg-[#C96800] flex items-center gap-3">
        <div className="flex-1">
          <h1 className="text-white font-black text-base">Annual Report</h1>
          <p className="text-orange-100 text-xs font-semibold">{yearLabel}</p>
        </div>
        <button onClick={syncAll} className="text-white p-2 rounded-xl hover:bg-orange-700">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      <div className="scroll-area px-4 pt-4 space-y-4">
        {entries.length === 0 && !loading ? (
          <p className="text-center text-[#8B6525] text-sm py-12">No data yet for {yearLabel}.</p>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-3">
              <YearCard label="Total Vihar" value={yearly.total} color="#1B7A3A"  image={number} />
              <YearCard label="Total KM" value={`${yearly.km} km`} color="#1B7A3A"  image={road} />
              <YearCard
                label="Sadhviji Bhagvant"
                value={yearly.sadhviji}
                // icon={<img src={sadhviji} className="w-7 h-7 object-contain" alt="" />}
                 image={sadhviji}
                color="#1B7A3A"
              />
              <YearCard
                label="Sadhu Bhagvant"
                value={yearly.sadhu}
                // icon={<img src={sadhu} className="w-7 h-7 object-contain" alt="" />}
                 image={sadhu}
                color="#1B7A3A"
              />
            </div>

            {/* Month-wise breakdown */}
            {yearly.months.length > 0 && (
              <div className="bg-white border border-[#F5E5B0] rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-[#F5E5B0] bg-[#FFFDF5]">
                  <p className="font-black text-sm text-[#3D1F00]">Month-Wise Report</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-[#FFF3D6]">
                        <th className="text-left px-3 py-2.5 font-black text-[#8B6525]">Month</th>
                        <th className="px-3 py-2.5 font-black text-[#8B6525] text-center">Vihar</th>
                        <th className="px-3 py-2.5 font-black text-[#8B6525] text-center">KM</th>
                        <th className="px-3 py-2.5 font-black text-[#8B6525] text-center">Sadhviji</th>
                        <th className="px-3 py-2.5 font-black text-[#8B6525] text-center">Sadhu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearly.months.map(m => (
                        <tr key={m.key} className="border-t border-[#F5E5B0]">
                          <td className="px-3 py-2.5 font-semibold font-bold text-[#C96800] whitespace-nowrap">{m.label}</td>
                          <td className="px-3 py-2.5 text-center font-bold text-[#1B7A3A]">{m.total}</td>
                          <td className="px-3 py-2.5 text-center font-bold text-[#1B7A3A]">{m.km}</td>
                          <td className="px-3 py-2.5 text-center font-bold text-[#1B7A3A]">{m.sadhviji}</td>
                          <td className="px-3 py-2.5 text-center font-bold text-[#1B7A3A]">{m.sadhu}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Top 5 Sevak */}
            {yearly.sevakRanking.length > 0 && (
              <div className="bg-white border border-[#F5E5B0] rounded-2xl p-4 space-y-2">
                <p className="font-black text-sm text-[#C96800] mb-3">Top 5 Vihar Sevak</p>
                {topN(yearly.sevakRanking).map((r, i) => (
                  <Medal key={r.name} rank={i} name={r.name} count={r.count} color="#C96800" />
                ))}
              </div>
            )}

            {/* Top 5 Sevika */}
            {yearly.sevikaRanking.length > 0 && (
              <div className="bg-white border border-[#F5E5B0] rounded-2xl p-4 space-y-2">
                <p className="font-black text-sm text-[#C96800] mb-3">Top 5 Vihar Sevika</p>
                {topN(yearly.sevikaRanking).map((r, i) => (
                  <Medal key={r.name} rank={i} name={r.name} count={r.count} color="#C96800" />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// function YearCard({ label, value, icon, color }) {
//   return (
//     <div className="bg-white border border-[#F5E5B0] rounded-xl px-4 py-3 flex flex-col gap-1">
//       <div className="flex items-start justify-between">
//         <span className="text-xs font-bold text-[#8B6525] leading-tight">{label}</span>
//         {icon}
//       </div>
//       <span className="font-black text-xl" style={{ color }}>{value}</span>
//     </div>
//   );
// }

function YearCard({ label, value, icon, color, image }) {
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