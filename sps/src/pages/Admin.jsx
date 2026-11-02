import { useState, useReducer } from 'react'
import Shell, { Panel, Notices, Hero } from '../components/Shell.jsx'
import { getSession, getUsers, saveUsers, getReports, saveReports, getNotices, saveNotices, adminCreds, KEY_ADMIN, setSession, gradeOf, toast, download, toCSV } from '../store.js'

const MENU = [
  { section: 'ADMIN MENU' },
  { key: 'dashboard', icon: '📊', label: 'Dashboard' },
  { key: 'students', icon: '👨‍🎓', label: 'Students' },
  { key: 'parents', icon: '👪', label: 'Parents' },
  { key: 'reports', icon: '📄', label: 'Reports' },
  { key: 'notices', icon: '📢', label: 'Notices' },
  { key: 'analytics', icon: '📈', label: 'Analytics' },
  { key: 'settings', icon: '⚙️', label: 'Settings' }
]
const TITLES = { dashboard: 'Admin Dashboard', students: 'Manage Students', parents: 'Manage Parents', reports: 'Manage Reports', notices: 'Manage Notices', analytics: 'Analytics', settings: 'Settings' }
const nameOf = email => getUsers().find(u => u.email === email)?.name
const today = () => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

function ReportTable({ rs, onDelete }) {
  return (
    <div className="table-wrap"><table className="data-table">
      <thead><tr><th>Student</th><th>Email</th><th>Marks</th><th>Attendance</th><th>Grade</th><th>Updated</th>{onDelete && <th>Action</th>}</tr></thead>
      <tbody>{rs.map(r => <tr key={r.email}><td>{nameOf(r.email) || 'Unknown'}</td><td>{r.email}</td><td>{r.marks}%</td><td>{r.attendance}%</td>
        <td><span className="badge">{gradeOf(r.marks)}</span></td><td>{r.updated}</td>
        {onDelete && <td><button className="small-btn red" onClick={() => onDelete(r.email)}>Delete</button></td>}</tr>)}
        {!rs.length && <tr><td colSpan="7">No reports.</td></tr>}</tbody>
    </table></div>
  )
}

function LowAttendance({ rs }) {
  const low = rs.filter(r => Number(r.attendance) < 75)
  return (
    <Panel title="Low Attendance Alerts" desc="Students below 75% attendance" icon="⚠️" style={{ marginBottom: 18 }}>
      {low.length ? low.map(r => <div className="notice" key={r.email}><b>{nameOf(r.email) || r.email}</b><span>Attendance {r.attendance}% - needs improvement</span></div>) : <p>All students meet the 75% requirement.</p>}
    </Panel>
  )
}

function Dashboard() {
  const students = getUsers().filter(x => x.role === 'student'), rs = getReports()
  const avg = rs.length ? Math.round(rs.reduce((a, x) => a + Number(x.marks), 0) / rs.length) : 0
  const att = rs.length ? Math.round(rs.reduce((a, x) => a + Number(x.attendance), 0) / rs.length) : 0
  return (
    <>
      <Hero title="Admin Dashboard" text="Manage student performance, attendance, grades and reports from one place." icon="📊" />
      <div className="cards">
        <div className="stat"><span className="ico">👨‍🎓</span><b>{students.length}</b><small>Total Students</small></div>
        <div className="stat"><span className="ico">📄</span><b>{rs.length}</b><small>Total Reports</small></div>
        <div className="stat"><span className="ico">🎯</span><b>{avg}%</b><small>Average Marks</small></div>
        <div className="stat"><span className="ico">🗓️</span><b>{att}%</b><small>Average Attendance</small></div>
      </div>
      <div className="grid">
        <Panel title="Performance Overview" desc="Average marks by report" icon="📈">
          <div className="chart">{rs.slice(-6).map(r => <div className="bar-col" key={r.email}><em>{r.marks}%</em><div className="bar" style={{ height: Math.max(8, r.marks) + '%' }}></div><label>{nameOf(r.email)?.split(' ')[0] || 'Student'}</label></div>)}</div>
        </Panel>
        <Panel title="Recent Notices" desc="Visible to students" icon="📢"><Notices list={getNotices()} /></Panel>
      </div>
      <LowAttendance rs={rs} />
      <Panel title="Recent Reports" desc="Connected student records" icon="📄"><ReportTable rs={rs.slice(-6).reverse()} /></Panel>
    </>
  )
}

