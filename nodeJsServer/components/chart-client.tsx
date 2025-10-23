"use client";

import { cn } from '@/lib/utils';
import { Chart as ChartJS, ChartOptions, ChartTypeRegistry, registerables } from 'chart.js';
import { useEffect, useState } from 'react';
import { Chart, ChartProps } from 'react-chartjs-2';
import { deepMerge } from '@/lib/utils';
import annotationPlugin from 'chartjs-plugin-annotation';
import { variables } from '@/data/custom-variables';
ChartJS.register(...registerables, annotationPlugin);

interface ChartClientProps extends Omit<ChartProps, "type" | "data"> {
  categoryName: string;
  chartSettings: SectionModule.Chart; 
  filters?: SectionModule.Filters;
  showMedianHospital?: boolean;
  onPValue?: (label: string, pValueObj: { value: number | null, significant: "positive" | "negative" | "neutral", diffMedian: number | null, pctEvolution: string | null }) => void;
}

const ChartClient = ({ categoryName, chartSettings, filters, onPValue, ...props }: ChartClientProps) => {
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
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH ? process.env.NEXT_PUBLIC_BASE_PATH.toLowerCase() : "";
        fetch(
            `${basePath}/api/data/${categoryName.toLowerCase()}/${chartSettings.variableName.toLowerCase()}`,
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

                    if (onPValue) {
                        onPValue(chartSettings.label, { 
                            value: jsonResponse.datasets?.[0]?.pValue ?? null, 
                            significant: jsonResponse.datasets?.[0]?.significant ?? "neutral",
                            diffMedian: jsonResponse.datasets?.[0]?.diffMedian ?? null,
                            pctEvolution: jsonResponse.datasets?.[0]?.pctEvolution ?? null
                        });
                    }

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

    function calculateMedian(values: number[]): number {
        if (values.length === 0) return 0;
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        if (sorted.length % 2 !== 0) {
            return sorted[mid];
        }
        return (sorted[mid - 1] + sorted[mid]) / 2;
    }

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

    const adjustColor = (color: string, factor: number): string => {
        const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([0-9.]*)?\)/);
        if (!match) return color;
        let r = Math.min(255, Math.max(0, Math.floor(parseInt(match[1]) * factor)));
        let g = Math.min(255, Math.max(0, Math.floor(parseInt(match[2]) * factor)));
        let b = Math.min(255, Math.max(0, Math.floor(parseInt(match[3]) * factor)));
        const a = match[4] !== undefined && match[4] !== "" ? parseFloat(match[4]) : 1;
        return `rgba(${r},${g},${b},${a})`;
    }

    const palette: string[] = [
        'rgba(0, 123, 255, 0.9)',
        'rgba(255, 140, 0, 0.9)',
        'rgba(255, 193, 7, 0.9)',
        'rgba(255, 105, 180, 0.9)',
        'rgba(102, 16, 242, 0.9)'
    ];

    const colorMap: Record<string, string> = {};
    let colorIndex = 0;

    const getColorForSuffix = (label: string) => {
        const parts = label.split('-');
        const suffix = parts.length > 1 ? parts[1].trim() : label; // récupérer tout après le -
        if (!colorMap[suffix]) {
            colorMap[suffix] = palette[colorIndex % palette.length];
            colorIndex++;
        }
        return colorMap[suffix];
    };

    data.datasets = data.datasets.map(dt => {
        let datasetType: keyof ChartTypeRegistry;
        const baseColor = getColorForSuffix(dt.label ?? "");
        let color: string;

        if (dt.label?.includes("Country")) {
            datasetType = "bar";
            color = baseColor; 
            return {
                ...dt,
                type: datasetType,
                borderColor: color,
                backgroundColor: color,
                pointRadius: 0,
                order: 2
            };
        } else if (dt.label?.includes("Hospital")) {
            datasetType = "line";
            color = adjustColor(baseColor, 0.8); // 
            return {
                ...dt,
                type: datasetType,
                borderColor: color,
                backgroundColor: "transparent",
                pointRadius: 3,
                order: 1
            };
        } else {
            datasetType = "bar";
            color = baseColor;
            return {
                ...dt,
                type: datasetType,
                borderColor: color,
                backgroundColor: color,
                pointRadius: 0,
                order: 1
            };
        }
    });

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

    options = deepMerge(options, {   
        plugins: {
            annotation: {
                annotations: {
                    medianCountryLine: {
                        type: 'line',
                        yMin: (ctx: any) => {
                            const dataset = ctx.chart.data.datasets.find((dt: any) => dt.label?.includes('Country'));
                            const data = Array.isArray(dataset?.data) ? dataset.data as number[] : [];
                            return calculateMedian(data);
                        },
                        yMax: (ctx: any) => {
                            const dataset = ctx.chart.data.datasets.find((dt: any) => dt.label?.includes('Country'));
                            const data = Array.isArray(dataset?.data) ? dataset.data as number[] : [];
                            return calculateMedian(data);
                        },
                        borderColor: "rgba(0, 123, 255, 0.7)",
                        borderWidth: 2,
                        borderDash: [5, 5],
                        label: {
                            content: 'Country median',
                            enabled: true,
                            position: 'end',
                        }
                    },
                    
                    medianHospitalLine: {
                        type: 'line',
                        yMin: (ctx: any) => {
                            const dataset = ctx.chart.data.datasets.find((dt: any) => dt.label?.includes('Hospital'));
                            const data = Array.isArray(dataset?.data) ? dataset.data as number[] : [];
                            return calculateMedian(data);
                        },
                        yMax: (ctx: any) => {
                            const dataset = ctx.chart.data.datasets.find((dt: any) => dt.label?.includes('Hospital'));
                            const data = Array.isArray(dataset?.data) ? dataset.data as number[] : [];
                            return calculateMedian(data);
                        },
                        borderColor: "rgba(255,0,0,0.7)", 
                        borderWidth: 2,
                        borderDash: [5, 5],
                        label: {
                            content: 'Hospital median',
                            enabled: true,
                            position: 'end'
                        }
                    }
                }
            }
        }
    } as ChartOptions);

    
    return <div
        className={cn(
            "relative w-full rounded-[15px] flex flex-col gap-[20px] pt-[10px] items-center",
            error?.type === "error"
            ? "shadow-[inset_0px_0px_8px_0px_#FF0000CC]"
            : error?.type === "warning"
            ? "shadow-[inset_0px_0px_8px_0px_#FFA500CC]"
            : (() => {
                // Shadow pour les évolutions significatives si pas d'erreur
                if (!data.datasets) return "";
                
                const hasPositive = (data.datasets as any[]).some(ds => ds.significant === "positive");
                const hasNegative = (data.datasets as any[]).some(ds => ds.significant === "negative");

                if (hasPositive) return "shadow-[inset_0px_0px_8px_0px_#00FF00CC]";
                if (hasNegative) return "shadow-[inset_0px_0px_8px_0px_#FF0000CC]";
                return ""; // pas d'évolution
            })()            
        )}
    >
        <div className="w-full h-[400px]">
            <Chart
                height={350}
                {...props}
                type={type}
                data={{ 
                    labels: data.labels, 
                    datasets: data.datasets.map(dt => {
                        let datasetType: keyof ChartTypeRegistry | undefined;

                        if (chartSettings.aggregationType === "percentage") {
                            if (dt.label?.includes("Country")) datasetType = "bar";
                            if (dt.label?.includes("Hospital")) datasetType = "line";
                        }

                        const baseColor = getColorForSuffix(dt.label ?? "");
                        const color = dt.label?.includes("Hospital") 
                            ? adjustColor(baseColor, 0.8) 
                            : baseColor;

                        return { 
                            ...dt,
                            type: datasetType,
                            hidden: dt.label?.includes("Hospital") && !props.showMedianHospital,
                            borderColor: color,
                            label: dt.label && (dt.label !== "1" || chartSettings.variableType !== "categorical_binary") 
                                    ? `${dt.label} (${chartSettings.aggregationType})` 
                                    : `${chartSettings.variableName} (${chartSettings.aggregationType})`, 
                        };
                    }) 
                }}
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
