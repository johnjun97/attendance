import Navbar from '../../components/Navbar/Navbar.jsx'
import Card from './Card/Card.jsx'
import './Dashboard.css'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

function Dashboard() {

  const [totalAgents, setTotalAgents] = useState(0)
  const [totalLogs, setTotalLogs] = useState(0)
  const [totalTrainings, setTotalTrainings] = useState(0)

  useEffect(() => {
    async function loadTotalAgents() {
      const { count, error } = await supabase
        .from('attendance_agents')
        .select('*', { count: 'exact', head: true })

      if (!error) {
        setTotalAgents(count || 0)
      }
    }

    async function loadTotalLogs() {
      const { count, error } = await supabase
        .from('attendance_records')
        .select('*', { count: 'exact', head: true })

      if (!error) {
        setTotalLogs(count || 0)
      }
    }

    async function loadTotalTrainings() {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('session_name, check_in_at')

      if (!error) {
        const uniqueTrainings = new Set()

        data.forEach((record) => {
          const date = new Date(record.check_in_at)
            .toLocaleDateString('en-CA', {
              timeZone: 'Asia/Kuala_Lumpur'
            })

          const key = `${record.session_name}_${date}`

          uniqueTrainings.add(key)
        })

        setTotalTrainings(uniqueTrainings.size)
      }
    }

    loadTotalAgents()
    loadTotalLogs()
    loadTotalTrainings()
  }, [])

  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1>Attendance Dashboard</h1>
          <p>Welcome to the attendance system.</p>
        </header>

        <section className="dashboard-stats">
          <Card>
            <div className="dashboard-stat-title">Total Agent</div>
            <div className="dashboard-stat-value">{totalAgents}</div>
          </Card>

          <Card>
            <div className="dashboard-stat-title">Total Training</div>
            <div className="dashboard-stat-value">{totalTrainings}</div>
          </Card>

          <Card>
            <div className="dashboard-stat-title">Total Log</div>
            <div className="dashboard-stat-value">{totalLogs}</div>
          </Card>
        </section>
      </main>
    </div>
  )
}

export default Dashboard