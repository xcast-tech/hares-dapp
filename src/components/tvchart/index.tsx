//@ts-nocheck
import { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";

export const TVChart = ({ data }) => {
  const domRef = useRef<HTMLDivElement>(null);

  function initChart(chartData) {
    domRef.current.innerHTML = "";
    const container = domRef.current as HTMLDivElement;

    const chartOptions = {
      layout: {
        textColor: "white",
        background: { type: "solid", color: "black" },
      },
    };

    const chart = createChart(container, chartOptions);

    const series = chart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    series.setData(chartData);
    chart.timeScale().fitContent();
    chart.timeScale().scrollToPosition(5);

    // // simulate real-time data
    // function* getNextRealtimeUpdate(realtimeData) {
    //   for (const dataPoint of realtimeData) {
    //     yield dataPoint;
    //   }
    //   return null;
    // }
    // const streamingDataProvider = getNextRealtimeUpdate(data.realtimeUpdates);

    // const intervalID = setInterval(() => {
    //   const update = streamingDataProvider.next();
    //   if (update.done) {
    //     clearInterval(intervalID);
    //     return;
    //   }
    //   series.update(update.value);
    // }, 100);
  }

  useEffect(() => {
    if (data.length) {
      initChart(data || []);
    }
  }, [data]);

  return <div ref={domRef} className="h-[calc(100vh/2)]"></div>;
};
