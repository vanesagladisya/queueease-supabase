import StatusBadge from "./StatusBadge";

export default function QueueTable({ rows, onComplete, showAction = false }) {
  if (!rows.length) {
    return <div className="p-10 text-center text-sm text-slate-500">Belum ada antrean hari ini.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-4">Nomor</th>
            <th className="px-5 py-4">Nama</th>
            <th className="px-5 py-4">Keperluan</th>
            <th className="px-5 py-4">Status</th>
            {showAction && <th className="px-5 py-4">Aksi</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50/70">
              <td className="px-5 py-4 font-bold text-blue-700">{row.ticket}</td>
              <td className="px-5 py-4 font-medium text-slate-800">{row.nama}</td>
              <td className="px-5 py-4 text-slate-600">{row.keperluan}</td>
              <td className="px-5 py-4"><StatusBadge status={row.status} /></td>
              {showAction && (
                <td className="px-5 py-4">
                  {row.status !== "done" && (
                    <button onClick={() => onComplete(row.id)} className="rounded-lg border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">
                      Selesaikan
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
