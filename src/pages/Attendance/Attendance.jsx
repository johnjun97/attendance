import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './Attendance.css'

function Attendance() {
    const location = useLocation()
    const navigate = useNavigate()

    const sessionName = location.state?.name || 'Training or Meeting Name'

    const [employeeId, setEmployeeId] = useState('')

    function handleSubmit(event) {
        event.preventDefault()

        if (!employeeId.trim()) {
            return
        }

        console.log('Employee ID:', employeeId)

        setEmployeeId('')
    }

    function handleQuit() {
        navigate('/setup')
    }

    return (
        <div className="attendance-page">
            <main className="attendance-content">
                <div className="attendance-card">

                    <h1 className="attendance-session-name">
                        {sessionName}
                    </h1>



                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="employee-id">
                                Employee ID
                            </label>

                            <input
                                id="employee-id"
                                type="text"
                                value={employeeId}
                                onChange={(event) => setEmployeeId(event.target.value)}
                                placeholder="Enter Employee ID"
                                autoFocus
                            />
                        </div>

                        <button type="submit" className="submit-button">
                            Check In
                        </button>
                    </form>

                    <button
                        type="button"
                        className="scan-button"
                    >
                        Scan QR
                    </button>

                    <button
                        type="button"
                        className="quit-button"
                        onClick={handleQuit}
                    >
                        Quit
                    </button>
                </div>
            </main>
        </div>
    )
}

export default Attendance