import Navbar from '../../components/Navbar/Navbar.jsx'
import './Dashboard.css'

function Dashboard() {
  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1>Attendance Dashboard</h1>
          <p>Welcome to the attendance system.</p>
        </header>
      </main>
    </div>
  )
}

export default Dashboard