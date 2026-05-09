import { useState, useEffect, useCallback } from 'react';
import { getScriptUrl, setScriptUrl } from '../config/sheets';

const ENTRIES_KEY = 'vsg-entries-v5';
const CONFIG_KEY = 'vsg-config-v1';

function api(params) {
  const url = getScriptUrl();
  if (!url) return Promise.reject(new Error('No script URL configured'));
  const qs = new URLSearchParams(params).toString();
  return fetch(`${url}?${qs}`).then(r => r.json());
}

export function useSheets() {
  const [entries, setEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem(ENTRIES_KEY)) || []; }
    catch { return []; }
  });
  const [config, setConfig] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CONFIG_KEY)) || {}; }
    catch { return {}; }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scriptUrl, setScriptUrlState] = useState(getScriptUrl);

  const syncEntries = useCallback(async () => {
    if (!getScriptUrl()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api({ action: 'getAll' });
      const list = Array.isArray(data) ? data : (data.data || []);
      setEntries(list);
      localStorage.setItem(ENTRIES_KEY, JSON.stringify(list));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const syncConfig = useCallback(async () => {
    if (!getScriptUrl()) return;
    try {
      const data = await api({ action: 'getConfig' });
      setConfig(data);
      localStorage.setItem(CONFIG_KEY, JSON.stringify(data));
    } catch { /* keep cached */ }
  }, []);

  const syncAll = useCallback(async () => {
    await Promise.all([syncEntries(), syncConfig()]);
  }, [syncEntries, syncConfig]);

  useEffect(() => {
    if (scriptUrl) syncAll();
  }, [scriptUrl, syncAll]);

  const saveEntry = useCallback(async (entry) => {
    const data = await api({ action: 'save', data: JSON.stringify(entry) });
    await syncEntries();
    return data;
  }, [syncEntries]);

  const deleteEntry = useCallback(async (id) => {
    await api({ action: 'delete', id });
    await syncEntries();
  }, [syncEntries]);

  const saveScriptUrl = useCallback((url) => {
    setScriptUrl(url);
    setScriptUrlState(url);
  }, []);

  const nextViharNo = entries.length
    ? Math.max(...entries.map(e => Number(e.viharNo) || 0)) + 1
    : 1;

  return {
    entries,
    config,
    loading,
    error,
    syncAll,
    syncEntries,
    syncConfig,
    saveEntry,
    deleteEntry,
    nextViharNo,
    scriptUrl,
    saveScriptUrl,
  };
}
