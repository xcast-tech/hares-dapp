import DataFeed from '@/lib/trading-view/data-feed';
import { useEffect } from "react";

type Props = {
  symbol: string;
  address: string;
  ethPrice: number;
  className?: string;
}

export default function TradingView(props: Props) {

  const { symbol, address, ethPrice, className } = props

  useEffect(() => {
    if (symbol && address) {
      const widget = new (window as any).TradingView.widget({
        // library_path: "https://charting-library.tradingview-widget.com/charting_library/",
        library_path: '/scripts/charting_library/',
        // debug: true, // uncomment this line to see Library errors and warnings in the console
        autosize: true,
        symbol: symbol,
        interval: '5',
        container: "tv_chart_container",
        locale: "en",
        disabled_features: [],
        enabled_features: [],
        datafeed: DataFeed(symbol, address, ethPrice),
        theme: "dark",  // 暗色主题    
        overrides: {
          "paneProperties.background": "#000000",  // 图表背景色
          "paneProperties.backgroundType": "solid",  // 背景类型
          "paneProperties.borderColor": "#333",     // 边框颜色
          "scalesProperties.textColor": "#FFFFFF",  // 刻度文字颜色
          "scalesProperties.lineColor": "#AAAAAA",  // 刻度线颜色
          "chart.backgroundColor": "#020024",       // 设置背景颜色
          "chart.crosshairColor": "#555",           // 十字线颜色
        },
      });
      widget.onChartReady(function() {
        // 可以在这里再次尝试应用 overrides
        widget.applyOverrides({
          "paneProperties.background": "#000000",  // 图表背景色
          "paneProperties.backgroundType": "solid",  // 背景类型
          "paneProperties.borderColor": "#333",     // 边框颜色
          "scalesProperties.textColor": "#FFFFFF",  // 刻度文字颜色
          "scalesProperties.lineColor": "#AAAAAA",  // 刻度线颜色
          "chart.backgroundColor": "#020024",       // 设置背景颜色
          "chart.crosshairColor": "#555",           // 十字线颜色
        })
        // 确保图表加载完成后再移除所有已加载的指标
        widget.chart().removeAllStudies();  // 移除所有默认的指标
  
        // 如果你希望移除 Volume 等相关指标，可以通过这个方法显式移除
        widget.chart().removeStudy("volume");  // 移除 volume 指标
      });
    }
    
  }, [symbol, address])

  return (
    <div className={className}>
      <div id="tv_chart_container" className='w-full h-full'></div>
    </div>
  );
}