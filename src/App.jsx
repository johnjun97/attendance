import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login/Login.jsx'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'
import Setup from './pages/Setup/Setup.jsx'
import Attendance from './pages/Attendance/Attendance.jsx'
import Agent from './pages/Agent/Agent.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/setup" element={<ProtectedRoute><Setup /></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
        <Route path="/agent" element={<ProtectedRoute><Agent /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App