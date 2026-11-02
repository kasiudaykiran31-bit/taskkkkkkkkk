import { useState, useReducer } from 'react'
import Shell, { Panel, Notices, Hero, ResultBoxes } from '../components/Shell.jsx'
import { getSession, getUsers, saveUsers, getReports, getNotices, gradeOf, initials, toast } from '../store.js'

const MENU = [
  { section: 'MAIN MENU' },
  { key: 'dashboard', icon: '🏠', label: 'Dashboard' },
  { key: 'profile', icon: '👤', label: 'My Profile' },
  { key: 'academics', icon: '📚', label: 'Academics' },
  { key: 'attendance', icon: '🗓️', label: 'Attendance' },
  { key: 'results', icon: '📊', label: 'Results' },
  { section: 'STUDENT SERVICES' },
  { key: 'fees', icon: '💳', label: 'Fee Details' },
  { key: 'timetable', icon: '🕘', label: 'Time Table' },
  { key: 'assignments', icon: '📝', label: 'Assignments' },
  { key: 'notices', icon: '📢', label: 'Notices' },
  { key: 'reports', icon: '📄', label: 'Reports' }
]
const TITLES = { dashboard: 'Student Dashboard', profile: 'My Profile', academics: 'Academics', attendance: 'Attendance', results: 'Results', fees: 'Fee Details', timetable: 'Time Table', assignments: 'Assignments', notices: 'Notices', reports: 'Reports' }
const SUBJECTS = [['CSE401', 'Java Programming', 4, 'Dr. Rao', 91], ['CSE402', 'Data Structures', 4, 'Dr. Kumar', 84], ['CSE403', 'Database Systems', 4, 'Dr. Priya', 87], ['MAT401', 'Engineering Mathematics', 4, 'Dr. Reddy', 74]]

function SubjectTable() {
  return (
    <div className="table-wrap"><table className="data-table">
      <thead><tr><th>Code</th><th>Subject</th><th>Credits</th><th>Faculty</th><th>Attendance</th><th>Status</th></tr></thead>
      <tbody>{SUBJECTS.map(r => <tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td>{r[4]}%</td>
        <td><span className={'badge' + (r[4] < 75 ? ' warn' : '')}>{r[4] < 75 ? 'Improve' : 'Good'}</span></td></tr>)}</tbody>
    </table></div>
  )
}

function Profile({ u, bump }) {
  const [phone, setPhone] = useState(u.phone || '')
  const [pw, setPw] = useState({ cur: '', nw: '', conf: '' })
  const [msg, setMsg] = useState({ t: '', ok: false })
  const savePhone = e => {
    e.preventDefault()
    const us = getUsers(); us.find(a => a.email === u.email).phone = phone.trim(); saveUsers(us); toast('Phone saved'); bump()
  }
  const changePw = e => {
    e.preventDefault()
    const us = getUsers(), x = us.find(a => a.email === u.email), bad = t => setMsg({ t, ok: false })
    if (x.password !== pw.cur) return bad('Current password is incorrect.')
    if (pw.nw.length < 6) return bad('New password must be at least 6 characters.')
    if (pw.nw !== pw.conf) return bad('New passwords do not match.')
    x.password = pw.nw; saveUsers(us); setMsg({ t: 'Password changed successfully.', ok: true }); toast('Password changed'); setPw({ cur: '', nw: '', conf: '' })
  }
  const info = [['Student ID', u.id], ['Full Name', u.name], ['Email', u.email], ['Phone', u.phone || 'Not added'], ['Program', u.program || 'B.Tech CSE'], ['Year', u.year || '2nd Year'], ['Section', u.section || 'A'], ['Status', 'Active']]
  return (
    <>
      <Panel title="My Profile" desc="Student account information" icon="👤">
        <div className="profile-grid">{info.map(x => <div className="info" key={x[0]}><small>{x[0]}</small><b>{x[1]}</b></div>)}</div>
      </Panel>
      <div className="grid" style={{ marginTop: 18 }}>
        <Panel title="Update Phone" desc="Keep your contact number current" icon="📞">
          <form className="form-grid" onSubmit={savePhone}>
            <div className="form-group full"><label>Phone</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} /></div>
            <div className="form-group full"><button className="btn primary" type="submit">Save Phone</button></div>
          </form>
        </Panel>
        <Panel title="Change Password" desc="Use at least 6 characters" icon="🔐">
          <form className="form-grid" onSubmit={changePw}>
            <div className="form-group full"><label>Current Password</label><input type="password" required value={pw.cur} onChange={e => setPw({ ...pw, cur: e.target.value })} /></div>
            <div className="form-group"><label>New Password</label><input type="password" minLength={6} required value={pw.nw} onChange={e => setPw({ ...pw, nw: e.target.value })} /></div>
            <div className="form-group"><label>Confirm</label><input type="password" required value={pw.conf} onChange={e => setPw({ ...pw, conf: e.target.value })} /></div>
            <div className="form-group full"><button className="btn primary" type="submit">Change Password</button></div>
          </form>
          <div className={'msg ' + (msg.ok ? 'ok' : 'error')}>{msg.t}</div>
        </Panel>
      </div>
    </>
  )
}

