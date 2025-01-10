"use client";

import { cn } from '@/lib/utils';
import { Chart as ChartJS, ChartOptions, ChartTypeRegistry, registerables } from 'chart.js';
import { useEffect, useState } from 'react';
import { Chart, ChartProps } from 'react-chartjs-2';
import { deepMerge } from '@/lib/utils';
ChartJS.register(...registerables);

interface ChartClientProps extends Omit<ChartProps, "type" | "data"> {
    categoryName: string;
    chartSettings: SectionModule.Chart;
    filters?: SectionModule.Filters
};

const ChartClient = ({ categoryName, chartSettings, filters, ...props }: ChartClientProps) => {
    const [data, setData] = useState<API.DataResponse>({ labels: [], datasets: [{ data: [] }] });
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<{ message: string, type: "error" | "warning" } | null>(null);

    const setErrorMessage = (message: string, type: "error" | "warning") => {
        setError({ message, type });
        setIsLoading(false);
        setData({ labels: [], datasets: [{ data: [] }] });
    };

    useEffect(() => {
        if (chartSettings.variableName === "") {
            setErrorMessage("Unknow variable!", "warning")
            return;
        };
        const controller = new AbortController();

        setError(null);
        setIsLoading(true);
        fetch(
            `/api/data/${categoryName.toLowerCase()}/${chartSettings.variableName.toLowerCase()}`,
            {
                signal: controller.signal,
                method: "POST",
                body: JSON.stringify({ aggregationType: chartSettings.aggregationType, variableType: chartSettings.variableType, filters }),
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: 'same-origin'
            }
        ).then(response => {
            if (!response.ok) setErrorMessage("An error occurred when fetching data!", "error");
            else {
                response.json().then((jsonResponse: API.DataResponse) => {
                    setIsLoading(false);
                    setData(jsonResponse);
                    if (jsonResponse.datasets.length === 0 || (jsonResponse.datasets.length === 1 && jsonResponse.datasets[0].data.length === 0)) setErrorMessage("Empty dataset!", "warning");
                }).catch(() => {
                    setErrorMessage("An error occurred when parsing fetched data!", "error")
                })
            };
        }).catch(() => {
            if (!controller.signal.aborted) {
                setErrorMessage("An error occurred when fetching data!", "error");
            };
        });

        return () => {
            if (!controller.signal.aborted) controller.abort();
        };
    }, [filters]);

    let type: keyof ChartTypeRegistry = "line";
    let options: ChartOptions = {
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: `${chartSettings.label}`
            }
        }
    };

    switch (chartSettings.type) {
        case 'stacked_bargraph':
            type = "bar";
            options = deepMerge(options, {
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (tooltipItem: any) {
                                return `${tooltipItem.dataset.label}: ${tooltipItem.raw}%`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: true, // Enable stacking on the x-axis
                    },
                    y: {
                        stacked: true, // Enable stacking on the y-axis
                    }
                }
            } as ChartOptions);
            break;
        case "number":
        case 'trend':
            type = "line"
            break;
    };

    switch (chartSettings.aggregationType) {
        case "percentage":
            options = deepMerge(options, {
                scales: {
                    y: {
                        ticks: {
                            callback: function (value: any) {
                                return value + '%'; // Show percentage labels on the Y-axis
                            }
                        },
                        min: 0
                    }
                }
            } as ChartOptions);
            break;
    };

    return <div className={cn(
        "relative w-full rounded-[15px] flex flex-col gap-[20px] pt-[10px] items-center",
        error && (error.type === "error" ? "shadow-[inset_0px_0px_8px_0px_#FF0000CC]" : "shadow-[inset_0px_0px_8px_0px_#FFA500CC]")
    )}>
        <div className="w-full h-[400px]">
            <Chart
                height={350}
                {...props}
                type={type}
                data={{ labels: data.labels, datasets: data.datasets.map(dt => ({ label: `${dt.label && (dt.label !== "1" || chartSettings.variableType !== "categorical_binary") ? `${dt.label} (${chartSettings.aggregationType})` : `${chartSettings.variableName} (${chartSettings.aggregationType})`}`, data: dt.data })) }}
                options={options} />
        </div>
        {error &&
            <p className={cn(
                "mb-[10px]",
                error.type === "error" ? "text-[#FF0000CC]" : "text-[#FFA500CC]"
            )
            }>{error.message}</p>
        }
        {isLoading && <>
            <div className="absolute top-0 left-0 w-full h-full rounded-[15px] bg-gray-light"></div>
            <div className="absolute top-0 left-0 w-full h-full rounded-[15px] bg-white animate-pulse "></div>
        </>}
    </div>
};

export { ChartClient };
