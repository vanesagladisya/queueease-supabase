import { Router } from "express";
import pool from "../config/db.js";

const router = Router();

const today = `CURRENT_DATE`;

function formatQueueNumber(number) {
  return `Q${String(number).padStart(3, "0")}`;
}

function serialize(row) {
  return {
    ...row,
    ticket: formatQueueNumber(row.queue_number),
  };
}

// GET /api/queue – daftar antrean hari ini
router.get("/", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, queue_number, nama, keperluan, status, created_at
      FROM antrean
      WHERE service_date = ${today}
      ORDER BY queue_number ASC
    `);
    res.json(result.rows.map(serialize));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil data antrean." });
  }
});

// GET /api/queue/stats – statistik antrean hari ini
router.get("/stats", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'waiting')::int AS waiting,
        COUNT(*) FILTER (WHERE status = 'called')::int AS called,
        COUNT(*) FILTER (WHERE status = 'done')::int AS done
      FROM antrean
      WHERE service_date = ${today}
    `);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil statistik." });
  }
});

// POST /api/queue – mahasiswa mengambil nomor antrean
router.post("/", async (req, res) => {
  const nama = String(req.body.nama || "").trim();
  const keperluan = String(req.body.keperluan || "").trim();

  if (!nama || !keperluan) {
    return res.status(400).json({ message: "Nama dan keperluan wajib diisi." });
  }
  if (nama.length > 100 || keperluan.length > 150) {
    return res.status(400).json({ message: "Nama atau keperluan terlalu panjang." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Advisory lock mencegah dua permintaan bersamaan memperoleh nomor yang sama.
    await client.query("SELECT pg_advisory_xact_lock(20261111)");
    const next = await client.query(`
      SELECT COALESCE(MAX(queue_number), 0) + 1 AS next_number
      FROM antrean WHERE service_date = CURRENT_DATE
    `);
    const inserted = await client.query(
      `INSERT INTO antrean (queue_number, nama, keperluan)
       VALUES ($1, $2, $3)
       RETURNING id, queue_number, nama, keperluan, status, created_at`,
      [next.rows[0].next_number, nama, keperluan]
    );
    await client.query("COMMIT");
    res.status(201).json(serialize(inserted.rows[0]));
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Gagal membuat nomor antrean." });
  } finally {
    client.release();
  }
});

// PATCH /api/queue/call-next – panggil antrean menunggu paling awal
router.patch("/call-next", async (_req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Untuk simulasi satu loket: panggilan sebelumnya otomatis dianggap selesai.
    await client.query(
      `UPDATE antrean SET status = 'done'
       WHERE service_date = CURRENT_DATE AND status = 'called'`
    );
    const next = await client.query(
      `SELECT id FROM antrean
       WHERE service_date = CURRENT_DATE AND status = 'waiting'
       ORDER BY queue_number ASC
       LIMIT 1 FOR UPDATE`
    );

    if (next.rowCount === 0) {
      await client.query("COMMIT");
      return res.status(404).json({ message: "Tidak ada antrean yang menunggu." });
    }

    const updated = await client.query(
      `UPDATE antrean SET status = 'called'
       WHERE id = $1
       RETURNING id, queue_number, nama, keperluan, status, created_at`,
      [next.rows[0].id]
    );
    await client.query("COMMIT");
    res.json(serialize(updated.rows[0]));
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Gagal memanggil antrean." });
  } finally {
    client.release();
  }
});

// PATCH /api/queue/:id/done – tandai antrean selesai
router.patch("/:id/done", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "ID antrean tidak valid." });
  }

  try {
    const result = await pool.query(
      `UPDATE antrean SET status = 'done'
       WHERE id = $1 AND service_date = CURRENT_DATE
       RETURNING id, queue_number, nama, keperluan, status, created_at`,
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Antrean tidak ditemukan." });
    }
    res.json(serialize(result.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal menyelesaikan antrean." });
  }
});

export default router;
