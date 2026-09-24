import { useEffect, useMemo, useState } from 'react'
import Navbar from '../../components/Navbar/Navbar'
import Loading from '../../components/Loading/Loading'
import { supabase } from '../../lib/supabase'
import './AttendanceRecords.css'

function AttendanceRecords() {
    const [records, setRecords] = useState([])
    const [loading, setLoading] = useState(true)
    const [clearing, setClearing] = useState(false)
    const [error, setError] = useState('')

    const [selectedRecords, setSelectedRecords] = useState([])

    const [selectedTraining, setSelectedTraining] = useState('')
    const [hideDuplicateLogs, setHideDuplicateLogs] = useState(true)
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: null,
    })

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

    function getTrainingKey(record) {
        if (!record.check_in_at || !record.session_name) {
            return null
        }

        const date = new Date(record.check_in_at)
            .toLocaleDateString('en-CA', {
                timeZone: 'Asia/Kuala_Lumpur',
            })

        return `${date}|${record.session_name}`
    }

    const trainingOptions = useMemo(() => {
        const trainingMap = new Map()

        records.forEach((record) => {
            const key = getTrainingKey(record)

            if (!key || trainingMap.has(key)) {
                return
            }

            const [date, sessionName] = key.split('|')

            trainingMap.set(key, {
                key,
                date,
                sessionName,
            })
        })

        return Array.from(trainingMap.values()).sort((a, b) =>
            b.key.localeCompare(a.key)
        )
    }, [records])

    useEffect(() => {
        if (
            trainingOptions.length > 0 &&
            !selectedTraining
        ) {
            setSelectedTraining(trainingOptions[0].key)
        }
    }, [trainingOptions, selectedTraining])

    function handleSort(key) {
        setSortConfig((current) => {
            if (current.key !== key) {
                return {
                    key,
                    direction: 'asc',
                }
            }

            if (current.direction === 'asc') {
                return {
                    key,
                    direction: 'desc',
                }
            }

            return {
                key: null,
                direction: null,
            }
        })
    }

    function getSortIndicator(key) {
        if (sortConfig.key !== key) {
            return ''
        }

        return sortConfig.direction === 'asc'
            ? ' ↑'
            : ' ↓'
    }

    function handleSelectRecord(id) {
        setSelectedRecords((current) => {
            if (current.includes(id)) {
                return current.filter((recordId) => recordId !== id)
            }

            return [...current, id]
        })
    }

    function handleSelectAll() {
        if (selectedRecords.length === filteredRecords.length) {
            setSelectedRecords([])
            return
        }

        setSelectedRecords(
            filteredRecords.map((record) => record.id)
        )
    }

    const filteredRecords = useMemo(() => {
        let result = records

        if (selectedTraining) {
            result = result.filter(
                (record) => getTrainingKey(record) === selectedTraining
            )
        }

        if (hideDuplicateLogs) {
            const uniqueRecords = new Map()

            result.forEach((record) => {
                const fullName =
                    record.attendance_agents?.full_name || ''

                const trainingKey = getTrainingKey(record)

                if (!fullName || !trainingKey || !record.check_in_at) {
                    return
                }

                const duplicateKey = `${fullName}|${trainingKey}`

                const existingRecord = uniqueRecords.get(duplicateKey)

                if (
                    !existingRecord ||
                    new Date(record.check_in_at) <
                    new Date(existingRecord.check_in_at)
                ) {
                    uniqueRecords.set(duplicateKey, record)
                }
            })

            result = Array.from(uniqueRecords.values())
        }

        if (!sortConfig.key || !sortConfig.direction) {
            return result
        }

        return [...result].sort((a, b) => {
            let valueA
            let valueB

            switch (sortConfig.key) {
                case 'session':
                    valueA = a.session_name || ''
                    valueB = b.session_name || ''
                    break

                case 'name':
                    valueA = a.attendance_agents?.full_name || ''
                    valueB = b.attendance_agents?.full_name || ''
                    break

                case 'card':
                    valueA = a.card_no || ''
                    valueB = b.card_no || ''
                    break

                case 'checkIn':
                    valueA = new Date(a.check_in_at).getTime()
                    valueB = new Date(b.check_in_at).getTime()
                    break

                default:
                    return 0
            }

            if (typeof valueA === 'string') {
                const comparison = valueA.localeCompare(
                    valueB,
                    undefined,
                    {
                        numeric: true,
                        sensitivity: 'base',
                    }
                )

                return sortConfig.direction === 'asc'
                    ? comparison
                    : -comparison
            }

            return sortConfig.direction === 'asc'
                ? valueA - valueB
                : valueB - valueA
        })
    }, [
        records,
        selectedTraining,
        hideDuplicateLogs,
        sortConfig,
    ])

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
                    <div className="attendance-records-actions-left">
                        <select
                            id="training-select"
                            className="training-select"
                            value={selectedTraining}
                            onChange={(event) =>
                                setSelectedTraining(event.target.value)
                            }
                        >
                            {trainingOptions.map((training) => (
                                <option
                                    key={training.key}
                                    value={training.key}
                                >
                                    {`[${new Date(
                                        `${training.date}T00:00:00`
                                    ).toLocaleDateString('en-GB')}] ${training.sessionName}`}
                                </option>
                            ))}
                        </select>

                        <button
                            type="button"
                            className="duplicate-toggle-button"
                            onClick={() =>
                                setHideDuplicateLogs((current) => !current)
                            }
                        >
                            {hideDuplicateLogs
                                ? 'Show Duplicate'
                                : 'Hide Duplicate'}
                        </button>
                    </div>

                    <div className="attendance-records-actions-right">
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
                </div>

                {loading && <Loading />}

                {!loading && error && (
                    <div className="attendance-records-error">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <>

                        <div className="attendance-records-table-wrapper">
                            <table className="attendance-records-table">
             <thead>
    <tr>
        <th className="checkbox-header">
            <input
                type="checkbox"
                checked={
                    filteredRecords.length > 0 &&
                    selectedRecords.length === filteredRecords.length
                }
                onChange={handleSelectAll}
            />
        </th>

        <th
            onClick={() => handleSort('session')}
            className="sortable-header"
        >
            Session{getSortIndicator('session')}
        </th>

                                        <th
                                            onClick={() => handleSort('name')}
                                            className="sortable-header"
                                        >
                                            Attendance (Full Name){getSortIndicator('name')}
                                        </th>

                                        <th
                                            onClick={() => handleSort('card')}
                                            className="sortable-header"
                                        >
                                            Card No{getSortIndicator('card')}
                                        </th>

                                        <th
                                            onClick={() => handleSort('checkIn')}
                                            className="sortable-header"
                                        >
                                            Check In{getSortIndicator('checkIn')}
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredRecords.length === 0 ? (
                                        <tr>
                               <td
    colSpan="5"
    className="no-records"
>
                                                No attendance records found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRecords.map((record) => (
                                <tr key={record.id}>
    <td className="checkbox-cell">
        <input
            type="checkbox"
            checked={selectedRecords.includes(record.id)}
            onChange={() => handleSelectRecord(record.id)}
        />
    </td>

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
                    </>
                )}
            </main>
        </div>
    )
}

export default AttendanceRecords