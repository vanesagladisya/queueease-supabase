import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LockKeyhole, Eye, EyeOff, LogOut } from 'lucide-react';
import AdminPage from '../pages/AdminPage';
import { loginStaff, checkStaff, logoutStaff, setStaffToken } from '../services/api';

export default function StaffGate() {
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    const expired = () => {
      setAllowed(false);
      setError('Sesi berakhir. Silakan login kembali.');
    };
    window.addEventListener('queueease-expired', expired);

    checkStaff()
      .then(() => {
        if (active) setAllowed(true);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setChecking(false);
      });

    return () => {
      active = false;
      window.removeEventListener('queueease-expired', expired);
    };
  }, []);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await loginStaff({ username, password });
      setStaffToken(data.token);
      setAllowed(true);
      setPassword('');
    } catch (e) {
      setError(e.response?.data?.message || 'Backend tidak dapat dihubungi.');
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    try {
      await logoutStaff();
    } catch {} finally {
      setStaffToken('');
      setAllowed(false);
      setError('');
    }
  }

  return (
    <>
      <div
        ref={(node) => {
          if (node) node.inert = !allowed;
        }}
        aria-hidden={!allowed ? true : undefined}
      >
        <AdminPage />
      </div>

      {allowed ? (
        <button
          onClick={logout}
          className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm hover:text-red-600"
        >
          <LogOut size={17} /> Keluar
        </button>
      ) : (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <form
            onSubmit={submit}
            role="dialog"
            aria-modal="true"
            aria-labelledby="staff-title"
            className="w-full max-w-sm rounded-2xl bg-white p-7 shadow-xl"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <LockKeyhole size={24} />
            </div>
            <h2 id="staff-title" className="mt-4 text-center text-2xl font-extrabold text-slate-900">
              Login Petugas
            </h2>
            <p className="mt-2 text-center text-sm text-slate-500">
              Silakan login untuk mengakses dashboard.
            </p>

            <label className="mt-6 block text-sm font-semibold text-slate-700" htmlFor="staff-user">
              Username
            </label>
            <input
              autoFocus
              id="staff-user"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
            />

            <label className="mt-4 block text-sm font-semibold text-slate-700" htmlFor="staff-pass">
              Password
            </label>
            <div className="relative mt-2">
              <input
                id="staff-pass"
                autoComplete="current-password"
                required
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 text-sm"
              />
              <button
                type="button"
                aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
                onClick={() => setShow(!show)}
                className="absolute right-3 top-3 text-slate-500"
              >
                {show ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}

            <button
              disabled={busy || checking}
              className="mt-5 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {checking ? 'Memeriksa sesi...' : busy ? 'Memproses...' : 'Masuk'}
            </button>

            <Link to="/" className="mt-4 block text-center text-sm text-slate-500 hover:text-blue-600">
              Kembali ke Mahasiswa
            </Link>
          </form>
        </div>
      )}
    </>
  );
}