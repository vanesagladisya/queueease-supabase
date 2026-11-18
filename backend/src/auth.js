import { randomBytes, timingSafeEqual, createHash } from 'node:crypto';
import { Router } from 'express';
const sessions = new Map();
const digest = value => createHash('sha256').update(value).digest();
const equal = (a,b) => timingSafeEqual(digest(a),digest(b));
const tokenOf = req => (req.headers.authorization || '').replace(/^Bearer /, '');
export function requireStaff(req,res,next) {
  const token = tokenOf(req);
  if (!(sessions.get(token) > Date.now())) { sessions.delete(token); return res.status(401).json({message:'Silakan login petugas.'}); }
  next();
}
export const authRoutes = Router();
const attempts = new Map();
authRoutes.post('/login',(req,res)=>{
  const { STAFF_USERNAME, STAFF_PASSWORD } = process.env;
  if (!STAFF_USERNAME || !STAFF_PASSWORD) return res.status(503).json({message:'Akun petugas belum dikonfigurasi.'});
  const now = Date.now();
  for (const [key,value] of attempts) if (value.until <= now) attempts.delete(key);
  for (const [key,value] of sessions) if (value <= now) sessions.delete(key);
  const key = req.ip;
  const a = attempts.get(key) || {count:0,until:now+60000};
  if (a.count >= 5) return res.status(429).json({message:'Terlalu banyak percobaan. Coba lagi dalam satu menit.'});
  a.count++; attempts.set(key,a);
  if (!equal(String(req.body.username || ''),STAFF_USERNAME) || !equal(String(req.body.password || ''),STAFF_PASSWORD)) return res.status(401).json({message:'Username atau password salah.'});
  attempts.delete(key);
  const token = randomBytes(32).toString('hex');
  sessions.set(token,now+8*60*60*1000);
  res.json({token});
});
authRoutes.get('/session',requireStaff,(_req,res)=>res.json({ok:true}));
authRoutes.post('/logout',(req,res)=>{sessions.delete(tokenOf(req));res.json({ok:true});});