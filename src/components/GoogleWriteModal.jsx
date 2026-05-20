import { useEffect, useMemo, useRef } from 'react';
import { X } from 'lucide-react';

export default function GoogleWriteModal({ open, clientId, error, onClose, onCredential }) {
  const buttonRef = useRef(null);

  const googleAvailable = useMemo(() => {
    return typeof window !== 'undefined' && window.google?.accounts?.id;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!clientId) return;
    if (!googleAvailable) return;
    if (!buttonRef.current) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (response?.credential) onCredential(response.credential);
      },
      ux_mode: 'popup',
    });

    buttonRef.current.innerHTML = '';
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      width: 320,
      text: 'continue_with',
      shape: 'pill',
    });
  }, [open, clientId, googleAvailable, onCredential]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/40 flex items-end justify-center">
      <div className="w-full max-w-[480px] bg-[#FFFDF5] rounded-t-2xl px-5 pt-5 pb-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h2 className="font-black text-[#3D1F00] text-base">Sign in to edit</h2>
            <p className="text-xs text-[#8B6525] font-semibold mt-1">
              Add/Edit entries is restricted to allowed users.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#FFF3D6] text-[#8B6525]"
            aria-label="Close"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {!clientId && (
          <div className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            Missing `VITE_GOOGLE_CLIENT_ID`.
          </div>
        )}

        {clientId && !googleAvailable && (
          <div className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            Google Sign-In failed to load. Check your network and reload.
          </div>
        )}

        <div className="flex justify-center">
          <div ref={buttonRef} />
        </div>

        {error && (
          <div className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        <p className="text-[11px] text-[#8B6525] font-semibold text-center">
          Your email must be present and Active in the sheet Users allowlist.
        </p>
      </div>
    </div>
  );
}

