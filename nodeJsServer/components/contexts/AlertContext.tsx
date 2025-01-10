"use client";
import { createContext, ReactNode, useRef } from 'react';


type AlertContextType = {
    addNewAlert: (alert: AlertModule.Alert) => void;
    addNewAlertListener: (func: AlertModule.ListenerFunc) => void;
    deleteNewAlertListener: (func: AlertModule.ListenerFunc) => void;
};

const AlertContext = createContext<AlertContextType>({
    addNewAlert: () => { },
    addNewAlertListener: () => { },
    deleteNewAlertListener: () => { }
});

export const AlertProvider = ({ children }: { children: ReactNode }) => {

    // A `Set` to hold all alert listener functions.
    const alertListeners = useRef<Set<AlertModule.ListenerFunc>>(new Set());

    // A cache to temporarily store alerts when no listeners are registered.
    const alertsCache = useRef<AlertModule.Alert[]>([]);

    function addNewAlert(alert: AlertModule.Alert) {
        if (alertListeners.current.size > 0) {
            // If there are listeners, notify them about the new alert.
            alertListeners.current.forEach(listener => listener(alert));
        } else {
            // Cache the alert if no listeners are present for future notification.
            alertsCache.current.push(alert);
        };
    };

    function addNewAlertListener(func: AlertModule.ListenerFunc) {
        // Adds a new listener to the set of alert listeners.
        alertListeners.current.add(func);
        if (alertsCache.current.length === 1) {
            // Immediately sends cached alerts to the newly added listener if it's the only listener.
            func(alertsCache.current);
            // Clears the cache once the alerts are sent.
            alertsCache.current = [];
        };
    };

    function deleteNewAlertListener(func: AlertModule.ListenerFunc) {
        // Removes a listener from the set of alert listeners.
        alertListeners.current.delete(func);
    };

    return (
        <AlertContext.Provider value={{ addNewAlert, addNewAlertListener, deleteNewAlertListener }}>
            {children}
        </AlertContext.Provider>
    );
};

export { AlertContext };
