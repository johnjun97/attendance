import { QRCodeCanvas } from 'qrcode.react'

function AgentQrModal({ agent, onClose }) {
    if (!agent) {
        return null
    }

    function saveQrCode() {
        const canvas = document.getElementById('agent-qr-code')

        if (!canvas) {
            return
        }

        const link = document.createElement('a')

        link.download = `${agent.card_no}-QR-Code.png`
        link.href = canvas.toDataURL('image/png')

        link.click()
    }

    return (
        <div className="agent-modal-overlay">
            <div className="agent-modal qr-modal">
                <h2>Agent QR Code</h2>

                <div className="qr-agent-info">
                    <p>
                        <strong>Full Name:</strong>{' '}
                        {agent.full_name}
                    </p>

                    <p>
                        <strong>Card No:</strong>{' '}
                        {agent.card_no}
                    </p>
                </div>

                <div className="qr-code-container">
                    <QRCodeCanvas
                        id="agent-qr-code"
                        value={agent.card_no}
                        size={240}
                        level="M"
                    />
                </div>

                <div className="agent-modal-actions">
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={onClose}
                    >
                        Close
                    </button>

                    <button
                        type="button"
                        className="add-agent-button"
                        onClick={saveQrCode}
                    >
                        Save QR Code
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AgentQrModal