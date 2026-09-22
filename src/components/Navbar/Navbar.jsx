import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import './Navbar.css'

function Navbar() {
  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Attendance
      </Link>

      <div className="navbar-links">
        <Link to="/" className="navbar-link">
          Dashboard
        </Link>

        <Link to="/setup" className="navbar-link">
          Setup
        </Link>

        <Link to="/attendance" className="navbar-link">
          Attendance
        </Link>

        <Link to="/agent" className="navbar-link">
          Agent
        </Link>

        <button
          className="navbar-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navbar