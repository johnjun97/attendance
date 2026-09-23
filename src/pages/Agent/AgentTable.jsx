import { useState } from 'react'

function AgentTable({
    agents,
    selectedAgents,
    allSelected,
    onSelectAll,
    onSelectAgent,
    onEdit,
    onToggleStatus,
    onDelete,
    onQrCode,
}) {
    const [sortField, setSortField] = useState(null)
    const [sortDirection, setSortDirection] = useState(null)

    function handleSort(field) {
        if (sortField !== field) {
            setSortField(field)
            setSortDirection('asc')
            return
        }

        if (sortDirection === 'asc') {
            setSortDirection('desc')
            return
        }

        setSortField(null)
        setSortDirection(null)
    }

    function getSortIndicator(field) {
        if (sortField !== field) {
            return ''
        }

        return sortDirection === 'asc' ? ' ▲' : ' ▼'
    }

    const sortedAgents = [...agents].sort((a, b) => {
        if (!sortField || !sortDirection) {
            return 0
        }

        if (sortField === 'id') {
            const valueA = Number(a.id)
            const valueB = Number(b.id)

            return sortDirection === 'asc'
                ? valueA - valueB
                : valueB - valueA
        }

        const valueA = String(a[sortField] ?? '').toLowerCase()
        const valueB = String(b[sortField] ?? '').toLowerCase()

        const comparison = valueA.localeCompare(valueB)

        return sortDirection === 'asc'
            ? comparison
            : -comparison
    })

    return (
        <div className="agent-table-container">
            <table className="agent-table">
<thead>
    <tr>
        <th className="checkbox-column">
            <input
                type="checkbox"
                checked={allSelected}
                onChange={onSelectAll}
            />
        </th>

        <th
            className="sortable-header"
            onClick={() => handleSort('id')}
        >
            ID{getSortIndicator('id')}
        </th>

        <th
            className="sortable-header"
            onClick={() => handleSort('full_name')}
        >
            Full Name{getSortIndicator('full_name')}
        </th>

        <th
            className="sortable-header"
            onClick={() => handleSort('card_no')}
        >
            Card No{getSortIndicator('card_no')}
        </th>

        <th
            className="sortable-header"
            onClick={() => handleSort('status')}
        >
            Status{getSortIndicator('status')}
        </th>

        <th
            className="sortable-header"
            onClick={() => handleSort('agency')}
        >
            Agency{getSortIndicator('agency')}
        </th>

        <th
            className="sortable-header"
            onClick={() => handleSort('ranking')}
        >
            Ranking{getSortIndicator('ranking')}
        </th>

        <th
            className="sortable-header"
            onClick={() => handleSort('ic_no')}
        >
            IC No{getSortIndicator('ic_no')}
        </th>

        <th
            className="sortable-header"
            onClick={() => handleSort('phone')}
        >
            Phone{getSortIndicator('phone')}
        </th>

        <th
            className="sortable-header"
            onClick={() => handleSort('email')}
        >
            Email{getSortIndicator('email')}
        </th>

        <th>Action</th>
    </tr>
</thead>

                <tbody>
                    {sortedAgents.length === 0 ? (
                        <tr>
                            <td
                                colSpan="11"
                                className="empty-table"
                            >
                                No agents found.
                            </td>
                        </tr>
                    ) : (
                        sortedAgents.map((agent) => (
                            <tr key={agent.id}>
                                <td className="checkbox-column">
                                    <input
                                        type="checkbox"
                                        checked={selectedAgents.includes(
                                            agent.id
                                        )}
                                        onChange={() =>
                                            onSelectAgent(agent.id)
                                        }
                                    />
                                </td>

                                <td>{agent.id}</td>

                                <td>{agent.full_name}</td>

                                <td>{agent.card_no}</td>

                                <td>
                                    <span
                                        className={`status-badge ${agent.status === 'active'
                                                ? 'status-active'
                                                : 'status-disabled'
                                            }`}
                                    >
                                        {agent.status === 'active'
                                            ? 'Active'
                                            : 'Disabled'}
                                    </span>
                                </td>

                                <td>{agent.agency}</td>

                                <td>{agent.ranking}</td>

                                <td>{agent.ic_no}</td>

                                <td>{agent.phone}</td>

                                <td>{agent.email}</td>

                                <td className="agent-actions-cell">
                                    <button
                                        type="button"
                                        className="edit-button"
                                        onClick={() =>
                                            onEdit(agent)
                                        }
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        className="disable-button"
                                        onClick={() =>
                                            onToggleStatus(agent)
                                        }
                                    >
                                        {agent.status === 'active'
                                            ? 'Disable'
                                            : 'Enable'}
                                    </button>

                                    <button
                                        type="button"
                                        className="delete-button"
                                        onClick={() =>
                                            onDelete(agent)
                                        }
                                    >
                                        Delete
                                    </button>

                                    <button
                                        type="button"
                                        className="qrcode-button"
                                        onClick={() =>
                                            onQrCode(agent)
                                        }
                                    >
                                        QR Code
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default AgentTable