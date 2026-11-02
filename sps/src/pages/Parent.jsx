import { useState } from 'react'
import Shell, { Panel, Notices, Hero, ResultBoxes } from '../components/Shell.jsx'
import { getSession, getUsers, getReports, getNotices, initials } from '../store.js'

const MENU = [
  { section: 'PARENT MENU' },
  { key: 'home', icon: '🏠', label: 'Dashboard' },
  { key: 'report', icon: '📊', label: 'Student Report' },
  { key: 'notices', icon: '📢', label: 'Notices' }
]

export default function Parent() {
  const [page, setPage] = useState('home')
  const u = getUsers().find(x => x.email === getSession().email)
  const student = getUsers().find(x => x.email === u.studentEmail)
  const r = getReports().find(x => x.email === u.studentEmail)

  const view = page === 'notices'
    ? <Panel title="Latest Notices" desc="College announcements" icon="📢"><Notices list={getNotices()} /></Panel>
    : (
      <>
        <Hero title={'Welcome, ' + u.name} text="View your linked student's latest academic performance." icon="👨‍👩‍👧" />
        <Panel title="Linked Student" desc="Student connected to this parent account" icon="🎓">
          {student
            ? <div className="profile-grid">
                <div className="info"><small>Name</small><b>{student.name}</b></div>
                <div className="info"><small>Student ID</small><b>{student.id}</b></div>
                <div className="info"><small>Program</small><b>{student.program || 'B.Tech CSE'}</b></div>
                <div className="info"><small>Section</small><b>{student.section || 'A'}</b></div>
              </div>
            : <p>No student is linked yet. Ask the administrator to connect a student email.</p>}
        </Panel>
        {r && <Panel title="Latest Report" desc="Latest information entered by Admin" icon="📊" style={{ marginTop: 18 }}><ResultBoxes r={r} /></Panel>}
      </>
    )

  return (
    <Shell avatar={initials(u.name)} name={u.name} sub="Parent Account" menu={MENU} page={page} setPage={setPage}
      title="Parent Dashboard" subtitle="Monitor student academic progress" topName={u.name}>
      {view}
    </Shell>
  )
}
