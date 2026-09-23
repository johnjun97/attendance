import { useEffect, useRef } from 'react'
import './Notification.css'

function Notification({ type = 'success', message, onClose }) {
    const timerRef = useRef(null)

    function startTimer() {
        clearTimeout(timerRef.current)

        timerRef.current = setTimeout(() => {
            onClose()
        }, 5000)
    }

    function stopTimer() {
        clearTimeout(timerRef.current)
        timerRef.current = null
    }

    useEffect(() => {
        if (!message) {
            return
        }

        startTimer()

        return () => {
            stopTimer()
        }
    }, [message])

    function handleMouseEnter() {
        stopTimer()
    }

    function handleMouseLeave() {
        startTimer()
    }

    function handleNotificationClick() {
        startTimer()
    }

    function handleCloseClick(event) {
        event.stopPropagation()
        onClose()
    }

    if (!message) {
        return null
    }

    return (
        <div
            className={`notification notification-${type}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleNotificationClick}
        >
            <div className="notification-icon">
                {type === 'success' ? '✓' : '✕'}
            </div>

            <div className="notification-message">
                {message}
            </div>

            <button
                type="button"
                className="notification-close"
                onClick={handleCloseClick}
            >
                ×
            </button>
        </div>
    )
}

export default Notification