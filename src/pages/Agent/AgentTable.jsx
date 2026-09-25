import { Fragment, useState } from 'react'

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
    const [expandedAgents, setExpandedAgents] = useState([])

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

    function toggleExpanded(agentId) {
        setExpandedAgents((current) => {
            if (current.includes(agentId)) {
                return current.filter((id) => id !== agentId)
            }

            return [...current, agentId]
        })
    }

    const sortedAgents = [...agents].sort((a, b) => {
        if (!sortField || !sortDirection) {
            return 0
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

                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>
                    {sortedAgents.length === 0 ? (
                        <tr>
                            <td
                                colSpan="8"
                                className="empty-table"
                            >
                                No agents found.
                            </td>
                        </tr>
                    ) : (
                        sortedAgents.map((agent) => {
                            const isExpanded = expandedAgents.includes(
                                agent.id
                            )

                            return (
                                <Fragment key={agent.id}>
                                    <tr>
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

                                        <td>
                                            <button
                                                type="button"
                                                className="agent-name-button"
                                                onClick={() =>
                                                    toggleExpanded(agent.id)
                                                }
                                            >
                                                <span className="expand-icon">
                                                    {isExpanded ? '▼' : '▶'}
                                                </span>

                                                <span>
                                                    {agent.full_name}
                                                </span>
                                            </button>
                                        </td>

                                        <td>{agent.card_no}</td>

                                        <td>
                                            <span
                                                className={`status-badge ${
                                                    agent.status === 'active'
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

                                    {isExpanded && (
                                        <tr className="agent-details-row">
                                            <td></td>

                                            <td
                                                colSpan="7"
                                                className="agent-details-cell"
                                            >
                                                <div className="agent-details">
                                                    <div>
                                                        <strong>IC No</strong>
                                                        <span>
                                                            {agent.ic_no ||
                                                                '-'}
                                                        </span>
                                                    </div>

                                                    <div>
                                                        <strong>Phone</strong>
                                                        <span>
                                                            {agent.phone ||
                                                                '-'}
                                                        </span>
                                                    </div>

                                                    <div>
                                                        <strong>Email</strong>
                                                        <span>
                                                            {agent.email ||
                                                                '-'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            )
                        })
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default AgentTable