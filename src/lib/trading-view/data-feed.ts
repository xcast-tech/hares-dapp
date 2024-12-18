import { convertTradesToBar, convertTradeToBars, getKChartData } from "../utils";
import { Trade } from "../types";

const subsriberCache: Record<string, any> = {}
let historyTrades: Trade[] | null = null
let cacheStartTime = Date.now()
const configurationData = {
  supported_resolutions: ["1", "5", "15", "30", "60", "1D", "1W", "1M"],
};

export default (symbol: string, address: string, ethPrice: number) => ({
  onReady: (callback: Function) => {
    console.log("[onReady]: Method call");
    setTimeout(() => callback(configurationData));
  },

  searchSymbols: async (
    userInput: any,
    exchange: any,
    symbolType: any,
    onResultReadyCallback: Function
  ) => {
    onResultReadyCallback([]);
  },

  resolveSymbol: async (
    symbolName: string,
    onSymbolResolvedCallback: Function,
  ) => {
    console.log("[resolveSymbol]: Method call", symbolName);
    // Symbol information object
    const symbolInfo = {
      ticker: symbolName,
      name: symbolName,
      description: symbolName,
      type: "crypto",
      session: "24x7",
      timezone: "Etc/UTC",
      exchange: "USDT",
      minmov: 1,
      pricescale: 1e10,
      has_intraday: true,
      has_daily: true,
      has_weekly_and_monthly: false,
      supported_resolutions: ["1", "5", "15", "30"],
      data_status: "endofday"
    };

    console.log("[resolveSymbol]: Symbol resolved", symbolName);
    onSymbolResolvedCallback(symbolInfo);
  },

  getBars: async (
    symbolInfo: any,
    resolution: any,
    periodParams: any,
    onHistoryCallback: Function,
    onErrorCallback: Function
  ) => {
    const { from, to } = periodParams;
    console.log("[getBars]: Method call", symbolInfo, resolution, periodParams);
    if (!historyTrades) {
      const res = await fetch(`/api/trade/history?address=${address}`).then(res => res.json())
      if (res.code !== 0) {
        return onErrorCallback(res.message);
      }
      historyTrades = res.data as Trade[]
    }
    const bars = convertTradeToBars(historyTrades, from, to, resolution, ethPrice);
    onHistoryCallback(bars || [], {
      noData: !bars
    })
  },

  subscribeBars: (
    symbolInfo: any,
    resolution: any,
    onRealtimeCallback: any,
    subscriberUID: any,
    onResetCacheNeededCallback: any
  ) => {
    console.log(
      "[subscribeBars]: Method call with subscriberUID:",
      subscriberUID
    );
    cacheStartTime = Date.now()
    Object.keys(subsriberCache).forEach(key => {
      clearInterval(subsriberCache[key])
    })
    subsriberCache[subscriberUID] = setInterval(async () => {
      const res = await fetch(`/api/trade/history?address=${address}&from=${cacheStartTime}`).then(res => res.json())
      if (res.code !== 0 || res.data.length === 0) {
        return
      }
      const bar = convertTradesToBar(res.data, ethPrice)
      onRealtimeCallback(bar)
      if (Date.now() - cacheStartTime > resolution * 60 * 1000) {
        cacheStartTime = Date.now()
      }
    }, 5000);
  },

  unsubscribeBars: (subscriberUID: any) => {
    console.log(
      "[unsubscribeBars]: Method call with subscriberUID:",
      subscriberUID
    );
    // clearInterval(subsriberCache[subscriberUID]);
  },
});
