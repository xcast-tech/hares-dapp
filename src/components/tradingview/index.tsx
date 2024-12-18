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
      new (window as any).TradingView.widget({
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
      });
    }
    
  }, [symbol, address])

  return (
    <div className={className}>
      <div id="tv_chart_container" className='w-full h-full'></div>
    </div>
  );
}