import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from './api.js';
import { uid, today } from './utils.js';
import { DEFAULT_EXERCISES } from './constants.js';

// ── Context ────────────────────────────────────────────────────
const StoreCtx = createContext(null);
export const useStore = () => useContext(StoreCtx);

// ── Default state (mirrors original S object) ─────────────────
function defaultState() {
  return {
    ex: [],
    wk: [],
    bw: [],
    goals: [],
    notes: [],
    routines: [],
    targets: {},
    draft: null,
    set: { sec: 0.5, inc: 2.5, lo: 6, hi: 10, theme: 'auto' },
  };
}

// ── Provider ───────────────────────────────────────────────────
export function StoreProvider({ children }) {
  const [user,    setUser]    = useState(undefined);   // undefined = loading
  const [S,       setS]       = useState(null);         // null = not loaded
  const [loading, setLoading] = useState(true);

  // Debounced save timer
  const saveTimer = useRef(null);

  // ── Bootstrap: load user + data ─────────────────────────────
  useEffect(() => {
    (async () => {
      let me;
      try {
        me = await api.getMe();
      } catch (error) {
        // Keep the sign-in screen reachable when the API/database is offline.
        console.error('Could not check the current session:', error);
        setUser(null);
        setLoading(false);
        return;
      }
      if (!me) {
        setUser(null);
        setLoading(false);
        return;
      }
      setUser(me);

      let data = await api.getData();
      if (!data || !data.set) {
        // First time or corrupted — initialise
        data = defaultState();
        if (!data.ex.length) {
          data.ex = DEFAULT_EXERCISES.map(e => ({ ...e, id: uid(), notes: '', inc: 0 }));
        }
        await api.putData(data);
      }

      applyTheme(data.set?.theme || 'auto');
      setS(data);
      setLoading(false);
    })();
  }, []);

  // ── Apply theme to <html> ─────────────────────────────────
  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme === 'auto' ? '' : theme;
  }

  // ── Save: debounce writes by 800 ms ─────────────────────────
  const scheduleSave = useCallback((nextS) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      api.putData(nextS).catch(console.error);
    }, 800);
  }, []);

  // ── Update state + schedule save ─────────────────────────────
  const save = useCallback((updater) => {
    setS(prev => {
      const next = typeof updater === 'function'
        ? updater(structuredClone(prev))
        : updater;
      applyTheme(next.set?.theme || 'auto');
      scheduleSave(next);
      return next;
    });
  }, [scheduleSave]);

  // ── Logout ─────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
    setS(null);
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <StoreCtx.Provider value={{ user, S, save, logout }}>
      {children}
    </StoreCtx.Provider>
  );
}

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg)',
    }}>
      <div style={{ textAlign: 'center', color: 'var(--sage)', fontFamily: 'DM Sans,sans-serif' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⛳</div>
        <div>Loading…</div>
      </div>
    </div>
  );
}
