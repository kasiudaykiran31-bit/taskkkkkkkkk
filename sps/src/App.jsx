import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Student from './pages/Student.jsx'
import Admin from './pages/Admin.jsx'
import Parent from './pages/Parent.jsx'
import { getSession, getUsers } from './store.js'

function Guard({ role, children }) {
  const s = getSession()
  if (!s || s.role !== role || !getUsers().find(u => u.email === s.email)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/student" element={<Guard role="student"><Student /></Guard>} />
      <Route path="/admin" element={<Guard role="admin"><Admin /></Guard>} />
      <Route path="/parent" element={<Guard role="parent"><Parent /></Guard>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
