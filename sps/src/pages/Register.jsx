import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getUsers, saveUsers } from '../store.js'

export default function Register() {
  const nav = useNavigate()
  const [f, setF] = useState({ type: 'student', name: '', id: '', email: '', phone: '', program: 'B.Tech CSE', year: '2nd Year', section: 'A', studentEmail: '', password: '', confirm: '' })
  const [msg, setMsg] = useState({ t: '', ok: false })
  const set = k => e => setF({ ...f, [k]: e.target.value })
  const parent = f.type === 'parent'
  const bad = t => setMsg({ t, ok: false })

  const submit = e => {
    e.preventDefault()
    const email = f.email.trim().toLowerCase(), users = getUsers()
    if (f.password !== f.confirm) return bad('Passwords do not match.')
    if (users.some(u => u.email.toLowerCase() === email)) return bad('Email already registered. Please login.')
    if (parent) {
      const se = f.studentEmail.trim().toLowerCase()
      const s = users.find(u => u.role === 'student' && u.email.toLowerCase() === se)
      if (!s) return bad('No student account found with that email. Ask the student to register first.')
      users.push({ id: 'PAR' + String(Date.now()).slice(-5), name: f.name.trim(), email, phone: f.phone.trim(), password: f.password, role: 'parent', studentEmail: s.email })
    } else {
      const id = f.id.trim()
      if (users.some(u => (u.id || '').toLowerCase() === id.toLowerCase())) return bad('Student ID already exists.')
      users.push({ id: id || 'STU' + String(Date.now()).slice(-5), name: f.name.trim(), email, password: f.password, role: 'student', phone: f.phone.trim(), program: f.program, year: f.year, section: f.section })
    }
    saveUsers(users)
    setMsg({ t: 'Account created successfully. Redirecting to login...', ok: true })
    setTimeout(() => nav('/'), 900)
  }

  return (
    <div className="login-body">
      <div className="login-bg"><span></span><span></span><span></span></div>
      <div className="login-card register-card">
        <div className="logo-box">📝</div>
        <h1>Create Account</h1>
        <p className="sub">Register as a Student, or as a Parent linked to a registered student.</p>
        <form onSubmit={submit}>
          <label>Account Type</label>
          <select value={f.type} onChange={set('type')}><option value="student">Student</option><option value="parent">Parent</option></select>
          <label>Full Name</label>
          <input required placeholder="Enter full name" value={f.name} onChange={set('name')} />
          {!parent && <><label>Student ID</label><input required placeholder="Example: 2500031331" value={f.id} onChange={set('id')} /></>}
          <label>Email</label>
          <input type="email" required placeholder="Enter email" value={f.email} onChange={set('email')} />
          <label>Phone</label>
          <input type="tel" placeholder="Enter phone number" value={f.phone} onChange={set('phone')} />
          {!parent && <>
            <label>Program</label>
            <select value={f.program} onChange={set('program')}>
              {['B.Tech CSE', 'B.Tech ECE', 'B.Tech EEE', 'B.Tech AI & ML', 'BCA'].map(p => <option key={p}>{p}</option>)}
            </select>
            <div className="form-grid">
              <div className="form-group"><label>Year</label>
                <select value={f.year} onChange={set('year')}>{['1st Year', '2nd Year', '3rd Year', '4th Year'].map(y => <option key={y}>{y}</option>)}</select></div>
              <div className="form-group"><label>Section</label>
                <select value={f.section} onChange={set('section')}>{['A', 'B', 'C', 'D'].map(s => <option key={s}>{s}</option>)}</select></div>
            </div>
          </>}
          {parent && <><label>Linked Student Email</label><input type="email" required placeholder="Email of the registered student" value={f.studentEmail} onChange={set('studentEmail')} /></>}
          <label>Password</label>
          <input type="password" minLength={6} required placeholder="Minimum 6 characters" value={f.password} onChange={set('password')} />
          <label>Confirm Password</label>
          <input type="password" minLength={6} required placeholder="Re-enter password" value={f.confirm} onChange={set('confirm')} />
          <button className="btn primary full" type="submit">Create Account</button>
        </form>
        <div className={'msg ' + (msg.ok ? 'ok' : 'error')}>{msg.t}</div>
        <p className="register-link"><Link to="/">← Back to Login</Link></p>
      </div>
    </div>
  )
}
