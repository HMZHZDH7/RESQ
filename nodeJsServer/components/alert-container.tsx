"use client";

import { useEffect, useContext, useState } from "react";
import { AlertContext } from '@/components/contexts/AlertContext';
import { Alert } from "@/components/alert";

const AlertContainer = () => {
    const { addNewAlertListener, deleteNewAlertListener } = useContext(AlertContext);

    // State to store active alerts displayed in the UI
    const [alerts, setAlerts] = useState<AlertModule.Alert[]>([]);

    const addAlert = (alert: AlertModule.Alert) => {
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

    const alertListener: AlertModule.ListenerFunc = (alert) => {
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
        <div className="fixed right-[20px] bottom-[20px] w-[400px] flex flex-col-reverse gap-[10px] z-50">
            {alerts.map((alert) => (
                <Alert key={alert.id} message={alert.message} type={alert.type} id={alert.id as string} alertFinished={removeAlert} />
            ))}
        </div>
    );
};

export { AlertContainer };
