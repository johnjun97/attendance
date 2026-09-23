import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar.jsx'
import './Setup.css'

function Setup() {
  const [name, setName] = useState('')
  const navigate = useNavigate()

  function handleStart(event) {
    event.preventDefault()

    if (!name.trim()) {
      return
    }

    // Temporary: navigate to Attendance page
navigate('/attendance', { state: { name } })
  }

  return (
    <div className="setup-page">
      <Navbar />

      <main className="setup-content">
        <div className="setup-card">
          <h1>Attendance Setup</h1>

          <form onSubmit={handleStart}>
            <div className="form-group">
              <label htmlFor="attendance-name">
                Training or Meeting Name
              </label>

              <input
                id="attendance-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter training or meeting name"
                required
              />
            </div>

            <button type="submit">
              Start
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default Setup