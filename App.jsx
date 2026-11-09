import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store.jsx';
import Nav       from './components/Nav.jsx';
import Login     from './components/Login.jsx';
import Clubhouse from './pages/Clubhouse.jsx';
import Training  from './pages/Training.jsx';
import Library   from './pages/Library.jsx';
import Muscles   from './pages/Muscles.jsx';
import Progress  from './pages/Progress.jsx';
import Overload  from './pages/Overload.jsx';
import Records   from './pages/Records.jsx';
import Social    from './pages/Social.jsx';
import Settings  from './pages/Settings.jsx';

export default function App() {
  const { user, S } = useStore();

  // Not logged in → show login screen
  if (!user) return <Login />;

  // Data not yet loaded (shouldn't normally happen here, store handles it)
  if (!S) return null;

  return (
    <>
      <Nav />
      <main>
        <Routes>
          <Route path="/"           element={<Navigate to="/clubhouse" replace />} />
          <Route path="/clubhouse"  element={<Clubhouse />} />
          <Route path="/training"   element={<Training />} />
          <Route path="/library"    element={<Library />} />
          <Route path="/muscles"    element={<Muscles />} />
          <Route path="/progress"   element={<Progress />} />
          <Route path="/overload"   element={<Overload />} />
          <Route path="/records"    element={<Records />} />
          <Route path="/social"     element={<Social />} />
          <Route path="/settings"   element={<Settings />} />
          <Route path="*"           element={<Navigate to="/clubhouse" replace />} />
        </Routes>
      </main>
    </>
  );
}