function Students({ bump }) {
  const [q, setQ] = useState('')
  const list = getUsers().filter(u => u.role === 'student' && (u.name + ' ' + u.id + ' ' + u.email).toLowerCase().includes(q.trim().toLowerCase()))
  const add = () => {
    const name = prompt('Student name:'); if (!name) return
    const email = prompt('Student email:'); if (!email) return
    const password = prompt('Student password:', 'student123'); if (!password) return
    const us = getUsers()
    if (us.some(u => u.email.toLowerCase() === email.toLowerCase())) return toast('Email already exists')
    us.push({ id: 'STU' + String(Date.now()).slice(-5), name, email, password, role: 'student', program: 'B.Tech CSE', year: '2nd Year', section: 'A' })
    saveUsers(us); toast('Student added'); bump()
  }
  const edit = email => {
    const us = getUsers(), u = us.find(x => x.email === email), v = {}
    for (const [l, k] of [['Name', 'name'], ['Phone', 'phone'], ['Program', 'program'], ['Year', 'year'], ['Section', 'section']]) {
      const r = prompt(l + ':', u[k] || ''); if (r === null) return
      v[k] = r.trim() || u[k] || ''
    }
    Object.assign(u, v); saveUsers(us); toast('Student updated'); bump()
  }
  const reset = email => {
    const us = getUsers(), u = us.find(x => x.email === email)
    const p = prompt('New password for ' + u.name + ' (min 6 characters):'); if (p === null) return
    if (p.length < 6) return toast('Password too short')
    u.password = p; saveUsers(us); toast('Password reset')
  }
  const del = email => {
    if (!confirm('Delete this student and their report?')) return
    saveUsers(getUsers().filter(u => u.email !== email)); saveReports(getReports().filter(r => r.email !== email)); toast('Student deleted'); bump()
  }
  const exportCsv = () => download('students.csv', toCSV([['ID', 'Name', 'Email', 'Phone', 'Program', 'Year', 'Section'], ...getUsers().filter(u => u.role === 'student').map(u => [u.id, u.name, u.email, u.phone || '', u.program || '', u.year || '', u.section || ''])]), 'text/csv')
  return (
    <section className="panel">
      <div className="toolbar"><div><h3>Student Accounts</h3><p style={{ color: 'var(--muted)', fontSize: 12 }}>Search, add, edit, reset passwords and export</p></div>
        <div><button className="btn primary" onClick={add}>+ Add Student</button> <button className="btn alt" onClick={exportCsv}>⬇ Export CSV</button></div></div>
      <input className="search" placeholder="Search by name, ID or email..." value={q} onChange={e => setQ(e.target.value)} />
      <div className="table-wrap"><table className="data-table">
        <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Program</th><th>Year</th><th>Action</th></tr></thead>
        <tbody>{list.map(u => <tr key={u.email}><td>{u.id}</td><td>{u.name}</td><td>{u.email}</td><td>{u.program || 'B.Tech CSE'}</td><td>{u.year || '2nd Year'}</td>
          <td><button className="small-btn" onClick={() => edit(u.email)}>Edit</button> <button className="small-btn" onClick={() => reset(u.email)}>Reset Pwd</button> <button className="small-btn red" onClick={() => del(u.email)}>Delete</button></td></tr>)}
          {!list.length && <tr><td colSpan="6">No students found.</td></tr>}</tbody>
      </table></div>
    </section>
  )
}

