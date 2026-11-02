import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearSession, toggleDark } from '../store.js'

// Sidebar + topbar layout shared by Student / Admin / Parent
export default function Shell({ brand = 'STUDENT PROGRAM', avatar, name, sub, menu, page, setPage, title, subtitle, topName, bell, children }) {
  const [open, setOpen] = useState(false)
  const nav = useNavigate()
  const logout = () => { clearSession(); nav('/') }
  return (
    <>
      <div className="app">
        <aside className={'sidebar' + (open ? ' open' : '')}>
          <div className="side-brand"><div className="mini-logo">🎓</div><div><b>{brand}</b><small>SYSTEM</small></div></div>
          <div className="profile"><div className="avatar">{avatar}</div><div><b>{name}</b><small>{sub}</small></div></div>
          {menu.map((m, i) => m.section
            ? <div className="menu-label" key={i}>{m.section}</div>
            : <button key={m.key} className={'nav' + (page === m.key ? ' active' : '')} onClick={() => { setPage(m.key); setOpen(false) }}><span>{m.icon}</span>{m.label}</button>)}
          <div className="side-bottom">
            <button className="nav" onClick={toggleDark}><span>🌙</span>Dark Mode</button>
            <button className="nav logout-side" onClick={logout}><span>↪️</span>Logout</button>
          </div>
        </aside>
        <main className="main">
          <header className="topbar">
            <button className="hamb" onClick={() => setOpen(o => !o)}>☰</button>
            <div><h2>{title}</h2><small>{subtitle}</small></div>
            <div className="top-user">{bell && <button className="bell">🔔</button>}<div className="top-avatar">{avatar}</div><b>{topName}</b></div>
          </header>
          <section className="content">{children}</section>
        </main>
      </div>
      <div id="toast"></div>
    </>
  )
}

export const Panel = ({ title, desc, icon, children, style }) => (
  <section className="panel" style={style}>
    <div className="panel-title"><div><h3>{title}</h3>{desc && <p>{desc}</p>}</div>{icon}</div>
    {children}
  </section>
)
export const Notices = ({ list }) => list.map((n, i) => <div className="notice" key={i}><b>{n.title}</b><span>{n.text}</span></div>)
export const Hero = ({ title, text, icon }) => (
  <div className="hero"><div><h1>{title}</h1><p>{text}</p></div><div className="hero-icon">{icon}</div></div>
)
export const ResultBoxes = ({ r }) => (
  <>
    <div className="big-result">
      <div className="result-box"><b>{r.marks}%</b><span>Latest Marks</span></div>
      <div className="result-box"><b>{r.attendance}%</b><span>Attendance</span></div>
      <div className="result-box"><b>{r.marks >= 90 ? 'A+' : r.marks >= 80 ? 'A' : r.marks >= 70 ? 'B' : 'C'}</b><span>Grade</span></div>
    </div>
    <div className="info" style={{ marginTop: 14 }}><small>Teacher Remarks</small><b>{r.remarks}</b></div>
  </>
)
