"use client";
import { useEffect, useRef, useContext } from 'react';
import WebSocketContext from '@/components/contexts/WebSocketContext';
import { Chart } from 'chart.js/auto';

const ChartDisplay = ({ className }: { className?: string }) => {
    const { currentChart, setImageForChart } = useContext(WebSocketContext);
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstanceRef = useRef<Chart | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!currentChart || !chartRef.current) return;

        const { data, args } = currentChart;

        const labels = data.map((i: any) => i.YQ);
        const values = data.map((i: any) => i.Value);

        const chartData = {
            labels,
            datasets: [{
                label: 'Your hospital',
                data: values,
                borderColor: '#ff4081',
                borderWidth: 2,
                pointRadius: 5,
                pointBackgroundColor: '#ff4081',
            }]
        };

        if (args.visualization.show_nat_val === true) {
            const nat_values = data.map((i: any) => i.nat_value);
            chartData.datasets.push({
                label: 'National median',
                data: nat_values,
                borderColor: '#2196f3',
                borderWidth: 2,
                pointRadius: 5,
                pointBackgroundColor: '#2196f3',
            });
        };

        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        };

        if (chartRef.current && containerRef.current) {
            chartRef.current.width = containerRef.current.clientWidth - 10;
            chartRef.current.height = containerRef.current.clientHeight - 10;
        };

        chartInstanceRef.current = new Chart(chartRef.current, {
            type: args.visualization.type,
            data: chartData,
            options: {
                scales: {
                    x: {
                        type: 'category', // Use category scale for YQ values
                        position: 'bottom',
                        title: {
                            display: true,
                            text: 'YQ'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Value'
                        },
                        beginAtZero: true
                    }
                },
                responsive: false,
                maintainAspectRatio: true,
                animation: {
                    onComplete: () => {
                        if (currentChart.image) return;
                        const chartImage = chartInstanceRef.current?.toBase64Image();

                        if (!chartImage) return;
                        else setImageForChart(currentChart, chartImage);
                    }
                }
            }
        })

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
                chartInstanceRef.current = null;
            }
        }
    }, [currentChart]);

    return <div ref={containerRef} className={className}>
        <canvas ref={chartRef} className='h-full w-auto'></canvas>
    </div>
};

export default ChartDisplay;
