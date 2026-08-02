import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../..//context/AuthContext'; // Sesuaikan path context kamu

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Membersihkan token & user dari Context + localStorage
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Top Navbar */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-md shadow-blue-500/20">
              App
            </div>
            <h1 className="text-lg font-bold text-slate-900">Portal Dashboard</h1>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-all hover:bg-red-100 hover:text-red-700 active:scale-[0.98]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Keluar / Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Banner Welcome */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-xl shadow-blue-500/10 sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium tracking-wide text-white backdrop-blur-md">
                Role: {user?.role || 'ATTENDEE'}
              </span>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                Selamat Datang Kembali, {user?.fullName || 'Pengguna'}! 👋
              </h2>
              <p className="mt-1 text-sm text-blue-100">
                Kamu berhasil masuk ke dalam sistem dengan sesi autentikasi terenkripsi.
              </p>
            </div>
          </div>
        </div>

        {/* User Detail Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          
          {/* Card Profil */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Informasi Pengguna
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500">Nama Lengkap</p>
                <p className="font-semibold text-slate-900">{user?.fullName || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Email Address</p>
                <p className="font-semibold text-slate-900">{user?.email || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Nomor Telepon</p>
                <p className="font-semibold text-slate-900">{user?.phoneNumber || '-'}</p>
              </div>
            </div>
          </div>

          {/* Card Referral Code */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Kode Referral Saya
            </h3>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 ring-1 ring-slate-200/60">
              <span className="font-mono text-lg font-bold tracking-wider text-blue-600">
                {user?.referralCode || 'REF-XXXXXX'}
              </span>
              <button 
                onClick={() => navigator.clipboard.writeText(user?.referralCode || '')}
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-100"
              >
                Salin
              </button>
            </div>
          </div>

          {/* Card Status Sesi */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Status Sesi
            </h3>
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
              </span>
              <span className="text-sm font-medium text-slate-700">JWT Token Active</span>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default DashboardPage;