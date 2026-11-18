import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

let staffToken = sessionStorage.getItem("queueease-staff") || "";
export const setStaffToken = token => { staffToken = token; if(token) sessionStorage.setItem("queueease-staff",token); else sessionStorage.removeItem("queueease-staff"); };
const staffConfig = () => ({headers:{Authorization:`Bearer ${staffToken}`}});
export const loginStaff = payload => api.post("/auth/login",payload).then(r=>r.data);
export const checkStaff = () => api.get("/auth/session",staffConfig());
export const logoutStaff = () => api.post("/auth/logout",{},staffConfig());
api.interceptors.response.use(r=>r,err=>{if(err.response?.status===401 && err.config?.headers?.Authorization){setStaffToken("");window.dispatchEvent(new Event("queueease-expired"));}return Promise.reject(err);});
export const getQueue = () => api.get("/queue").then((r) => r.data);
export const getStats = () => api.get("/queue/stats").then((r) => r.data);
export const createQueue = (payload) => api.post("/queue", payload).then((r) => r.data);
export const callNext = () => api.patch("/queue/call-next", {}, staffConfig()).then((r) => r.data);
export const completeQueue = (id) => api.patch(`/queue/${id}/done`, {}, staffConfig()).then((r) => r.data);