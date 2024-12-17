//@ts-nocheck
import axios from "axios";
import { getKChartData } from "../utils";
import { makeApiRequest, generateSymbol, parseFullSymbol } from "./helpers";
import { subscribeOnStream, unsubscribeFromStream } from "./streaming";
import { request } from "../apis/request";

const lastBarsCache = new Map();

// DatafeedConfiguration implementation
const configurationData = {
  // Represents the resolutions for bars supported by your datafeed
  supported_resolutions: ["1", "5", "15", "30", "60", "1D", "1W", "1M"],
};

export default (symbol: string, address: string) => ({
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
      exchange: "Pump",
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
    const { from, to, firstDataRequest } = periodParams;
    console.log("[getBars]: Method call", symbolInfo, resolution, from, to);
    const res = await fetch(`/api/trade/history2?from=${from}&to=${to}&resolution=${resolution}&address=${address}`).then(res => res.json())
    console.log(res)
    if (res.code !== 0) {
      return onErrorCallback(res.message);
    }
    const { list, prev } = res.data
    console.log(getKChartData(list, 4000, prev && prev.totalSupply / 1e18))
    onHistoryCallback(getKChartData(list, 4000, prev && prev.totalSupply / 1e18), {
      noData: !prev
    });
  },

  subscribeBars: (
    symbolInfo,
    resolution,
    onRealtimeCallback,
    subscriberUID,
    onResetCacheNeededCallback
  ) => {
    console.log(
      "[subscribeBars]: Method call with subscriberUID:",
      subscriberUID
    );
		// let price = 30 + (Math.random() - 0.5)* 10;
    // onRealtimeCallback({
		// 	open: price,
		// 	high: price,
		// 	low: price,
		// 	close: price,
		// 	time: Date.now()
		// })
  },

  unsubscribeBars: (subscriberUID) => {
    console.log(
      "[unsubscribeBars]: Method call with subscriberUID:",
      subscriberUID
    );
    // unsubscribeFromStream(subscriberUID);
  },
});
