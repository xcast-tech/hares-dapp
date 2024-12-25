import {
  convertTradesToBar,
  convertTradeToBars,
  getKChartData,
} from "../utils";
import { Address, Trade } from "../types";
import { publicClient } from "../wagmi";
import { ABIs, EventTopic } from "../constant";
import { decodeEventLog } from "viem";

let subsriberCache: Function[] = [];
let historyTrades: Trade[] | null = null;
let cacheStartTime = Date.now();
const configurationData = {
  supported_resolutions: ["1s", "1", "5", "15", "30", "60", "1D", "1W", "1M"],
};

export default (
  symbol: string,
  address: string,
  ethPrice: number,
  onNewTrade: Function
) => ({
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
    onSymbolResolvedCallback: Function
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
      supported_resolutions: [
        "1s",
        "1",
        "5",
        "15",
        "30",
        "60",
        "1D",
        "1W",
        "1M",
      ],
      data_status: "endofday",
    };

    console.log("[resolveSymbol]: Symbol resolved", symbolName);
    historyTrades = null;
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
    console.log("[getBars]: Method call", symbolInfo, resolution, periodParams);
    if (!historyTrades) {
      const res = await fetch(`/api/trade/history?address=${address}`).then(
        (res) => res.json()
      );
      if (res.code !== 0) {
        return onErrorCallback(res.message);
      }
      historyTrades = res.data as Trade[];
      onNewTrade(historyTrades);
    }
    const bars = convertTradeToBars(
      historyTrades,
      from,
      to,
      resolution,
      ethPrice
    );
    if (firstDataRequest) {
      cacheStartTime = to * 1000;
    }
    onHistoryCallback(bars || [], {
      noData: !bars,
    });
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
    let tradesInCurrentBar: Trade[] = [];
    subsriberCache.forEach((unwatch) => {
      unwatch();
    });
    subsriberCache = []

    const unwatch = publicClient.watchEvent({
      address: address as Address,
      pollingInterval: 5000,
      onLogs: async (logs) => {
        console.log(logs);
        if (Date.now() - cacheStartTime > resolution * 60 * 1000) {
          cacheStartTime = Date.now();
          tradesInCurrentBar = [];
        }
        for (let i = 0; i < logs.length; i++) {
          const { topics, data, blockNumber, transactionIndex } = logs[i];
          const event = decodeEventLog({
            abi: ABIs.HaresAbi,
            data,
            topics,
          });
          const { eventName, args } = event;
          if (eventName === "HaresTokenBuy") {
            const trade = {
              id: Number(blockNumber) * 1000 + transactionIndex,
              from: args.buyer.toLowerCase(),
              type: 0,
              recipient: args.recipient.toLowerCase(),
              trueOrderSize: args.tokensBought.toString(),
              totalSupply: args.totalSupply.toString(),
              trueEth: args.ethSold.toString(),
              timestamp: Math.floor(Date.now() / 1000),
            } as Trade;
            onNewTrade([trade]);
            tradesInCurrentBar.push(trade);
            if (Number(trade.totalSupply) > 8e26) {
              unwatch();
            }
          }
          if (eventName === "HaresTokenSell") {
            const trade = {
              id: Number(blockNumber) * 1000 + transactionIndex,
              from: args.seller.toLowerCase(),
              type: 1,
              recipient: args.recipient.toLowerCase(),
              trueOrderSize: args.tokensSold.toString(),
              totalSupply: args.totalSupply.toString(),
              trueEth: args.ethBought.toString(),
              timestamp: Math.floor(Date.now() / 1000),
            } as Trade;
            onNewTrade([trade]);
            tradesInCurrentBar.push(trade);
          }
        }
        const bar = convertTradesToBar(
          tradesInCurrentBar.sort((a, b) => a.id - b.id),
          ethPrice
        );
        onRealtimeCallback(bar);
      },
    });
    subsriberCache.push(unwatch);
  },

  unsubscribeBars: (subscriberUID: any) => {
    console.log(
      "[unsubscribeBars]: Method call with subscriberUID:",
      subscriberUID
    );
    // clearInterval(subsriberCache[subscriberUID]);
  },
});
