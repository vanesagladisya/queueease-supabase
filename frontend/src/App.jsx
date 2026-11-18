import { NavLink, Route, Routes } from "react-router-dom";
import { GraduationCap, LayoutDashboard, Ticket } from "lucide-react";
import StudentPage from "./pages/StudentPage";
import StaffGate from "./components/StaffGate";

function Layout() {
  const linkClass = ({ isActive }) =>
    `inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
      isActive ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
    }`;

  return (
    <div className="min-h-screen">
      <header className="border-b border-blue-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-2.5 text-white"><Ticket size={22} /></div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-slate-900">QueueEase</h1>
              <p className="text-xs text-slate-500">Sistem Antrean Digital Kampus</p>
            </div>
          </div>
          <nav className="flex gap-2">
            <NavLink to="/" end className={linkClass}><GraduationCap size={17} /> Mahasiswa</NavLink>
            <NavLink to="/admin" className={linkClass}><LayoutDashboard size={17} /> Petugas</NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Routes>
          <Route path="/" element={<StudentPage />} />
          <Route path="/admin" element={<StaffGate />} />
        </Routes>
      </main>
      <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-500">
        QueueEase · Praktikum Pemrograman Berbasis Framework
      </footer>
    </div>
  );
}

export default function App() {
  return <Layout />;
}