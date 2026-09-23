import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar/Navbar'
import Loading from '../../components/Loading/Loading'
import { supabase } from '../../lib/supabase'
import './AttendanceRecords.css'

function AttendanceRecords() {
    const [records, setRecords] = useState([])
    const [loading, setLoading] = useState(true)
    const [clearing, setClearing] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        loadRecords()
    }, [])

    async function loadRecords() {
        setLoading(true)
        setError('')

        const { data, error } = await supabase
            .from('attendance_records')
            .select(`
                id,
                session_name,
                card_no,
                check_in_at,
                attendance_agents (
                    full_name,
                    agency,
                    ranking
                )
            `)
            .order('check_in_at', {
                ascending: false,
            })

        if (error) {
            console.error(error)
            setError('Unable to load attendance records.')
            setLoading(false)
            return
        }

        setRecords(data || [])
        setLoading(false)
    }

    function handleExport() {
        if (records.length === 0) {
            return
        }

        const headers = [
            'Session',
            'Full Name',
            'Card No',
            'Check In',
        ]

        const rows = records.map((record) => [
            record.session_name || '',
            record.attendance_agents?.full_name || '',
            record.card_no || '',
            formatCheckInTime(record.check_in_at),
        ])

        const csv = [
            headers,
            ...rows,
        ]
            .map((row) =>
                row
                    .map((value) => `"${String(value).replace(/"/g, '""')}"`)
                    .join(',')
            )
            .join('\n')

        const blob = new Blob([csv], {
            type: 'text/csv;charset=utf-8;',
        })

        const link = document.createElement('a')

        link.href = URL.createObjectURL(blob)
        link.download = 'attendance-records.csv'
        link.click()

        URL.revokeObjectURL(link.href)
    }

    async function handleClearAll() {
        if (records.length === 0 || clearing) {
            return
        }

        const confirmed = window.confirm(
            'Are you sure you want to delete all attendance records?'
        )

        if (!confirmed) {
            return
        }

        setClearing(true)
        setError('')

        const { error } = await supabase
            .from('attendance_records')
            .delete()
            .not('id', 'is', null)

        if (error) {
            console.error(error)
            setError('Unable to clear attendance records.')
            setClearing(false)
            return
        }

        setRecords([])
        setClearing(false)
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

    if (clearing) {
        return <Loading />
    }

    return (
        <div className="attendance-records-page">
            <Navbar />

            <main className="attendance-records-content">
                <div className="attendance-records-title">
                    <h1>Attendance Records</h1>
                    <p>
                        View and manage attendance check-in records.
                    </p>
                </div>

                <div className="attendance-records-actions">
                    <button
                        type="button"
                        className="export-records-button"
                        onClick={handleExport}
                        disabled={records.length === 0}
                    >
                        Export
                    </button>

                    <button
                        type="button"
                        className="clear-records-button"
                        onClick={handleClearAll}
                        disabled={records.length === 0}
                    >
                        Clear All Records
                    </button>
                </div>

                {loading && <Loading />}

                {!loading && error && (
                    <div className="attendance-records-error">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <div className="attendance-records-table-wrapper">
                        <table className="attendance-records-table">
                            <thead>
                                <tr>
                                    <th>Session</th>
                                    <th>Attendance (Full Name)</th>
                                    <th>Card No</th>
                                    <th>Check In</th>
                                </tr>
                            </thead>

                            <tbody>
                                {records.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="no-records"
                                        >
                                            No attendance records found.
                                        </td>
                                    </tr>
                                ) : (
                                    records.map((record) => (
                                        <tr key={record.id}>
                                            <td>
                                                {record.session_name || '-'}
                                            </td>

                                            <td>
                                                {record.attendance_agents?.full_name || '-'}
                                            </td>

                                            <td>
                                                {record.card_no}
                                            </td>

                                            <td>
                                                {formatCheckInTime(
                                                    record.check_in_at
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                    </div>
                )}
            </main>
        </div>
    )
}

export default AttendanceRecords