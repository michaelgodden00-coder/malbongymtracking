import { useState, useEffect, useRef } from 'react';
import { api } from '../api.js';
import { useStore } from '../store.jsx';
import { svol, work, best1, hist } from '../utils.js';

export default function Social() {
  const { user } = useStore();
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [feed,    setFeed]    = useState([]);
  const [stats,   setStats]   = useState({ followers: 0, following: 0 });
  const [profile, setProfile] = useState(null);   // { user, workouts, exercises, following }
  const [tab,     setTab]     = useState('feed'); // 'feed' | 'search' | 'profile'
  const [loading, setLoading] = useState(true);
  const searchTimer = useRef(null);

  // Load feed + stats on mount
  useEffect(() => {
    Promise.all([api.getFeed(), api.getSocialStats()])
      .then(([f, s]) => {
        setFeed(f ?? []);
        setStats(s ?? { followers: 0, following: 0 });
        setLoading(false);
      });
  }, []);

  // Debounce search
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!query.trim()) { setResults([]); return; }
    searchTimer.current = setTimeout(() => {
      api.searchUsers(query).then(r => setResults(r ?? []));
    }, 400);
  }, [query]);

  async function toggleFollow(targetId, currentlyFollowing) {
    if (currentlyFollowing) {
      await api.unfollow(targetId);
    } else {
      await api.follow(targetId);
    }
    // Refresh results + feed
    if (query.trim()) {
      const r = await api.searchUsers(query);
      setResults(r ?? []);
    }
    const [f, s] = await Promise.all([api.getFeed(), api.getSocialStats()]);
    setFeed(f ?? []);
    setStats(s ?? stats);
  }

  async function viewProfile(id) {
    const p = await api.getProfile(id);
    setProfile(p);
    setTab('profile');
  }

  if (loading) return <p className="note" style={{ padding: 24 }}>Loading…</p>;

  // ── Profile view ────────────────────────────────────────────
  if (tab === 'profile' && profile) {
    const { user: pu, workouts, exercises, following } = profile;
    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button className="sm alt" onClick={() => { setTab('feed'); setProfile(null); }}>← Back</button>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {pu.avatar_url
            ? <img className="avatar" src={pu.avatar_url} alt={pu.display_name} referrerPolicy="no-referrer" />
            : <div className="avatar" style={{ background: 'var(--g)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--on)', fontSize: 18, fontWeight: 700 }}>
                {(pu.display_name || '?')[0].toUpperCase()}
              </div>
          }
          <div>
            <h2 style={{ margin: 0 }}>{pu.display_name}</h2>
            <div className="note">{pu.email}</div>
          </div>
          <button
            className={`sm ${following ? 'alt' : ''}`}
            style={{ marginLeft: 'auto' }}
            onClick={async () => {
              await toggleFollow(pu.id, following);
              const p = await api.getProfile(pu.id);
              setProfile(p);
            }}
          >
            {following ? 'Unfollow' : 'Follow'}
          </button>
        </div>

        <h2>Recent workouts</h2>
        {workouts.length === 0
          ? <div className="empty">No workouts yet.</div>
          : workouts.map((w, i) => (
              <div key={i} className="card">
                <b>{w.name}</b>{' '}
                <span className="note">{w.date} · {Math.round(w.en.reduce((a, e) => a + svol(e.sets), 0))} kg</span>
                <br />
                {w.en.map(e => {
                  const ex = exercises.find(x => x.id === e.ex);
                  return <span key={e.ex} className="pill">{ex?.name ?? '?'} {work(e.sets).length}</span>;
                })}
              </div>
            ))
        }
      </>
    );
  }

  // ── Main social view ────────────────────────────────────────
  return (
    <>
      <div className="lab">Members' community</div>
      <h1>Social</h1>

      {/* Stats bar */}
      <div className="card">
        <div className="row">
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div className="big" style={{ fontSize: 28 }}>{stats.followers}</div>
            <div className="note">Followers</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div className="big" style={{ fontSize: 28 }}>{stats.following}</div>
            <div className="note">Following</div>
          </div>
        </div>
      </div>

      {/* Tab strip */}
      <div className="row" style={{ marginBottom: 16 }}>
        <button className={tab === 'feed'   ? '' : 'alt'} onClick={() => setTab('feed')}>Feed</button>
        <button className={tab === 'search' ? '' : 'alt'} onClick={() => setTab('search')}>Find friends</button>
      </div>

      {/* ── Feed tab ── */}
      {tab === 'feed' && (
        feed.length === 0
          ? <div className="empty">Follow some friends to see their workouts here.</div>
          : feed.map((item, i) => (
              <div key={i} className="card">
                <div className="row" style={{ marginBottom: 8 }}>
                  {item.user.avatar_url
                    ? <img className="avatar-sm" src={item.user.avatar_url} alt={item.user.display_name} referrerPolicy="no-referrer" />
                    : <div className="avatar-sm" style={{ background: 'var(--g)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--on)', fontSize: 11, fontWeight: 700 }}>
                        {(item.user.display_name || '?')[0].toUpperCase()}
                      </div>
                  }
                  <div>
                    <b
                      style={{ cursor: 'pointer', color: 'var(--g)' }}
                      onClick={() => viewProfile(item.user.id)}
                    >
                      {item.user.display_name}
                    </b>
                    <span className="note" style={{ marginLeft: 8 }}>{item.workout.date}</span>
                  </div>
                </div>

                <div><b>{item.workout.name}</b></div>
                <div className="note">
                  {Math.round(item.workout.en.reduce((a, e) => a + svol(e.sets), 0))} kg total volume ·{' '}
                  {item.workout.en.reduce((a, e) => a + work(e.sets).length, 0)} sets
                </div>
                <div style={{ marginTop: 6 }}>
                  {item.workout.en.map(e => {
                    const ex = item.exercises.find(x => x.id === e.ex);
                    return <span key={e.ex} className="pill">{ex?.name ?? '?'} {work(e.sets).length}</span>;
                  })}
                </div>
              </div>
            ))
      )}

      {/* ── Search tab ── */}
      {tab === 'search' && (
        <>
          <div className="card">
            <input
              style={{ width: '100%' }}
              placeholder="Search by name or email…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          {results.length === 0 && query.trim()
            ? <div className="empty">No users found.</div>
            : results.map(u => (
                <div key={u.id} className="user-row card" style={{ margin: '4px 0' }}>
                  {u.avatar_url
                    ? <img className="avatar-sm" src={u.avatar_url} alt={u.display_name} referrerPolicy="no-referrer" />
                    : <div className="avatar-sm" style={{ background: 'var(--g)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--on)', fontSize: 11, fontWeight: 700 }}>
                        {(u.display_name || '?')[0].toUpperCase()}
                      </div>
                  }
                  <div style={{ flex: 1 }}>
                    <b style={{ cursor: 'pointer', color: 'var(--g)' }} onClick={() => viewProfile(u.id)}>
                      {u.display_name}
                    </b>
                    <div className="note">{u.followers} followers</div>
                  </div>
                  <button
                    className={`sm ${u.following ? 'alt' : ''}`}
                    onClick={() => toggleFollow(u.id, u.following)}
                  >
                    {u.following ? 'Unfollow' : 'Follow'}
                  </button>
                </div>
              ))
          }
        </>
      )}
    </>
  );
}
