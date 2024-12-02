"use client";

import { useEffect, useContext } from "react";
import AlertContext from '@/components/contexts/AlertContext';
import { useSearchParams } from 'next/navigation';

const UrlAlertReader = () => {
    const { addNewAlert } = useContext(AlertContext);
    const searchParams = useSearchParams();
    useEffect(() => {
        // Extracts the `a` parameter from the URL to determine which alert to trigger.
        const alert = searchParams.get('a');

        switch (alert) {
            case "1":
                addNewAlert({ message: "You have been successfully disconnected.", type: "success" });
                break;
            case "2":
                addNewAlert({ message: "Incorrect login or password.", type: "danger" });
                break;
            default:
                break;
        };
    }, [searchParams]);

    // Component does not render any UI, acting solely as a logic handler for URL-based alerts.
    return (null);
};

export default UrlAlertReader;
