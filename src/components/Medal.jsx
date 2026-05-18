export default function Medal({ rank, name, count, color = '#C96800' }) {
  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-white border border-[#F5E5B0]">
      <span className="text-sm font-black w-7 text-center text-[#8B6525]">#{rank}</span>
      <span className="flex-1 text-sm font-semibold text-[#3D1F00]">{name}</span>
      <span className="text-sm font-bold" style={{ color }}>{count} vihar</span>
    </div>
  );
}
