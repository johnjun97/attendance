function AgentFormModal({
    mode,
    form,
    saving,
    onChange,
    onSubmit,
    onClose,
}) {
    const isEdit = mode === 'edit'

    function handleKeyDown(event) {
        if (event.key !== 'Enter') {
            return
        }

        event.preventDefault()

        const formElements = Array.from(
            event.currentTarget.elements
        ).filter(
            (element) =>
                !element.disabled &&
                element.type !== 'button' &&
                element.type !== 'submit'
        )

        const currentIndex = formElements.indexOf(
            event.target
        )

        const nextElement = formElements[currentIndex + 1]

        if (nextElement) {
            nextElement.focus()
        }
    }

    return (
        <div className="agent-modal-overlay">
            <div className="agent-modal">
                <h2>{isEdit ? 'Edit Agent' : 'Add Agent'}</h2>

                <form
                    onSubmit={onSubmit}
                    onKeyDown={handleKeyDown}
                >
                    <div className="agent-form-grid">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="full_name"
                                value={form.full_name}
                                onChange={onChange}
                                required
                                style={{ textTransform: 'uppercase' }}
                            />
                        </div>

                        <div className="form-group">
                            <label>Card No</label>
                            <input
                                name="card_no"
                                type="text"
                                value={form.card_no}
                                onChange={onChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Status</label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={onChange}
                            >
                                <option value="active">
                                    Active
                                </option>
                                <option value="disabled">
                                    Disabled
                                </option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Agency</label>
                            <input
                                name="agency"
                                type="text"
                                value={form.agency}
                                onChange={onChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Ranking</label>
                            <input
                                name="ranking"
                                type="text"
                                value={form.ranking}
                                onChange={onChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>IC No</label>
                            <input
                                name="ic_no"
                                type="text"
                                value={form.ic_no}
                                onChange={onChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Phone</label>
                            <input
                                name="phone"
                                type="text"
                                value={form.phone}
                                onChange={onChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={onChange}
                            />
                        </div>
                    </div>

                    <div className="agent-modal-actions">
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="add-agent-button"
                            disabled={saving}
                        >
                            {saving
                                ? 'Saving...'
                                : isEdit
                                    ? 'Save Changes'
                                    : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AgentFormModal