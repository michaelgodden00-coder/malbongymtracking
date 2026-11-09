import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { PAGES } from '../constants.js';

export default function Nav() {
  const { user, logout } = useStore();
  const { pathname } = useLocation();
  const current = pathname.slice(1) || 'clubhouse';

  return (
    <nav id="nav">
      {PAGES.map(([key, label]) => (
        <Link
          key={key}
          to={`/${key}`}
          className={key === current ? 'on' : ''}
        >
          {label}
        </Link>
      ))}

      {/* User avatar + logout */}
      {user && (
        <div className="nav-user" title={`Signed in as ${user.name}`} onClick={logout}>
          {user.avatar
            ? <img className="avatar-sm" src={user.avatar} alt={user.name} referrerPolicy="no-referrer" />
            : <div className="avatar-sm" style={{ background: 'var(--ac)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:11, fontWeight:700 }}>
                {(user.name || '?')[0].toUpperCase()}
              </div>
          }
          <span>{(user.name || '').split(' ')[0]}</span>
        </div>
      )}
    </nav>
  );
}
