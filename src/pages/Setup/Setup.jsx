import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Navbar from '../../components/Navbar/Navbar.jsx'
import './Setup.css'

function Setup() {
  const [name, setName] = useState('')
  const [trainingNames, setTrainingNames] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const trainingNameRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        trainingNameRef.current &&
        !trainingNameRef.current.contains(event.target)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      )
    }
  }, [])

  useEffect(() => {
    loadTrainingNames()
  }, [])

  async function loadTrainingNames() {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('session_name')
      .not('session_name', 'is', null)

    if (error) {
      console.error(error)
      return
    }

    const uniqueNames = [
      ...new Set(
        data
          .map((record) => record.session_name?.trim())
          .filter(Boolean)
      ),
    ].sort((a, b) =>
      a.localeCompare(b, undefined, {
        sensitivity: 'base',
      })
    )

    setTrainingNames(uniqueNames)
  }

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
          <h1>Attendance Session Setup</h1>

          <form onSubmit={handleStart}>
            <div className="form-group">
              <label htmlFor="attendance-name">
                Session Name
              </label>

              <div
                className="training-name-input-wrapper"
                ref={trainingNameRef}
              >
                <input
                  id="attendance-name"
                  type="text"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value)
                    setShowSuggestions(true)
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Enter session name"
                  required
                  autoComplete="off"
                />

                {showSuggestions && trainingNames.length > 0 && (
                  <div className="training-name-suggestions">
                    {trainingNames
                      .filter((trainingName) =>
                        trainingName
                          .toLowerCase()
                          .includes(name.toLowerCase())
                      )
                      .map((trainingName) => (
                        <button
                          key={trainingName}
                          type="button"
                          onMouseDown={() => {
                            setName(trainingName)
                            setShowSuggestions(false)
                          }}
                        >
                          {trainingName}
                        </button>
                      ))}
                  </div>
                )}
              </div>
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