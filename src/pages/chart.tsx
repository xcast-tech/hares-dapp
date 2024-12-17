import DataFeed from '@/lib/trading-view/data-feed';
import { useRouter } from 'next/router';
import Script from 'next/script';
import { ReactElement, useEffect, useState } from "react";

export default function Chart() {

  const router = useRouter()
  const { symbol, address } = router.query

  const [scriptLoaded, setScriptLoaded] = useState(false)

  useEffect(() => {
    if (scriptLoaded && symbol && address) {
      new (window as any).TradingView.widget({
        // library_path: "https://charting-library.tradingview-widget.com/charting_library/",
        library_path: '/scripts/charting_library/',
        // debug: true, // uncomment this line to see Library errors and warnings in the console
        fullscreen: true,
        symbol: symbol,
        interval: '1D',
        container: "tv_chart_container",
        locale: "en",
        disabled_features: [],
        enabled_features: [],
        datafeed: DataFeed(symbol as string, address as string),
      });
    }
    
  }, [scriptLoaded, symbol, address])

  return (
    <div>
      <Script onLoad={() => setScriptLoaded(true)} src="/scripts/charting_library.standalone.js"></Script>
      <div>
        <div id="tv_chart_container"></div>
      </div>
    </div>
  );
}

Chart.GetLayout = function GetLayout(page: ReactElement, pageProps: any) {
  return page
}