// Thin fetch wrapper — all requests include credentials (session cookie).
// On 401 the caller receives null; the store will redirect to /login.

const BASE = '';  // same origin via Vite proxy in dev, same origin in prod

async function req(method, path, body) {
  const opts = {
    method,
    credentials: 'include',
    headers: {},
  };
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(BASE + path, opts);
  if (res.status === 401 && path !== '/auth/login') return null; // unauthenticated session lookup
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.error || `${method} ${path} → ${res.status}`);
  return payload;
}

export const api = {
  // Auth
  getMe:    ()        => req('GET',  '/auth/me'),
  login:    (details) => req('POST', '/auth/login', details),
  register: (details) => req('POST', '/auth/register', details),
  logout:   ()        => req('POST', '/auth/logout'),

  // User data
  getData:  ()        => req('GET',  '/api/data'),
  putData:  (data)    => req('PUT',  '/api/data', data),

  // Social
  searchUsers: (q)    => req('GET',  `/social/users?q=${encodeURIComponent(q)}`),
  follow:      (id)   => req('POST', `/social/follow/${id}`),
  unfollow:    (id)   => req('DELETE',`/social/follow/${id}`),
  getFeed:     ()     => req('GET',  '/social/feed'),
  getProfile:  (id)   => req('GET',  `/social/profile/${id}`),
  getSocialStats: ()  => req('GET',  '/social/me/stats'),
};
