import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Clock3, RefreshCw, Send, Ticket } from "lucide-react";
import { createQueue, getQueue } from "../services/api";
import QueueTable from "../components/QueueTable";
import StatusBadge from "../components/StatusBadge";

export default function StudentPage() {
  const [form, setForm] = useState({ nama: "", keperluan: "Konsultasi Akademik" });
  const [rows, setRows] = useState([]);
  const [myTicket, setMyTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const refresh = useCallback(async () => {
    try {
      const data = await getQueue();
      setRows(data);
      setLastUpdated(new Date());
      if (myTicket) {
        const updated = data.find((item) => item.id === myTicket.id);
        if (updated) setMyTicket(updated);
      }
    } catch {
      setError("Tidak dapat terhubung ke server. Pastikan backend berjalan.");
    }
  }, [myTicket?.id]);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 5000);
    return () => clearInterval(timer);
  }, [refresh]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const ticket = await createQueue(form);
      setMyTicket(ticket);
      setForm({ nama: "", keperluan: "Konsultasi Akademik" });
      await refresh();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengambil antrean.");
    } finally {
      setLoading(false);
    }
  };

  const waiting = rows.filter((row) => row.status === "waiting").length;

  return (
    <div className="space-y-7">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-6 py-8 text-white shadow-lg shadow-blue-200 sm:px-9">
        <p className="text-sm font-semibold text-blue-100">PELAYANAN AKADEMIK</p>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Antrean tanpa harus menunggu lama.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">Ambil nomor antrean secara online, lalu pantau status antrean Anda melalui halaman ini.</p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2"><Clock3 size={16} /> {waiting} antrean menunggu</span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2"><RefreshCw size={15} /> Update otomatis 5 detik</span>
        </div>
      </section>

      {error && <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle size={18} />{error}</div>}

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <span className="rounded-xl bg-blue-50 p-3 text-blue-700"><Ticket size={22} /></span>
            <div><h3 className="font-bold text-slate-900">Ambil Nomor Antrean</h3><p className="text-xs text-slate-500">Isi data untuk mendapatkan nomor.</p></div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Nama mahasiswa</label>
              <input required maxLength="100" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="Contoh: Fiky Anggara" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Keperluan</label>
              <select value={form.keperluan} onChange={(e) => setForm({ ...form, keperluan: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
                <option>Konsultasi Akademik</option>
                <option>Surat Aktif Kuliah</option>
                <option>Legalisir Dokumen</option>
                <option>Pengajuan Cuti</option>
                <option>Lainnya</option>
              </select>
            </div>
            <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
              <Send size={17} /> {loading ? "Memproses..." : "Ambil Nomor Antrean"}
            </button>
          </form>

          {myTicket && (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800"><CheckCircle2 size={18} /> Nomor antrean Anda</div>
              <p className="my-2 text-4xl font-black tracking-wider text-emerald-700">{myTicket.ticket}</p>
              <div className="flex items-center justify-between gap-3 text-sm text-emerald-900">
                <span>{myTicket.nama}</span><StatusBadge status={myTicket.status} />
              </div>
              <p className="mt-2 text-xs text-emerald-700">Simpan nomor ini dan pantau status antrean.</p>
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div><h3 className="font-bold text-slate-900">Daftar Antrean Hari Ini</h3><p className="mt-1 text-xs text-slate-500">Urutan antrean pelayanan akademik</p></div>
            <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">{rows.length} antrean</span>
          </div>
          <QueueTable rows={rows} />
          <div className="border-t border-slate-100 px-6 py-3 text-xs text-slate-400">Pembaruan terakhir: {lastUpdated.toLocaleTimeString("id-ID")}</div>
        </section>
      </div>
    </div>
  );
}
