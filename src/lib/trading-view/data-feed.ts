import { convertTradesToBar, convertTradeToBars, getKChartData } from "../utils";
import { Address, Trade } from "../types";
import { publicClient } from "../wagmi";
import { ABIs, EventTopic } from "../constant";
import { decodeEventLog } from "viem";

const subsriberCache: Function[] = []
let historyTrades: Trade[] | null = null;
let cacheStartTime = Date.now();
const configurationData = {
  supported_resolutions: ["1s", "1", "5", "15", "30", "60", "1D", "1W", "1M"],
};

export default (symbol: string, address: string, ethPrice: number, onNewTrade: Function) => ({
  onReady: (callback: Function) => {
    console.log("[onReady]: Method call");
    setTimeout(() => callback(configurationData));
  },

  searchSymbols: async (userInput: any, exchange: any, symbolType: any, onResultReadyCallback: Function) => {
    onResultReadyCallback([]);
  },

  resolveSymbol: async (symbolName: string, onSymbolResolvedCallback: Function) => {
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
      supported_resolutions: ["1s", "1", "5", "15", "30", "60", "1D", "1W", "1M"],
      data_status: "endofday",
    };

    console.log("[resolveSymbol]: Symbol resolved", symbolName);
    historyTrades = null;
    onSymbolResolvedCallback(symbolInfo);
  },

  getBars: async (symbolInfo: any, resolution: any, periodParams: any, onHistoryCallback: Function, onErrorCallback: Function) => {
    const { from, to, firstDataRequest } = periodParams;
    console.log("[getBars]: Method call", symbolInfo, resolution, periodParams);
    if (!historyTrades) {
      const res = await fetch(`/api/trade/history?address=${address}`).then((res) => res.json());
      if (res.code !== 0) {
        return onErrorCallback(res.message);
      }
      historyTrades = res.data as Trade[];
      onNewTrade(historyTrades);
    }
    const bars = convertTradeToBars(historyTrades, from, to, resolution, ethPrice);
    if (firstDataRequest) {
      cacheStartTime = to * 1000;
    }
    onHistoryCallback(bars || [], {
      noData: !bars,
    });
  },

  subscribeBars: (symbolInfo: any, resolution: any, onRealtimeCallback: any, subscriberUID: any, onResetCacheNeededCallback: any) => {
    console.log("[subscribeBars]: Method call with subscriberUID:", subscriberUID);
    let tradesInCurrentBar: Trade[] = []
    subsriberCache.forEach((unwatch) => {
      unwatch();
    });

    const unwatch = publicClient.watchEvent({
      address: address as Address,
      onLogs: async (logs) => {
        console.log(logs);
        if (Date.now() - cacheStartTime > resolution * 60 * 1000) {
          cacheStartTime = Date.now()
          tradesInCurrentBar = []
        }
        for (let i = 0; i < logs.length; i++) {
          const { topics, data, blockNumber, transactionIndex } = logs[i]
          const event = decodeEventLog({
            abi: ABIs.HaresAbi,
            data,
            topics
          })
          const { eventName, args } = event
          if (eventName === 'HaresTokenBuy') {
            const trade = {
              id: Number(blockNumber) * 1000 + transactionIndex,
              from: args.buyer.toLowerCase(),
              type: 0,
              recipient: args.recipient.toLowerCase(),
              trueOrderSize: args.tokensBought.toString(),
              totalSupply: args.totalSupply.toString(),
              trueEth: args.ethSold.toString(),
              timestamp: Math.floor(Date.now() / 1000)
            } as Trade
            onNewTrade([trade]);
            tradesInCurrentBar.push(trade)
          }
          if (eventName === 'HaresTokenSell') {
            const trade = {
              id: Number(blockNumber) * 1000 + transactionIndex,
              from: args.seller.toLowerCase(),
              type: 1,
              recipient: args.recipient.toLowerCase(),
              trueOrderSize: args.tokensSold.toString(),
              totalSupply: args.totalSupply.toString(),
              trueEth: args.ethBought.toString(),
              timestamp: Math.floor(Date.now() / 1000)
            } as Trade
            onNewTrade([trade]);
            tradesInCurrentBar.push(trade)
          }
        }
        const bar = convertTradesToBar(tradesInCurrentBar.sort((a, b) => a.id - b.id), ethPrice);
        onRealtimeCallback(bar);
      }
    })
    subsriberCache.push(unwatch)
  },

  unsubscribeBars: (subscriberUID: any) => {
    console.log("[unsubscribeBars]: Method call with subscriberUID:", subscriberUID);
    // clearInterval(subsriberCache[subscriberUID]);
  },
});
// [
//   {
//       "address": "0x8da7e80adbd4b1de1e2280986811dc64b4f4149b",
//       "topics": [
//           "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
//           "0x0000000000000000000000000000000000000000000000000000000000000000",
//           "0x000000000000000000000000003fb5d7d6ab042fa1a13ad8cd345c8843352371"
//       ],
//       "data": "0x0000000000000000000000000000000000000000001332aab8806d9ebd505580",
//       "blockNumber": "65824194",
//       "transactionHash": "0x27d6e18eda4264814e30895a07c91743a2edf0d345134362dfcffa4255a7490a",
//       "transactionIndex": 37,
//       "blockHash": "0x04620d0b081834b53499d7219400d8d019c0c66cc2b8284abee7669cc2563c92",
//       "logIndex": 314,
//       "removed": false
//   },
//   {
//       "address": "0x8da7e80adbd4b1de1e2280986811dc64b4f4149b",
//       "topics": [
//           "0x1b8d7365dae3cd94c61c4353507a591533f5b24569ad4792690b605287eb3399",
//           "0x0000000000000000000000000000000000000000000000000000000000000000",
//           "0x000000000000000000000000003fb5d7d6ab042fa1a13ad8cd345c8843352371"
//       ],
//       "data": "0x0000000000000000000000000000000000000000001332aab8806d9ebd505580000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000058bc2064fe9d8e2e99848000000000000000000000000000000000000000000170fd75e9d26f08240a4c80",
//       "blockNumber": "65824194",
//       "transactionHash": "0x27d6e18eda4264814e30895a07c91743a2edf0d345134362dfcffa4255a7490a",
//       "transactionIndex": 37,
//       "blockHash": "0x04620d0b081834b53499d7219400d8d019c0c66cc2b8284abee7669cc2563c92",
//       "logIndex": 315,
//       "removed": false
//   },
//   {
//       "address": "0x8da7e80adbd4b1de1e2280986811dc64b4f4149b",
//       "topics": [
//           "0x69aa9d9c375b6dc1360aec88e101276f1e86eab02d4695b96887462df301eddb",
//           "0x000000000000000000000000719a4ac2eef02ac9e09d69b58d963dc75ed57442",
//           "0x000000000000000000000000003fb5d7d6ab042fa1a13ad8cd345c8843352371"
//       ],
//       "data": "0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000038d7ea4c68000",
//       "blockNumber": "65824194",
//       "transactionHash": "0x27d6e18eda4264814e30895a07c91743a2edf0d345134362dfcffa4255a7490a",
//       "transactionIndex": 37,
//       "blockHash": "0x04620d0b081834b53499d7219400d8d019c0c66cc2b8284abee7669cc2563c92",
//       "logIndex": 317,
//       "removed": false
//   },
//   {
//       "address": "0x8da7e80adbd4b1de1e2280986811dc64b4f4149b",
//       "topics": [
//           "0x53aedb61808d0c6b119592ca2d3e621372bd951061604f945887f28270c172f0",
//           "0x000000000000000000000000003fb5d7d6ab042fa1a13ad8cd345c8843352371",
//           "0x000000000000000000000000003fb5d7d6ab042fa1a13ad8cd345c8843352371"
//       ],
//       "data": "0x000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000016345785d8a00000000000000000000000000000000000000000000001332aab8806d9ebd50558000000000000000000000000000000000000000000058bc2064fe9d8e2e99848000000000000000000000000000000000000000000170fd75e9d26f08240a4c800000000000000000000000000000000000000000000000000000000000000000",
//       "blockNumber": "65824194",
//       "transactionHash": "0x27d6e18eda4264814e30895a07c91743a2edf0d345134362dfcffa4255a7490a",
//       "transactionIndex": 37,
//       "blockHash": "0x04620d0b081834b53499d7219400d8d019c0c66cc2b8284abee7669cc2563c92",
//       "logIndex": 318,
//       "removed": false
//   }
// ]