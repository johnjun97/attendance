import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import './Attendance.css'
import Loading from '../../components/Loading/Loading'

function Attendance() {
    const location = useLocation()
    const navigate = useNavigate()

    const sessionName =
        location.state?.name || 'Training or Meeting Name'

    const [cardNo, setCardNo] = useState('')
    const [checkedInAgent, setCheckedInAgent] = useState(null)
    const [checkInTime, setCheckInTime] = useState(null)
    const [error, setError] = useState('')
    const [checkingIn, setCheckingIn] = useState(false)
    const [loggingOut, setLoggingOut] = useState(false)

    const cardNoInputRef = useRef(null)
    const resultTimerRef = useRef(null)
    const errorTimerRef = useRef(null)

    useEffect(() => {
        cardNoInputRef.current?.focus()

        return () => {
            clearTimeout(resultTimerRef.current)
            clearTimeout(errorTimerRef.current)
        }
    }, [])

    function focusCardNo() {
        setTimeout(() => {
            cardNoInputRef.current?.focus()
        }, 0)
    }

    function showError(message) {
        clearTimeout(errorTimerRef.current)
        clearTimeout(resultTimerRef.current)

        setCheckedInAgent(null)
        setCheckInTime(null)

        setError(message)

        errorTimerRef.current = setTimeout(() => {
            setError('')
            focusCardNo()
        }, 5000)
    }

    function normalizeCardNo(value) {
        const normalized = String(value).trim().replace(/^0+/, '')

        return normalized || '0'
    }

    async function handleSubmit(event) {
        event.preventDefault()

        const enteredCardNo = cardNo.trim()

        if (!enteredCardNo || checkingIn) {
            focusCardNo()
            return
        }

        setCheckingIn(true)
        setError('')

        const normalizedCardNo = normalizeCardNo(enteredCardNo)

        const { data: agents, error: agentError } = await supabase
            .from('attendance_agents')
            .select(
                'id, full_name, card_no, agency, ranking, status'
            )

        const agent = agents?.find(
            (item) => normalizeCardNo(item.card_no) === normalizedCardNo
        )

        if (agentError) {
            console.error(agentError)
            showError('Unable to check Card No.')
            setCheckingIn(false)
            focusCardNo()
            return
        }

        if (!agent) {
            showError('Agent not found.')
            setCardNo('')
            setCheckingIn(false)
            focusCardNo()
            return
        }

        if (agent.status !== 'active') {
            showError('This agent is disabled.')
            setCardNo('')
            setCheckingIn(false)
            focusCardNo()
            return
        }

        const { data: record, error: recordError } =
            await supabase
                .from('attendance_records')
                .insert({
                    agent_id: agent.id,
                    card_no: agent.card_no,
                    session_name: sessionName,
                })
                .select('check_in_at')
                .single()

        if (recordError) {
            console.error(recordError)
            showError('Unable to record check-in.')
            setCheckingIn(false)
            focusCardNo()
            return
        }

        clearTimeout(errorTimerRef.current)
        clearTimeout(resultTimerRef.current)

        setCheckedInAgent(agent)
        setCheckInTime(record.check_in_at)
        setCardNo('')
        setCheckingIn(false)
        setError('')

        resultTimerRef.current = setTimeout(() => {
            setCheckedInAgent(null)
            setCheckInTime(null)
            focusCardNo()
        }, 5000)

        focusCardNo()
    }

    async function handleQuit() {
        if (loggingOut) {
            return
        }

        setLoggingOut(true)


        const { error } = await supabase.auth.signOut()

        if (error) {
            console.error('Logout error:', error)
            setLoggingOut(false)
            return
        }

        navigate('/login')
    }

    function handlePageClick(event) {
        if (event.target.closest('button')) {
            return
        }

        focusCardNo()
    }

    function formatCheckInTime(value) {
        if (!value) {
            return ''
        }

        return new Date(value).toLocaleString('en-MY', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        })
    }

    if (loggingOut) {
        return <Loading />
    }

    return (
        <div
            className="attendance-page"
            onClick={handlePageClick}
        >

            <button
                type="button"
                className="quit-button"
                onClick={handleQuit}
                aria-label="Quit"
                title="Quit"
            >
                ×
            </button>

            <main className="attendance-content">
                <h1 className="attendance-session-name">
                    {sessionName}
                </h1>

                <p className="attendance-instruction">
                    Scan or enter your Card to check in
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            ref={cardNoInputRef}
                            id="card-no"
                            type="text"
                            value={cardNo}
                            onChange={(event) => {
                                const value = event.target.value
                                    .trim()
                                    .replace(/^0+/, '')

                                setCardNo(value)
                            }}
                            placeholder="Enter Card No"
                            autoFocus
                            disabled={checkingIn}
                        />
                    </div>

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={checkingIn}
                    >
                        {checkingIn
                            ? 'Checking In...'
                            : 'Check In'}
                    </button>
                </form>

                <button
                    type="button"
                    className="scan-button"
                >
                    Scan QR
                </button>

                {error && (
                    <div className="attendance-error">
                        {error}
                    </div>
                )}

                {checkedInAgent && (
                    <div className="check-in-result">
                        <p>
                            <strong>Full Name</strong>
                            <span>
                                {checkedInAgent.full_name}
                            </span>
                        </p>

                        <p>
                            <strong>Card No</strong>
                            <span>
                                {checkedInAgent.card_no}
                            </span>
                        </p>

                        <p>
                            <strong>Agency</strong>
                            <span>
                                {checkedInAgent.agency || '-'}
                            </span>
                        </p>

                        <p>
                            <strong>Ranking</strong>
                            <span>
                                {checkedInAgent.ranking || '-'}
                            </span>
                        </p>

                        <p className="check-in-time">
                            <strong>Check In</strong>
                            <span>
                                {formatCheckInTime(checkInTime)}
                            </span>
                        </p>
                    </div>
                )}
            </main>
        </div>
    )
}

export default Attendance