export default function Student() {
  const [page, setPage] = useState('dashboard')
  const [, bump] = useReducer(x => x + 1, 0)
  const s = getSession()
  const u = getUsers().find(x => x.email === s.email)
  const reports = getReports(), mine = reports.filter(x => x.email === u.email)
  const r = mine[0] || { marks: 0, attendance: 0, remarks: 'No report yet.' }
  const notices = getNotices()

  let view
  if (page === 'dashboard') view = (
    <>
      <Hero title="Student Dashboard" text="Track your academic progress, attendance and latest college updates." icon="🎓" />
      <div className="cards">
        <div className="stat"><span className="ico">📚</span><b>{r.marks ? (r.marks / 10).toFixed(2) : '-'}</b><small>Current CGPA</small></div>
        <div className="stat"><span className="ico">🎯</span><b>{r.marks}%</b><small>Latest Marks</small></div>
        <div className="stat"><span className="ico">🗓️</span><b>{r.attendance}%</b><small>Attendance</small></div>
        <div className="stat"><span className="ico">📄</span><b>{mine.length}</b><small>Reports</small></div>
      </div>
      <div className="grid">
        <Panel title="Semester Performance" desc="Your academic performance trend" icon="📈">
          <div className="chart">{[78, 81, 84, 86].map((v, i) => <div className="bar-col" key={i}><em>{v / 10}</em><div className="bar" style={{ height: v + '%' }}></div><label>{['Sem I', 'Sem II', 'Sem III', 'Current'][i]}</label></div>)}</div>
        </Panel>
        <Panel title="Latest Notices" desc="Important announcements" icon="📢"><Notices list={notices} /></Panel>
      </div>
      <Panel title="Current Semester Subjects" desc="Attendance and status" icon="📚"><SubjectTable /></Panel>
    </>
  )
  else if (page === 'profile') view = <Profile u={u} bump={bump} />
  else if (page === 'academics') view = (
    <Panel title="Current Semester Subjects" desc="Academic course details" icon="📚">
      <div className="subject-grid">{[['Java Programming', 'CSE401', 91], ['Data Structures', 'CSE402', 84], ['Database Systems', 'CSE403', 87], ['Engineering Mathematics', 'MAT401', 74], ['Operating Systems', 'CSE404', 89], ['Computer Networks', 'CSE405', 82]].map(x =>
        <div className="subject" key={x[1]}><b>{x[0]}</b><small>{x[1]} • 4 Credits</small><div className="progress"><i style={{ width: x[2] + '%' }}></i></div><small>{x[2]}% attendance</small></div>)}</div>
    </Panel>
  )
  else if (page === 'attendance') view = <Panel title="Attendance" desc="Subject-wise attendance" icon="🗓️"><SubjectTable /></Panel>
  else if (page === 'results') view = (
    <Panel title="Results" desc="Latest academic report from admin" icon="📊">
      <ResultBoxes r={r} />
      <button className="btn primary no-print" style={{ marginTop: 14 }} onClick={() => window.print()}>🖨️ Print / Save as PDF</button>
    </Panel>
  )
  else if (page === 'fees') view = (
    <Panel title="Fee Details" desc="Semester fee information" icon="💳">
      <div className="big-result">
        <div className="result-box"><b>₹85,000</b><span>Total Fee</span></div>
        <div className="result-box"><b>₹70,000</b><span>Paid</span></div>
        <div className="result-box"><b>₹15,000</b><span>Pending</span></div>
      </div>
    </Panel>
  )
  else if (page === 'timetable') view = (
    <Panel title="Today's Time Table" desc="Monday • Current Semester" icon="🕘">
      <table className="data-table"><thead><tr><th>Time</th><th>Subject</th><th>Faculty</th><th>Room</th></tr></thead>
        <tbody>{[['09:00', 'Java Programming', 'Dr. Rao'], ['10:00', 'Data Structures', 'Dr. Kumar'], ['11:00', 'Database Systems', 'Dr. Priya'], ['02:00', 'Mathematics', 'Dr. Reddy'], ['03:00', 'Computer Networks', 'Dr. Singh']].map((x, i) =>
          <tr key={i}><td>{x[0]}</td><td>{x[1]}</td><td>{x[2]}</td><td>CSE-{i + 1}</td></tr>)}</tbody></table>
    </Panel>
  )
  else if (page === 'assignments') view = (
    <Panel title="Assignments" desc="Current semester submissions" icon="📝">
      <table className="data-table"><thead><tr><th>Assignment</th><th>Subject</th><th>Due Date</th><th>Status</th></tr></thead>
        <tbody>{[['Java OOP Program', 'Java', '28 Sep 2026', 0], ['Binary Search Tree', 'Data Structures', '30 Sep 2026', 1], ['SQL Queries', 'Database', '02 Oct 2026', 1]].map(x =>
          <tr key={x[0]}><td>{x[0]}</td><td>{x[1]}</td><td>{x[2]}</td><td><span className={'badge' + (x[3] ? ' warn' : '')}>{x[3] ? 'Pending' : 'Submitted'}</span></td></tr>)}</tbody></table>
    </Panel>
  )
  else if (page === 'notices') view = <Panel title="Latest Notices" desc="College announcements" icon="📢"><Notices list={notices} /></Panel>
  else view = (
    <Panel title="My Reports" desc="Reports uploaded by the administrator" icon="📄">
      <table className="data-table"><thead><tr><th>Date</th><th>Marks</th><th>Attendance</th><th>Grade</th><th>Remarks</th></tr></thead>
        <tbody>{mine.map((x, i) => <tr key={i}><td>{x.updated}</td><td>{x.marks}%</td><td>{x.attendance}%</td><td><span className="badge">{gradeOf(x.marks)}</span></td><td>{x.remarks}</td></tr>)}
          {!mine.length && <tr><td colSpan="5">No reports available.</td></tr>}</tbody></table>
    </Panel>
  )

  return (
    <Shell avatar={initials(u.name)} name={u.name} sub={u.id} menu={MENU} page={page} setPage={setPage}
      title={TITLES[page]} subtitle="Welcome to Student Program System" topName={u.name} bell>
      {view}
    </Shell>
  )
}
