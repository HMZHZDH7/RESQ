"use client";
import { createContext, ReactNode, useRef } from 'react';

// Defines the structure of an alert object, specifying its message and type (limited to specific strings).
interface IAlert {
    message: string;
    type: "info" | "success" | "warning" | "danger";
};

// Represents the type of functions that can act as listeners, which receive either a single alert or an array of alerts.
type NewAlertListenerFunc = (alert: IAlert | IAlert[]) => void;

type AlertContextType = {
    addNewAlert: (alert: IAlert) => void;
    addNewAlertListener: (func: NewAlertListenerFunc) => void;
    deleteNewAlertListener: (func: NewAlertListenerFunc) => void;
};

const AlertContext = createContext<AlertContextType>({
    addNewAlert: () => { },
    addNewAlertListener: () => { },
    deleteNewAlertListener: () => { }
});

export const AlertProvider = ({ children }: { children: ReactNode }) => {

    // A `Set` to hold all alert listener functions.
    const alertListeners = useRef<Set<NewAlertListenerFunc>>(new Set());

    // A cache to temporarily store alerts when no listeners are registered.
    const alertsCache = useRef<IAlert[]>([]);

    function addNewAlert(alert: IAlert) {
        if (alertListeners.current.size > 0) {
            // If there are listeners, notify them about the new alert.
            alertListeners.current.forEach(listener => listener(alert));
        } else {
            // Cache the alert if no listeners are present for future notification.
            alertsCache.current.push(alert);
        };
    };

    function addNewAlertListener(func: NewAlertListenerFunc) {
        // Adds a new listener to the set of alert listeners.
        alertListeners.current.add(func);
        if (alertsCache.current.length === 1) {
            // Immediately sends cached alerts to the newly added listener if it's the only listener.
            func(alertsCache.current);
            // Clears the cache once the alerts are sent.
            alertsCache.current = [];
        };
    };

    function deleteNewAlertListener(func: NewAlertListenerFunc) {
        // Removes a listener from the set of alert listeners.
        alertListeners.current.delete(func);
    };

    return (
        <AlertContext.Provider value={{ addNewAlert, addNewAlertListener, deleteNewAlertListener }}>
            {children}
        </AlertContext.Provider>
    );
};

export default AlertContext;
