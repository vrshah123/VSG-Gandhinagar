export default function Medal({ rank, name, count, color = '#C96800' }) {
  // Medal emoji for top 3
  const medalIcon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-white border border-[#F5E5B0]">
      {/* <span className="text-sm font-black w-7 text-center text-[#C96800]">{rank}</span> */}
      {/* Rank — medal emoji for 1,2,3 or plain number for rest */}
      <div className="w-8 flex items-center justify-center flex-shrink-0">
        {medalIcon ? (
          <span className="text-2xl">{medalIcon}</span>
        ) : (
          <span className="text-sm font-black text-[#8B6525]">{rank}</span>
        )}
      </div>
      
      <span className="flex-1 text-sm font-bold text-[#C96800]">{name}</span>
      <span className="text-sm font-bold" style={{ color }}>{count} vihar</span>
    </div>
  );
}

