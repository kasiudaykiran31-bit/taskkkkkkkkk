// All data is stored in the browser's localStorage.
export const KEY_USERS = 'sps_users', KEY_REPORTS = 'sps_reports', KEY_SESSION = 'sps_session', KEY_NOTICE = 'sps_notices'
export const KEY_ADMIN = 'sps_admin_override', KEY_LOCK = 'sps_lock'

// ===== DEFAULT ADMIN LOGIN (change here, or in Admin > Settings) =====
export const ADMIN_EMAIL = 'admin@studentprogram.com'
export const ADMIN_PASSWORD = 'Mna6HCpD4d@97#'

const demoReports = [
  { email: 'student@gmail.com', marks: 86, attendance: 91, format: 'percentage', remarks: 'Good performance. Keep improving in problem solving.', updated: '24 Sep 2026' },
  { email: 'rahul@gmail.com', marks: 78, attendance: 84, format: 'percentage', remarks: 'Good progress. Focus more on attendance and revision.', updated: '23 Sep 2026' }
]
const demoNotices = [
  { title: 'Mid-Term Examination', text: 'Mid-term examinations begin from 10 October 2026.' },
  { title: 'Fee Payment', text: 'Pay pending semester fees before the due date.' },
  { title: 'Academic Registration', text: 'Course registration window is open.' }
]

const read = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v } catch { return d } }
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v))

export function adminCreds() {
  const o = read(KEY_ADMIN, null)
  return o && o.email && o.password ? o : { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }
}
export function getUsers() {
  let x = read(KEY_USERS, [])
  if (!Array.isArray(x)) x = []
  const a = adminCreds()
  const adm = { id: 'ADM001', name: 'Administrator', email: a.email, password: a.password, role: 'admin' }
  const i = x.findIndex(u => u.role === 'admin')
  if (i >= 0 && x[i].email === adm.email && x[i].password === adm.password) return x
  if (i >= 0) x[i] = adm; else x.unshift(adm)
  write(KEY_USERS, x)
  return x
}
export const saveUsers = u => write(KEY_USERS, u)
export function getReports() { let x = read(KEY_REPORTS, null); if (!x) { x = demoReports; write(KEY_REPORTS, x) } return x }
export const saveReports = r => write(KEY_REPORTS, r)
export function getNotices() { let x = read(KEY_NOTICE, null); if (!x) { x = demoNotices; write(KEY_NOTICE, x) } return x }
export const saveNotices = n => write(KEY_NOTICE, n)

export const getSession = () => read(KEY_SESSION, null)
export const setSession = s => write(KEY_SESSION, s)
export const clearSession = () => localStorage.removeItem(KEY_SESSION)

export const initials = n => (n || '?').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase()
export const gradeOf = m => (m >= 90 ? 'A+' : m >= 80 ? 'A' : m >= 70 ? 'B' : 'C')

export function toast(t) {
  const x = document.getElementById('toast'); if (!x) return
  x.textContent = t; x.className = 'show'
  setTimeout(() => (x.className = ''), 2200)
}
export function toggleDark() {
  document.body.classList.toggle('dark')
  localStorage.setItem('sps_dark', document.body.classList.contains('dark'))
}

// ---- login lockout (5 wrong attempts = 30 seconds) ----
export const getLock = () => read(KEY_LOCK, {})
export const setLock = l => write(KEY_LOCK, l)
export const clearLock = () => localStorage.removeItem(KEY_LOCK)

// ---- CSV / download helpers ----
export function download(name, text, type) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([text], { type: type || 'text/plain' }))
  a.download = name; document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 500)
}
const csvCell = v => { v = String(v ?? ''); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v }
export const toCSV = rows => rows.map(r => r.map(csvCell).join(',')).join('\r\n')
