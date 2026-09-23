import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar/Navbar.jsx'
import { supabase } from '../../lib/supabase'
import Loading from '../../components/Loading/Loading.jsx'
import './Agent.css'
import AgentQrModal from './AgentQrModal.jsx'
import AgentFormModal from './AgentFormModal.jsx'
import AgentTable from './AgentTable.jsx'
import Notification from '../../components/Notification/Notification.jsx'

function Agent() {

    const [agents, setAgents] = useState([])
    const [selectedAgents, setSelectedAgents] = useState([])
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [notification, setNotification] = useState(null)

    const [editingAgent, setEditingAgent] = useState(null)
    const [showAgentModal, setShowAgentModal] = useState(false)

    const [showAddModal, setShowAddModal] = useState(false)
    const [saving, setSaving] = useState(false)

    const [qrAgent, setQrAgent] = useState(null)

    const [importing, setImporting] = useState(false)

    function parseCsvLine(line) {
        const values = []
        let current = ''
        let insideQuotes = false

        for (let i = 0; i < line.length; i += 1) {
            const character = line[i]

            if (character === '"') {
                if (
                    insideQuotes &&
                    line[i + 1] === '"'
                ) {
                    current += '"'
                    i += 1
                } else {
                    insideQuotes = !insideQuotes
                }
            } else if (
                character === ',' &&
                !insideQuotes
            ) {
                values.push(current)
                current = ''
            } else {
                current += character
            }
        }

        values.push(current)

        return values
    }

    const [form, setForm] = useState({
        full_name: '',
        card_no: '',
        status: 'active',
        agency: '',
        ranking: '',
        ic_no: '',
        phone: '',
        email: '',
    })

    useEffect(() => {
        loadAgents()
    }, [])

    function showNotification(message, type = 'success') {
        setNotification({
            message,
            type,
        })
    }

    async function loadAgents() {
        setLoading(true)
        setError('')

        const { data, error } = await supabase
            .from('attendance_agents')
            .select('*')
            .order('id', { ascending: true })

        if (error) {
            console.error(error)
            setError('Unable to load agents.')
            showNotification('Unable to load agents.', 'error')
            setLoading(false)
            return
        }

        setAgents(data || [])
        setLoading(false)
    }

    function openEditModal(agent) {
        setEditingAgent(agent)

        setForm({
            full_name: agent.full_name || '',
            card_no: agent.card_no || '',
            status: agent.status || 'active',
            agency: agent.agency || '',
            ranking: agent.ranking || '',
            ic_no: agent.ic_no || '',
            phone: agent.phone || '',
            email: agent.email || '',
        })

        setError('')
        setShowAgentModal(true)
    }

    function handleFormChange(event) {
        const { name, value } = event.target

        setForm((current) => ({
            ...current,
            [name]: value,
        }))
    }

    function closeEditModal() {
        if (saving) {
            return
        }

        setShowAgentModal(false)
        setEditingAgent(null)
    }

    async function handleUpdateAgent(event) {
        event.preventDefault()

        if (!form.full_name.trim()) {
            return
        }

        if (!form.card_no.trim()) {
            setError('Card No is required.')
            showNotification('Card No is required.', 'error')
            return
        }

        setSaving(true)
        setError('')

        const { data, error } = await supabase
            .from('attendance_agents')
            .update({
                full_name: form.full_name.trim().toUpperCase(),
                card_no: form.card_no.trim(),
                status: form.status,
                agency: form.agency.trim() || null,
                ranking: form.ranking.trim() || null,
                ic_no: form.ic_no.trim() || null,
                phone: form.phone.trim() || null,
                email: form.email.trim() || null,
            })
            .eq('id', editingAgent.id)
            .select()
            .single()

        if (error) {
            console.error(error)

            if (error.code === '23505') {
                setError('Card No already exists.')
                showNotification(
                    'Card No already exists. Please use a different Card No.',
                    'error'
                )
            } else {
                setError('Unable to update agent.')
                showNotification(
                    'Unable to update agent.',
                    'error'
                )
            }

            setSaving(false)
            return
        }

        setAgents((current) =>
            current.map((agent) =>
                agent.id === editingAgent.id ? data : agent
            )
        )

        setShowAgentModal(false)
        setEditingAgent(null)
        setSaving(false)

        showNotification('Agent updated successfully.')
    }

    async function handleToggleAgentStatus(agent) {
        const newStatus =
            agent.status === 'active'
                ? 'disabled'
                : 'active'

        const action =
            newStatus === 'disabled'
                ? 'disable'
                : 'enable'

        const confirmed = window.confirm(
            `Are you sure you want to ${action} ${agent.full_name}?`
        )

        if (!confirmed) {
            return
        }

        setError('')

        const { data, error } = await supabase
            .from('attendance_agents')
            .update({
                status: newStatus,
            })
            .eq('id', agent.id)
            .select()
            .single()

        if (error) {
            console.error(error)
            setError(`Unable to ${action} agent.`)
            showNotification(
                `Unable to ${action} agent.`,
                'error'
            )
            return
        }

        setAgents((current) =>
            current.map((currentAgent) =>
                currentAgent.id === agent.id
                    ? data
                    : currentAgent
            )
        )

        showNotification(
            `Agent ${newStatus === 'active' ? 'enabled' : 'disabled'} successfully.`
        )
    }

    async function handleDeleteAgent(agent) {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${agent.full_name}?`
        )

        if (!confirmed) {
            return
        }

        setError('')

        const { error } = await supabase
            .from('attendance_agents')
            .delete()
            .eq('id', agent.id)

        if (error) {
            console.error(error)
            setError('Unable to delete agent.')
            showNotification(
                'Unable to delete agent.',
                'error'
            )
            return
        }

        setAgents((current) =>
            current.filter(
                (currentAgent) => currentAgent.id !== agent.id
            )
        )

        setSelectedAgents((current) =>
            current.filter((id) => id !== agent.id)
        )

        showNotification('Agent deleted successfully.')
    }

    function handleExportAgents() {
        if (agents.length === 0) {
            showNotification('No agents to export.', 'error')
            return
        }

        const headers = [
            'Full Name',
            'Card No',
            'Status',
            'Agency',
            'Ranking',
            'IC No',
            'Phone',
            'Email',
        ]

        const rows = agents.map((agent) => [
            agent.full_name,
            agent.card_no,
            agent.status,
            agent.agency,
            agent.ranking,
            agent.ic_no,
            agent.phone,
            agent.email,
        ])

        const csvContent = [
            headers,
            ...rows,
        ]
            .map((row, rowIndex) =>
                row
                    .map((value, columnIndex) => {
                        const text = value ?? ''

                        if (
                            rowIndex > 0 &&
                            columnIndex === 1 &&
                            text !== ''
                        ) {
                            return `="${String(text).replace(/"/g, '""')}"`
                        }

                        return `"${String(text).replace(/"/g, '""')}"`
                    })
                    .join(',')
            )
            .join('\n')

        const blob = new Blob(
            [csvContent],
            { type: 'text/csv;charset=utf-8;' }
        )

        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')

        link.href = url
        link.download = `agents-${new Date().toISOString().slice(0, 10)}.csv`

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        URL.revokeObjectURL(url)

        showNotification('Agents exported successfully.')
    }

    async function handleImportAgents(event) {
        const file = event.target.files?.[0]

        event.target.value = ''

        if (!file) {
            return
        }

        if (!file.name.toLowerCase().endsWith('.csv')) {
            showNotification(
                'Please select a CSV file.',
                'error'
            )
            return
        }

        setImporting(true)
        setError('')

        try {
            const text = await file.text()

            const lines = text
                .replace(/^\uFEFF/, '')
                .split(/\r?\n/)
                .filter((line) => line.trim() !== '')

            if (lines.length < 2) {
                throw new Error(
                    'The CSV file does not contain any agent records.'
                )
            }

            const headers = parseCsvLine(lines[0]).map(
                (header) => header.trim()
            )

            const requiredHeaders = [
                'Full Name',
                'Card No',
                'Status',
                'Agency',
                'Ranking',
                'IC No',
                'Phone',
                'Email',
            ]

            const missingHeaders = requiredHeaders.filter(
                (header) => !headers.includes(header)
            )

            if (missingHeaders.length > 0) {
                throw new Error(
                    `Missing CSV column(s): ${missingHeaders.join(', ')}`
                )
            }

            const rows = lines.slice(1).map((line) => {
                const values = parseCsvLine(line)

                const row = {}

                headers.forEach((header, index) => {
                    row[header] = values[index]?.trim() || ''
                })

                return row
            })

            const importAgents = rows.map((row) => ({
                full_name: row['Full Name'].trim().toUpperCase(),
                card_no: row['Card No'],
                status: row['Status'].toLowerCase(),
                agency: row['Agency'] || null,
                ranking: row['Ranking'] || null,
                ic_no: row['IC No'] || null,
                phone: row['Phone'] || null,
                email: row['Email'] || null,
            }))

            const invalidRows = []

            importAgents.forEach((agent, index) => {
                const rowNumber = index + 2

                if (!agent.full_name) {
                    invalidRows.push(
                        `Row ${rowNumber}: Full Name is required.`
                    )
                }

                if (!agent.card_no) {
                    invalidRows.push(
                        `Row ${rowNumber}: Card No is required.`
                    )
                }

                if (
                    agent.status !== 'active' &&
                    agent.status !== 'disabled'
                ) {
                    invalidRows.push(
                        `Row ${rowNumber}: Status must be active or disabled.`
                    )
                }
            })

            if (invalidRows.length > 0) {
                throw new Error(
                    invalidRows.slice(0, 5).join('\n')
                )
            }

            const cardNumbers = importAgents.map(
                (agent) => agent.card_no
            )

            const duplicateCardNumbers = [
                ...new Set(
                    cardNumbers.filter(
                        (cardNo, index) =>
                            cardNumbers.indexOf(cardNo) !== index
                    )
                ),
            ]

            if (duplicateCardNumbers.length > 0) {
                throw new Error(
                    `Duplicate Card No in CSV: ${duplicateCardNumbers.join(', ')}`
                )
            }

            const { data: existingAgents, error: existingError } =
                await supabase
                    .from('attendance_agents')
                    .select('card_no')
                    .in('card_no', cardNumbers)

            if (existingError) {
                console.error(existingError)
                throw new Error(
                    'Unable to check existing Card Nos.'
                )
            }

            if (existingAgents?.length > 0) {
                const existingCardNumbers =
                    existingAgents.map(
                        (agent) => agent.card_no
                    )

                throw new Error(
                    `Card No already exists: ${existingCardNumbers.join(', ')}`
                )
            }

            const { error: insertError } = await supabase
                .from('attendance_agents')
                .insert(importAgents)

            if (insertError) {
                console.error(insertError)

                if (insertError.code === '23505') {
                    throw new Error(
                        'One or more Card Nos already exist.'
                    )
                }

                throw new Error(
                    'Unable to import agents.'
                )
            }

            await loadAgents()

            showNotification(
                `${importAgents.length} agent${importAgents.length === 1 ? '' : 's'} imported successfully.`
            )
        } catch (importError) {
            console.error(importError)

            setError(importError.message)

            showNotification(
                importError.message,
                'error'
            )
        } finally {
            setImporting(false)
        }
    }

    async function handleBulkDelete() {
        if (selectedAgents.length === 0) {
            return
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete ${selectedAgents.length} selected agent(s)?`
        )

        if (!confirmed) {
            return
        }

        setError('')

        const deletedCount = selectedAgents.length

        const { error } = await supabase
            .from('attendance_agents')
            .delete()
            .in('id', selectedAgents)

        if (error) {
            console.error(error)
            setError('Unable to delete selected agents.')
            showNotification(
                'Unable to delete selected agents.',
                'error'
            )
            return
        }

        setAgents((current) =>
            current.filter(
                (agent) => !selectedAgents.includes(agent.id)
            )
        )

        setSelectedAgents([])

        showNotification(
            `${deletedCount} agent${deletedCount === 1 ? '' : 's'} deleted successfully.`
        )
    }

    function handleSelectAgent(agentId) {
        setSelectedAgents((current) => {
            if (current.includes(agentId)) {
                return current.filter((id) => id !== agentId)
            }

            return [...current, agentId]
        })
    }

    function handleSelectAll(event) {
        if (event.target.checked) {
            setSelectedAgents(
                filteredAgents.map((agent) => agent.id)
            )
        } else {
            setSelectedAgents([])
        }
    }

    function openAddModal() {
        setForm({
            full_name: '',
            card_no: '',
            status: 'active',
            agency: '',
            ranking: '',
            ic_no: '',
            phone: '',
            email: '',
        })

        setError('')
        setShowAddModal(true)
    }

    function closeAddModal() {
        if (saving) {
            return
        }

        setShowAddModal(false)
    }

    async function handleAddAgent(event) {
        event.preventDefault()

        if (!form.full_name.trim()) {
            return
        }

        if (!form.card_no.trim()) {
            setError('Card No is required.')
            showNotification(
                'Card No is required.',
                'error'
            )
            return
        }

        setSaving(true)
        setError('')

        const { data, error } = await supabase
            .from('attendance_agents')
            .insert({
                full_name: form.full_name.trim().toUpperCase(),
                card_no: form.card_no.trim(),
                status: form.status,
                agency: form.agency.trim() || null,
                ranking: form.ranking.trim() || null,
                ic_no: form.ic_no.trim() || null,
                phone: form.phone.trim() || null,
                email: form.email.trim() || null,
            })
            .select()
            .single()

        if (error) {
            console.error(error)

            if (error.code === '23505') {
                setError('Card No already exists.')
                showNotification(
                    'Card No already exists. Please use a different Card No.',
                    'error'
                )
            } else {
                setError('Unable to add agent.')
                showNotification(
                    'Unable to add agent.',
                    'error'
                )
            }

            setSaving(false)
            return
        }

        setAgents((current) => [...current, data])
        setShowAddModal(false)
        setSaving(false)

        showNotification('Agent added successfully.')
    }

    const filteredAgents = agents.filter((agent) => {
        const searchText = search.toLowerCase()

        const matchesSearch =
            agent.full_name?.toLowerCase().includes(searchText) ||
            agent.card_no?.toLowerCase().includes(searchText) ||
            agent.agency?.toLowerCase().includes(searchText) ||
            agent.ranking?.toLowerCase().includes(searchText) ||
            agent.ic_no?.toLowerCase().includes(searchText) ||
            agent.phone?.toLowerCase().includes(searchText) ||
            agent.email?.toLowerCase().includes(searchText)

        const matchesStatus =
            !status || agent.status === status

        return matchesSearch && matchesStatus
    })

    const allSelected =
        filteredAgents.length > 0 &&
        filteredAgents.every((agent) =>
            selectedAgents.includes(agent.id)
        )

    if (loading) {
        return <Loading />
    }

    return (
        <div className="agent-page">
            <Navbar />

            <Notification
                type={notification?.type}
                message={notification?.message}
                onClose={() => setNotification(null)}
            />

            <main className="agent-content">
                <header className="agent-header">
                    <h1>Agent</h1>
                </header>

                <div className="agent-actions">
                    <button
                        type="button"
                        className="add-agent-button"
                        onClick={openAddModal}
                    >
                        Add Agent
                    </button>

                    {selectedAgents.length > 0 && (
                        <button
                            type="button"
                            className="bulk-delete-button"
                            onClick={handleBulkDelete}
                        >
                            Delete ({selectedAgents.length})
                        </button>
                    )}

                    <input
                        id="agent-csv-input"
                        type="file"
                        accept=".csv,text/csv"
                        onChange={handleImportAgents}
                        hidden
                    />

                    <label
                        htmlFor="agent-csv-input"
                        className="secondary-button"
                    >
                        {importing ? 'Importing...' : 'Import'}
                    </label>

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={handleExportAgents}
                    >
                        Export
                    </button>
                </div>

                <div className="agent-filters">
                    <input
                        type="text"
                        placeholder="Search agents..."
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                    />

                    <select
                        value={status}
                        onChange={(event) =>
                            setStatus(event.target.value)
                        }
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="disabled">Disabled</option>
                    </select>
                </div>

                <AgentTable
                    agents={filteredAgents}
                    selectedAgents={selectedAgents}
                    allSelected={allSelected}
                    onSelectAll={handleSelectAll}
                    onSelectAgent={handleSelectAgent}
                    onEdit={openEditModal}
                    onToggleStatus={handleToggleAgentStatus}
                    onDelete={handleDeleteAgent}
                    onQrCode={setQrAgent}
                />

            </main>
            {showAddModal && (
                <AgentFormModal
                    mode="add"
                    form={form}
                    saving={saving}
                    onChange={handleFormChange}
                    onSubmit={handleAddAgent}
                    onClose={closeAddModal}
                />
            )}

            {showAgentModal && (
                <AgentFormModal
                    mode="edit"
                    form={form}
                    saving={saving}
                    onChange={handleFormChange}
                    onSubmit={handleUpdateAgent}
                    onClose={closeEditModal}
                />
            )}

            <AgentQrModal
                agent={qrAgent}
                onClose={() => setQrAgent(null)}
            />
        </div>
    )
}

export default Agent