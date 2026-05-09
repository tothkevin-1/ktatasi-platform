import React, { createContext, useState, useCallback } from 'react';

const NotificationContext = createContext();
export default NotificationContext;

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);

    const notify = useCallback((message, severity = 'info') => {
        setNotification({ message, severity });
        setTimeout(() => setNotification(null), 4000);
    }, []);

    return (
        <NotificationContext.Provider value={{ notification, notify }}>
            {children}
        </NotificationContext.Provider>
    );
};
