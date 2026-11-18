import { useCallback, useEffect, useState } from "react";
import { Activity, CheckCircle2, Clock3, ListOrdered, Megaphone, RefreshCw, Users } from "lucide-react";
import { callNext, completeQueue, getQueue, getStats } from "../services/api";
import QueueTable from "../components/QueueTable";
import StatCard from "../components/StatCard";

export default function AdminPage() {
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({ total: 0, waiting: 0, called: 0, done: 0 });
  const [current, setCurrent] = useState(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const refresh = useCallback(async () => {
    try {
      const [queueData, statsData] = await Promise.all([getQueue(), getStats()]);
      setRows(queueData);
      setStats(statsData);
      setCurrent(queueData.find((item) => item.status === "called") || null);
      setLastUpdated(new Date());
    } catch {
      setMessage("Gagal memuat data. Periksa koneksi backend dan PostgreSQL.");
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 5000);
    return () => clearInterval(timer);
  }, [refresh]);

  const handleCallNext = async () => {
    setBusy(true);
    setMessage("");
    try {
      const called = await callNext();
      setMessage(`Nomor ${called.ticket} berhasil dipanggil.`);
      await refresh();
    } catch (err) {
      setMessage(err.response?.data?.message || "Gagal memanggil antrean.");
    } finally {
      setBusy(false);
    }
  };

  const handleComplete = async (id) => {
    setBusy(true);
    setMessage("");
    try {
      await completeQueue(id);
      setMessage("Antrean berhasil diselesaikan.");
      await refresh();
    } catch (err) {
      setMessage(err.response?.data?.message || "Gagal menyelesaikan antrean.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-blue-600">PANEL PETUGAS</p>
          <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">Dashboard Antrean</h2>
          <p className="mt-2 text-sm text-slate-500">Kelola antrean pelayanan akademik hari ini.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500"><RefreshCw size={14} /> Update otomatis 5 detik</div>
      </div>

      {message && <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">{message}</div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Antrean" value={stats.total} icon={Users} tone="blue" />
        <StatCard label="Menunggu" value={stats.waiting} icon={Clock3} tone="amber" />
        <StatCard label="Sedang Dipanggil" value={stats.called} icon={Megaphone} tone="blue" />
        <StatCard label="Selesai" value={stats.done} icon={CheckCircle2} tone="green" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500"><Activity size={17} /> ANTREAN SEKARANG DIPANGGIL</div>
          <div className="my-6 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-700 px-5 py-7 text-center text-white">
            <p className="text-xs font-semibold tracking-[0.2em] text-blue-100">NOMOR ANTREAN</p>
            <p className="mt-2 text-6xl font-black tracking-widest">{current?.ticket || "---"}</p>
            <p className="mt-3 text-lg font-semibold">{current?.nama || "Belum ada antrean dipanggil"}</p>
            {current && <p className="mt-1 text-sm text-blue-100">{current.keperluan}</p>}
          </div>
          <button onClick={handleCallNext} disabled={busy || stats.waiting === 0} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
            <Megaphone size={18} /> {busy ? "Memproses..." : "Panggil Berikutnya"}
          </button>
          <p className="mt-3 text-center text-xs leading-5 text-slate-400">Saat nomor berikutnya dipanggil, antrean yang sebelumnya dipanggil otomatis ditandai selesai.</p>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div><h3 className="font-bold text-slate-900">Manajemen Antrean</h3><p className="mt-1 text-xs text-slate-500">Daftar antrean hari ini</p></div>
            <span className="rounded-lg bg-slate-100 p-2 text-slate-600"><ListOrdered size={18} /></span>
          </div>
          <QueueTable rows={rows} showAction onComplete={handleComplete} />
          <div className="border-t border-slate-100 px-6 py-3 text-xs text-slate-400">Pembaruan terakhir: {lastUpdated.toLocaleTimeString("id-ID")}</div>
        </section>
      </div>
    </div>
  );
}
