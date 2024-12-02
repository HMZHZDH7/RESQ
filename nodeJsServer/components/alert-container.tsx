"use client";

import { useEffect, useContext, useState, useRef, createRef } from "react";
import AlertContext from '@/components/contexts/AlertContext';
import Alert from "@/components/alert";

interface IAlert {
    message: string;
    type: "info" | "success" | "warning" | "danger";
    id?: string; // Alerts may include an optional `id` for unique identification, which is necessary for handling multiple alerts.
}

// Listener functions can receive a single alert or an array of alerts.
type NewAlertListenerFunc = (alert: IAlert | IAlert[]) => void;

const UrlAlertReader = () => {
    const { addNewAlertListener, deleteNewAlertListener } = useContext(AlertContext);

    // State to store active alerts displayed in the UI
    const [alerts, setAlerts] = useState<IAlert[]>([]);

    const addAlert = (alert: IAlert) => {
        // Generates a unique `id` using the current timestamp and a random number.
        const id = `${Date.now()}-${Math.random()}`;
        const newAlert = { ...alert, id };

        // Adds the new alert to the beginning of the list for reverse chronological display.
        setAlerts((prev) => [newAlert, ...prev]);
    };

    const removeAlert = (id: string) => {
        // Removes an alert by its `id`, ensuring cleanup after it finishes.
        setAlerts((prev) => prev.filter((a) => a.id !== id));
    };

    const alertListener: NewAlertListenerFunc = (alert) => {
        if (Array.isArray(alert)) {
            // Handles multiple alerts by adding each one individually.
            alert.forEach(addAlert);
        } else {
            // Adds a single alert.
            addAlert(alert);
        }
    };

    useEffect(() => {
        // Registers the listener to handle incoming alerts.
        addNewAlertListener(alertListener);
        return () => {
            // Clears active alerts when the component unmounts to reset state.
            setAlerts([]);
            // Unregisters the listener to prevent memory leaks
            deleteNewAlertListener(alertListener);
        }
    }, []);

    return (
        <div className="fixed right-[20px] bottom-[20px] flex flex-col-reverse gap-[10px]">
            {alerts.map((alert, index) => (
                <Alert key={index} message={alert.message} type={alert.type} id={alert.id as string} alertFinished={removeAlert} />
            ))}
        </div>
    );
};

export default UrlAlertReader;
