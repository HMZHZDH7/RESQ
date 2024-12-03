"use client";

import { useEffect, useRef, useState } from "react";
import TriangleIcon from "@/components/icons/triangle";
import SuccessIcon from "@/components/icons/success";
import InfoIcon from "@/components/icons/info";
import { cn } from "@/lib/utils";

interface AlertProps {
    message: string;
    type: "info" | "success" | "warning" | "danger";
    alertFinished: (id: string) => void;
    id: string;
};

const Alert = ({ message, type, alertFinished, id }: AlertProps) => {
    // A reference to the DOM element, used for applying animations and transitions.
    const alertRef = useRef<HTMLInputElement | null>(null);

    // Tracks the state of the alert's lifecycle (building, showing, waiting, hiding) to control animation transitions.
    const [alertState, setAlertState] = useState<"building" | "showing" | "waiting" | "hiding">("building");

    const Icon = () => {
        switch (type) {
            case "danger":
            case "warning":
                return <TriangleIcon width={16} height={16} />;
            case "success":
                return <SuccessIcon width={16} height={16} />;
            default:
                return <InfoIcon width={16} height={16} />;
        }
    };

    useEffect(() => {
        let lastTimeout: ReturnType<typeof setTimeout>;
        if (alertRef.current) {
            // Begin the "showing" state when the component is rendered.
            setAlertState("showing");
            lastTimeout = setTimeout(() => {
                // After 1 second, switch to the "waiting" state (alert is visible).
                setAlertState("waiting");
                lastTimeout = setTimeout(() => {
                    // After 2.5 seconds, switch to "hiding" state to begin the fade-out process.
                    setAlertState("hiding");
                    lastTimeout = setTimeout(() => {
                        // Once the alert has fully disappeared (after 1 more second), notify that it is finished.
                        alertFinished(id);
                    }, 1000);
                }, 2500);
            }, 1000);
        }
        return () => {
            // Clears the timeout when the component is unmounted to avoid potential memory leaks.
            clearTimeout(lastTimeout);
        };
    }, []);

    return (
        <div
            ref={alertRef}
            className={cn(
                "flex items-center px-[17px] gap-[8px] w-full h-[58px] border rounded-[6px] duration-300 ease-in-out",
                type === "danger" ? "bg-[#F8D7DA] border-[#F1AEB5] text-[#58151C] fill-[#58151C]" :
                    type === "warning" ? "bg-[#FFF3CD] border-[#FFE69C] text-[#664D03] fill-[#664D03]" :
                        type === "success" ? "bg-[#D1E7DD] border-[#A3CFBB] text-[#0A3622] fill-[#0A3622]" :
                            "bg-[#CFE2FF] border-[#9EC5FE] text-[#052C65] fill-[#052C65]",
                alertState === "building" ? "opacity-0" : "transition-opacity",
                alertState === "waiting" && "opacity-100",
                alertState === "showing" && "animate-[newAlert_0.5s_ease_forwards]",
                alertState === "hiding" && "opacity-0"
            )}
        >
            <Icon />
            <p className="text-[14px]">{message}</p>
        </div>
    );
};

export default Alert;
