import { ABIs } from "@/lib/constant";
import DataFeed from "@/lib/trading-view/data-feed";
import Script from "next/script";
import { useEffect, useState } from "react";
import { useWatchContractEvent } from "wagmi";
import { watchContractEvent } from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmi";

type Props = {
  symbol: string;
  address: `0x${string}`;
  ethPrice: number;
  className?: string;
  onNewTrade: Function;
};

export default function TradingView(props: Props) {
  const { symbol, address, ethPrice, className, onNewTrade } = props;
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // useWatchContractEvent({
  //   address,
  //   abi: ABIs.HaresAbi,
  //   eventName: "BABTokenBuy",
  //   onLogs(logs) {
  //     console.log("New logs!", logs);
  //   },
  // });

  // useWatchContractEvent({
  //   address,
  //   abi: ABIs.HaresAbi,
  //   eventName: "BABTokenSell",
  //   onLogs(logs) {
  //     console.log("BABTokenSell New logs!", logs);
  //   },
  // });

  useEffect(() => {
    if (
      symbol &&
      address &&
      ethPrice &&
      (isScriptLoaded || (window as any).TradingView)
    ) {
      // const unwatch = watchContractEvent({
      //   chains: [mainChain],
      //   transports: {
      //     [mainChain.id]: http(),
      //   },
      // }, {
      //   address,
      //   abi: ABIs.HaresAbi,
      //   eventName: "BABTokenSell",
      //   onLogs(logs: any) {
      //     console.log("New logs!", logs);
      //   },
      // });
      const widget = new (window as any).TradingView.widget({
        // library_path: "https://charting-library.tradingview-widget.com/charting_library/",
        library_path: "/scripts/charting_library/",
        // debug: true, // uncomment this line to see Library errors and warnings in the console
        autosize: true,
        symbol: symbol,
        interval: "5",
        container: "tv_chart_container",
        locale: "en",
        disabled_features: [],
        enabled_features: [],
        datafeed: DataFeed(symbol, address, ethPrice, onNewTrade),
        theme: "dark", // 暗色主题
        overrides: {
          "paneProperties.background": "#000000", // 图表背景色
          "paneProperties.backgroundType": "solid", // 背景类型
          "paneProperties.borderColor": "#333", // 边框颜色
          "scalesProperties.textColor": "#FFFFFF", // 刻度文字颜色
          "scalesProperties.lineColor": "#aaaaaa", // 刻度线颜色
          "chart.backgroundColor": "#020024", // 设置背景颜色
          "chart.crosshairColor": "#555", // 十字线颜色
        },
      });
      widget.onChartReady(function () {
        // 可以在这里再次尝试应用 overrides
        widget.applyOverrides({
          "paneProperties.background": "#000000", // 图表背景色
          "paneProperties.backgroundType": "solid", // 背景类型
          "paneProperties.borderColor": "#333", // 边框颜色
          "scalesProperties.textColor": "#FFFFFF", // 刻度文字颜色
          "scalesProperties.lineColor": "#aaaaaa", // 刻度线颜色
          "chart.backgroundColor": "#020024", // 设置背景颜色
          "chart.crosshairColor": "#555", // 十字线颜色
        });
        // 确保图表加载完成后再移除所有已加载的指标
        widget.chart().removeAllStudies(); // 移除所有默认的指标

        // 如果你希望移除 Volume 等相关指标，可以通过这个方法显式移除
        // widget.chart().removeStudy("volume");  // 移除 volume 指标
      });
    }
  }, [symbol, address, isScriptLoaded, ethPrice]);

  return (
    <div className={className}>
      <Script
        onLoad={() => setIsScriptLoaded(true)}
        src="/scripts/charting_library.standalone.js"
      ></Script>
      <div id="tv_chart_container" className="w-full h-full"></div>
    </div>
  );
}
