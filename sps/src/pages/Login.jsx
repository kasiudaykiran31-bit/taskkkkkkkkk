import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getUsers, setSession, getLock, setLock, clearLock } from '../store.js'

export default function Login() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [show, setShow] = useState(false)
  const [msg, setMsg] = useState({ t: '', ok: false })

  const submit = e => {
    e.preventDefault()
    const L = getLock()
    if (L.until && Date.now() < L.until) return setMsg({ t: 'Too many failed attempts. Try again in ' + Math.ceil((L.until - Date.now()) / 1000) + ' seconds.' })
    const u = getUsers().find(x => x.email.toLowerCase() === email.trim().toLowerCase() && x.password === pw)
    if (!u) {
      const n = (L.n || 0) + 1
      setLock(n >= 5 ? { n: 0, until: Date.now() + 30000 } : { n })
      return setMsg({ t: 'Invalid email or password.' + (n >= 5 ? ' Too many attempts - locked for 30 seconds.' : '') })
    }
    clearLock()
    setSession({ email: u.email, role: u.role })
    nav('/' + u.role)
  }

  return (
    <div className="login-body">
      <div className="login-bg"><span></span><span></span><span></span></div>
      <div className="login-card">
        <div className="logo-box">🎓</div>
        <h1>Student Program System</h1>
        <p className="sub">Student Information &amp; Academic Management</p>
        <form onSubmit={submit}>
          <label>Email</label>
          <input type="email" placeholder="Enter email" required value={email} onChange={e => setEmail(e.target.value)} />
          <label>Password</label>
          <input type={show ? 'text' : 'password'} placeholder="Enter password" required value={pw} onChange={e => setPw(e.target.value)} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, margin: '-4px 0 12px', cursor: 'pointer' }}>
            <input type="checkbox" style={{ width: 'auto' }} checked={show} onChange={e => setShow(e.target.checked)} /> Show password
          </label>
          <button className="btn primary full" type="submit">Login <span>→</span></button>
        </form>
        <div className={'msg ' + (msg.ok ? 'ok' : 'error')}>{msg.t}</div>
        <p className="register-link">New here? <Link to="/register">Create a student or parent account</Link></p>
      </div>
    </div>
  )
}
