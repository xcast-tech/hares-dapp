import Script from 'next/script';
import { ReactElement, useEffect, useState } from "react";


export default function Chart() {

  const [chartLibraryLoaded, setChartLibraryLoaded] = useState(false)
  const [datafeedLoaded, setDatafeedLoaded] = useState(false)

  useEffect(() => {
    if (chartLibraryLoaded && datafeedLoaded) {
      new (window as any).TradingView.widget({
        // library_path: "https://charting-library.tradingview-widget.com/charting_library/",
        library_path: '/scripts/charting_library/',
        // debug: true, // uncomment this line to see Library errors and warnings in the console
        fullscreen: true,
        symbol: 'HARES',
        interval: '5m',
        container: "tv_chart_container",
        datafeed: new (window as any).Datafeeds.UDFCompatibleDatafeed("http://localhost:3001/api/data-feed"),
        locale: "en",
        disabled_features: [],
        enabled_features: [],
      });
    }
  }, [chartLibraryLoaded, datafeedLoaded])

  return (
    <>
      <Script onLoad={() => setChartLibraryLoaded(true)} src="/scripts/charting_library.standalone.js"></Script>
      <Script onLoad={() => setDatafeedLoaded(true)} src="/scripts/datafeed.js"></Script>
      <div>
        <div id="tv_chart_container"></div>
      </div>
    </>
  );
}

Chart.GetLayout = function GetLayout(page: ReactElement, pageProps: any) {
  return page
}