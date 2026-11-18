export default function StatusBadge({ status }) {
  const styles = {
    waiting: "bg-amber-50 text-amber-700 ring-amber-200",
    called: "bg-blue-50 text-blue-700 ring-blue-200",
    done: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  };
  const labels = { waiting: "Menunggu", called: "Dipanggil", done: "Selesai" };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${styles[status] || "bg-slate-100 text-slate-600 ring-slate-200"}`}>
      {labels[status] || status}
    </span>
  );
}
