"use client";
import { useContext } from 'react';
import WebSocketContext from '@/components/contexts/WebSocketContext';
import { cn } from '@/lib/utils';

const ChartHistory = () => {
    const { currentChart, charts, setChartFromHistory } = useContext(WebSocketContext);
    return <div className="w-full h-[150px] flex items-center relative">
        <div className="absolute top-0 left-0 px-[10px] py-[10px] w-full h-full flex items-center gap-[30px] overflow-x-auto">
            {charts.filter(c => c.image).map((chart, index) => (
                <img
                    key={index}
                    src={chart.image}
                    alt={`Chart ${index}`}
                    className={cn("h-full w-auto object-contain rounded-[4px]", chart === currentChart && "shadow-[0px_0px_6px_0px_#4C98FA]")}
                    onClick={() => setChartFromHistory(chart)}
                />
            ))}
        </div>

    </div>
};

export default ChartHistory;