function Parents({ bump }) {
  const ps = getUsers().filter(u => u.role === 'parent')
  const add = () => {
    const name = prompt('Parent name:'); if (!name) return
    const email = (prompt('Parent email:') || '').trim().toLowerCase(); if (!email) return
    const pw = prompt('Parent password (min 6 characters):'); if (!pw || pw.length < 6) return toast('Password too short')
    const se = (prompt('Linked student email:') || '').trim().toLowerCase(), us = getUsers()
    if (us.some(u => u.email.toLowerCase() === email)) return toast('Email already exists')
    const s = us.find(u => u.role === 'student' && u.email.toLowerCase() === se)
    if (!s) return toast('Student email not found')
    us.push({ id: 'PAR' + String(Date.now()).slice(-5), name, email, password: pw, role: 'parent', studentEmail: s.email })
    saveUsers(us); toast('Parent added'); bump()
  }
  const del = email => { if (!confirm('Delete this parent account?')) return; saveUsers(getUsers().filter(u => u.email !== email)); toast('Parent deleted'); bump() }
  return (
    <section className="panel">
      <div className="toolbar"><div><h3>Parent Accounts</h3><p style={{ color: 'var(--muted)', fontSize: 12 }}>Parents can view their linked student's report and notices</p></div>
        <button className="btn primary" onClick={add}>+ Add Parent</button></div>
      <div className="table-wrap"><table className="data-table">
        <thead><tr><th>Name</th><th>Email</th><th>Linked Student</th><th>Action</th></tr></thead>
        <tbody>{ps.map(p => { const s = getUsers().find(x => x.email === p.studentEmail); return (
          <tr key={p.email}><td>{p.name}</td><td>{p.email}</td><td>{s ? s.name + ' (' + s.email + ')' : <span className="badge warn">Not linked</span>}</td>
            <td><button className="small-btn red" onClick={() => del(p.email)}>Delete</button></td></tr>) })}
          {!ps.length && <tr><td colSpan="4">No parent accounts yet.</td></tr>}</tbody>
      </table></div>
    </section>
  )
}

function Reports({ bump }) {
  const students = getUsers().filter(x => x.role === 'student')
  const [f, setF] = useState({ email: students[0]?.email || '', marks: '', att: '', format: 'percentage', remark: '' })
  const [msg, setMsg] = useState('')
  const set = k => e => setF({ ...f, [k]: e.target.value })
  const submit = e => {
    e.preventDefault()
    if (!f.email) return toast('Add a student first')
    const rs = getReports(), obj = { email: f.email, marks: Number(f.marks), attendance: Number(f.att), format: f.format, remarks: f.remark, updated: today() }
    const i = rs.findIndex(x => x.email === f.email)
    if (i >= 0) rs[i] = obj; else rs.push(obj)
    saveReports(rs); setMsg('Report saved successfully. Student dashboard is updated.'); toast('Report connected to student')
    setF({ ...f, marks: '', att: '', remark: '' }); bump()
  }
  const del = email => { if (!confirm('Delete this report?')) return; saveReports(getReports().filter(r => r.email !== email)); toast('Report deleted'); bump() }
  const exportCsv = () => download('reports.csv', toCSV([['Student', 'Email', 'Marks', 'Attendance', 'Grade', 'Updated', 'Remarks'], ...getReports().map(r => [nameOf(r.email) || '', r.email, r.marks, r.attendance, gradeOf(r.marks), r.updated, r.remarks])]), 'text/csv')
  return (
    <>
      <Panel title="Add / Update Student Report" desc="Save a report against the student's email. It will appear in the student's Results and Reports pages." icon="✏️">
        <form className="form-grid" onSubmit={submit}>
          <div className="form-group"><label>Student</label><select value={f.email} onChange={set('email')}>{students.map(u => <option key={u.email} value={u.email}>{u.name} — {u.email}</option>)}</select></div>
          <div className="form-group"><label>Marks (%)</label><input type="number" min="0" max="100" required value={f.marks} onChange={set('marks')} /></div>
          <div className="form-group"><label>Attendance (%)</label><input type="number" min="0" max="100" required value={f.att} onChange={set('att')} /></div>
          <div className="form-group"><label>Grade Format</label><select value={f.format} onChange={set('format')}><option value="percentage">Percentage</option><option value="10point">10 Point Scale</option></select></div>
          <div className="form-group full"><label>Teacher Remarks</label><textarea rows="3" placeholder="Enter remarks" value={f.remark} onChange={set('remark')} /></div>
          <div className="form-group full"><button className="btn primary" type="submit">Save / Update Report</button></div>
        </form>
        <div className="msg ok">{msg}</div>
      </Panel>
      <Panel title="Saved Reports" desc="All student report records" icon="📋" style={{ marginTop: 18 }}>
        <button className="btn alt no-print" style={{ marginBottom: 10 }} onClick={exportCsv}>⬇ Export CSV</button>
        <ReportTable rs={getReports()} onDelete={del} />
      </Panel>
    </>
  )
}

