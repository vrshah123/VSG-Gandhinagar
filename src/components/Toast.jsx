import { useEffect } from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';

const ICONS = {
  success: <CheckCircle size={18} className="text-green-600" />,
  error: <XCircle size={18} className="text-red-600" />,
  info: <Info size={18} className="text-orange-600" />,
};

export default function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] w-[90vw] max-w-sm">
      <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 shadow-lg border border-[#E8C97A]">
        {ICONS[type]}
        <span className="text-sm font-semibold text-[#3D1F00] flex-1">{message}</span>
      </div>
    </div>
  );
}
