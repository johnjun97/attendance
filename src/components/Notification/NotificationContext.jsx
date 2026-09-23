import { createContext, useContext, useEffect, useState } from 'react'
import Notification from './Notification.jsx'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
    const [notification, setNotification] = useState(null)

    function showNotification(message, type = 'success') {
        setNotification({
            message,
            type,
        })
    }

    function closeNotification() {
        setNotification(null)
    }

    useEffect(() => {
        if (!notification) {
            return
        }

        const timer = setTimeout(() => {
            setNotification(null)
        }, 3000)

        return () => clearTimeout(timer)
    }, [notification])

    return (
        <NotificationContext.Provider
            value={{
                showNotification,
                closeNotification,
            }}
        >
            {children}

            <Notification
                message={notification?.message}
                type={notification?.type}
                onClose={closeNotification}
            />
        </NotificationContext.Provider>
    )
}

export function useNotification() {
    const context = useContext(NotificationContext)

    if (!context) {
        throw new Error(
            'useNotification must be used inside NotificationProvider'
        )
    }

    return context
}