function NoticesPage({ bump }) {
  const [t, setT] = useState(''), [m, setM] = useState('')
  const publish = e => { e.preventDefault(); const ns = getNotices(); ns.unshift({ title: t, text: m }); saveNotices(ns); setT(''); setM(''); toast('Notice published'); bump() }
  const del = i => { const ns = getNotices(); ns.splice(i, 1); saveNotices(ns); bump() }
  return (
    <Panel title="Manage Notices" desc="Notices are displayed on the student dashboard." icon="📢">
      <form className="form-grid" onSubmit={publish}>
        <div className="form-group"><label>Title</label><input required placeholder="Notice title" value={t} onChange={e => setT(e.target.value)} /></div>
        <div className="form-group"><label>Message</label><input required placeholder="Notice message" value={m} onChange={e => setM(e.target.value)} /></div>
        <div className="form-group full"><button className="btn primary">Publish Notice</button></div>
      </form>
      {getNotices().map((n, i) => <div className="notice" key={i}><b>{n.title}</b><span>{n.text}</span> <button className="small-btn red" style={{ float: 'right' }} onClick={() => del(i)}>Delete</button></div>)}
    </Panel>
  )
}

function Analytics() {
  const rs = getReports(), n = rs.length
  const avg = n ? Math.round(rs.reduce((a, r) => a + Number(r.marks), 0) / n) : 0
  const high = rs.filter(r => r.marks >= 80).length, low = rs.filter(r => r.marks < 60).length
  const g = { 'A+': 0, A: 0, B: 0, C: 0 }; rs.forEach(r => g[gradeOf(r.marks)]++)
  const top = [...rs].sort((a, b) => b.marks - a.marks).slice(0, 3)
  return (
    <>
      <Panel title="Performance Analytics" desc="Summary based on saved student reports" icon="📈">
        <div className="cards">
          <div className="stat"><b>{avg}%</b><small>Average Marks</small></div>
          <div className="stat"><b>{high}</b><small>Students ≥ 80%</small></div>
          <div className="stat"><b>{low}</b><small>Students below 60%</small></div>
          <div className="stat"><b>{n}</b><small>Reports Analysed</small></div>
        </div>
      </Panel>
      <div className="grid" style={{ marginTop: 18 }}>
        <Panel title="Grade Distribution" desc="Number of students per grade" icon="📊">
          <div className="chart">{Object.keys(g).map(k => <div className="bar-col" key={k}><em>{g[k]}</em><div className="bar" style={{ height: Math.max(8, n ? g[k] / n * 100 : 0) + '%' }}></div><label>{k}</label></div>)}</div>
        </Panel>
        <Panel title="Top Performers" desc="Highest marks" icon="🏆">
          {top.length ? top.map((r, i) => <div className="notice" key={r.email}><b>#{i + 1} {nameOf(r.email) || r.email}</b><span>{r.marks}% marks, {r.attendance}% attendance</span></div>) : <p>No reports yet.</p>}
        </Panel>
      </div>
      <Panel title="All Reports" icon="📄" style={{ marginTop: 18 }}><ReportTable rs={rs} /></Panel>
    </>
  )
}

function Settings({ bump }) {
  const a = adminCreds()
  const [f, setF] = useState({ cur: '', mail: a.email, p1: '', p2: '' })
  const [msg, setMsg] = useState({ t: '', ok: false })
  const set = k => e => setF({ ...f, [k]: e.target.value })
  const submit = e => {
    e.preventDefault()
    const cur = adminCreds(), email = f.mail.trim().toLowerCase(), bad = t => setMsg({ t, ok: false })
    if (f.cur !== cur.password) return bad('Current password is incorrect.')
    if (f.p1 && f.p1 !== f.p2) return bad('New passwords do not match.')
    if (getUsers().some(u => u.role !== 'admin' && u.email.toLowerCase() === email)) return bad('That email is already used by another account.')
    localStorage.setItem(KEY_ADMIN, JSON.stringify({ email, password: f.p1 || cur.password }))
    setSession({ email, role: 'admin' }); getUsers()
    setMsg({ t: 'Admin login updated. Use the new details next time you log in.', ok: true }); toast('Admin login updated')
    setF({ ...f, cur: '', p1: '', p2: '' })
  }
  const backup = () => download('sps-backup-' + new Date().toISOString().slice(0, 10) + '.json', JSON.stringify({ users: getUsers().filter(u => u.role !== 'admin'), reports: getReports(), notices: getNotices() }, null, 2), 'application/json')
  const restore = file => {
    if (!file) return
    const r = new FileReader()
    r.onload = () => {
      try {
        const d = JSON.parse(r.result)
        if (!Array.isArray(d.users) || !Array.isArray(d.reports) || !Array.isArray(d.notices)) throw 0
        if (!confirm('Restore this backup? Current students, reports and notices will be replaced.')) return
        saveUsers(d.users.filter(u => u.role !== 'admin')); saveReports(d.reports); saveNotices(d.notices); getUsers(); toast('Backup restored'); bump()
      } catch { toast('Invalid backup file') }
    }
    r.readAsText(file)
  }
  return (
    <>
      <Panel title="Admin Login Settings" desc="Change the admin email and password" icon="🔐">
        <form className="form-grid" onSubmit={submit}>
          <div className="form-group"><label>Current Password</label><input type="password" required value={f.cur} onChange={set('cur')} /></div>
          <div className="form-group"><label>Admin Email</label><input type="email" required value={f.mail} onChange={set('mail')} /></div>
          <div className="form-group"><label>New Password (min 8, leave blank to keep)</label><input type="password" minLength={8} value={f.p1} onChange={set('p1')} /></div>
          <div className="form-group"><label>Confirm New Password</label><input type="password" value={f.p2} onChange={set('p2')} /></div>
          <div className="form-group full"><button className="btn primary" type="submit">Update Admin Login</button></div>
        </form>
        <div className={'msg ' + (msg.ok ? 'ok' : 'error')}>{msg.t}</div>
      </Panel>
      <Panel title="Backup & Restore" desc="Data lives in this browser only. Download a backup to keep or move it." icon="💾" style={{ marginTop: 18 }}>
        <button className="btn primary" onClick={backup}>⬇ Download Backup</button>{' '}
        <label className="btn alt" style={{ display: 'inline-block' }}>⬆ Restore Backup<input type="file" accept=".json" hidden onChange={e => restore(e.target.files[0])} /></label>
      </Panel>
    </>
  )
}

export default function Admin() {
  const [page, setPage] = useState('dashboard')
  const [, bump] = useReducer(x => x + 1, 0)
  getSession()
  const views = { dashboard: <Dashboard />, students: <Students bump={bump} />, parents: <Parents bump={bump} />, reports: <Reports bump={bump} />, notices: <NoticesPage bump={bump} />, analytics: <Analytics />, settings: <Settings bump={bump} /> }
  return (
    <Shell avatar="AD" name="Admin" sub="Administrator" menu={MENU} page={page} setPage={setPage}
      title={TITLES[page]} subtitle="Manage students and academic reports" topName="Administrator">
      {views[page]}
    </Shell>
  )
}
