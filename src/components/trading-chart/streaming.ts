"use client";

import type {
  Bar,
  LibrarySymbolInfo,
  ResolutionString,
  SubscribeBarsCallback,
} from "~@/libraries/charting_library";

import { publicWsClient, publicClient } from "@/lib/wagmi";
import { Chart } from "./types";
import { decodeEventLog } from "viem";
import { ABIs, primaryMarketSupply } from "@/lib/constant";
import { Trade } from "@/lib/types";
import {
  convertTradesToBarData,
  formatTimestampInSecond,
  groupDatasInRanges,
} from "@/lib/utils";

let initialTimeStamp: number = new Date().getTime();
let lastUpdated = 0;

type SubscriptionItem = {
  subscriberUID: string;
  resolution: ResolutionString;
  lastBar: Bar;
  handlers: {
    id: string;
    callback: SubscribeBarsCallback;
    tradesCallBack: (trades: Trade[]) => void;
  }[];
  pairIndex: number;
};

const channelToSubscription = new Map<number, SubscriptionItem>();

export async function initialWatchEvents(
  token: `0x${string}`,
  nativeTokenPrice: number
) {
  const blockNumber = await publicClient.getBlockNumber();

  const unwatch = publicClient.watchEvent({
    address: token,
    pollingInterval: 5000,
    fromBlock: blockNumber - BigInt(1),
    onLogs: async (logs) => {
      console.log("logs", logs);
      let trades: Trade[] = [];

      // decode trade logs
      for (let i = 0; i < logs.length; i++) {
        const { topics, data, blockNumber, transactionIndex } = logs[i];
        const event = decodeEventLog({
          abi: ABIs.HaresAbi,
          data,
          topics,
        });
        const { eventName, args } = event;

        // Check if the total supply is greater than the primary market supply
        if (eventName === "BABTokenBuy" || eventName === "BABTokenSell") {
          const totalSupply = args.totalSupply;
          if (totalSupply > primaryMarketSupply) {
            unwatch();
            return null;
          }
        }

        if (eventName === "BABTokenBuy") {
          const trade = {
            id: Number(blockNumber) * 1000 + transactionIndex,
            from: args.buyer.toLowerCase(),
            type: 0,
            recipient: args.recipient.toLowerCase(),
            trueOrderSize: args.tokensBought.toString(),
            totalSupply: args.totalSupply.toString(),
            trueEth: args.ethSold.toString(),
            timestamp: formatTimestampInSecond(Date.now()),
          } as Trade;
          trades.push(trade);
        }
        if (eventName === "BABTokenSell") {
          const trade = {
            id: Number(blockNumber) * 1000 + transactionIndex,
            from: args.seller.toLowerCase(),
            type: 1,
            recipient: args.recipient.toLowerCase(),
            trueOrderSize: args.tokensSold.toString(),
            totalSupply: args.totalSupply.toString(),
            trueEth: args.ethBought.toString(),
            timestamp: formatTimestampInSecond(Date.now()),
          } as Trade;
          trades.push(trade);
        }
      }

      const tradeTime = formatTimestampInSecond(Date.now());
      // check trades in current bar
      for (const pairIndex of channelToSubscription.keys()) {
        const subscriptionItem = channelToSubscription.get(pairIndex);

        if (!subscriptionItem) {
          continue;
        }

        const lastBar = subscriptionItem.lastBar;
        const resolution = subscriptionItem.resolution;

        // sort trades by timestamp in ascending order
        const sortedTrades = trades.sort((a, b) => a.timestamp - b.timestamp);

        const rangeInSecond = +resolution * 60;
        const datasInRange = groupDatasInRanges(
          sortedTrades,
          rangeInSecond,
          formatTimestampInSecond(lastBar.time) - rangeInSecond,
          tradeTime + 1
        ).filter((_) => _.length > 0);

        const bars = datasInRange.map((trades) => {
          const _bar = convertTradesToBarData(trades, nativeTokenPrice);
          return {
            ..._bar,
            time: _bar.time * 1000,
          };
        });

        console.log("new bars in range", bars);

        for (const bar of bars) {
          if (
            formatTimestampInSecond(bar.time) <
            formatTimestampInSecond(lastBar.time)
          ) {
            continue;
          }
          subscriptionItem.lastBar = bar;
          // Send data to every subscriber of that symbol
          subscriptionItem.handlers.forEach((handler) => handler.callback(bar));
          subscriptionItem.handlers.forEach((handler) =>
            handler.tradesCallBack(sortedTrades)
          );
        }
      }
    },
  });
  return unwatch;
}

// barTime is millisec, resolution is mins
function getNextBarTime(barTime: number, resolution: number) {
  const previousSegment = Math.floor(barTime / 1000 / 60 / resolution);
  return (previousSegment + 1) * 1000 * 60 * resolution;
}

export function subscribeOnStream(
  symbolInfo: LibrarySymbolInfo,
  resolution: ResolutionString,
  onRealtimeCallback: SubscribeBarsCallback,
  subscriberUID: string,
  onResetCacheNeededCallback: () => void,
  lastBar: Bar,
  pairIndex: number,
  tradesCallBack: (trades: Trade[]) => void
) {
  const handler = {
    id: subscriberUID,
    callback: onRealtimeCallback,
    tradesCallBack: tradesCallBack,
  };
  let subscriptionItem = channelToSubscription.get(pairIndex);
  if (subscriptionItem) {
    // Already subscribed to the channel, use the existing subscription
    subscriptionItem.handlers.push(handler);
    return;
  }

  subscriptionItem = {
    subscriberUID,
    resolution,
    lastBar,
    handlers: [handler],
    pairIndex,
  } as SubscriptionItem;
  channelToSubscription.set(pairIndex, subscriptionItem);
  console.log("[subscribeBars]: Subscribe to streaming. Channel:", pairIndex);
}

export function unsubscribeFromStream(subscriberUID: string) {
  // Find a subscription with id === subscriberUID
  for (const pairIndex of channelToSubscription.keys()) {
    const subscriptionItem = channelToSubscription.get(pairIndex);

    if (!subscriptionItem) {
      continue;
    }

    const handlerIndex = subscriptionItem.handlers.findIndex(
      (handler) => handler.id === subscriberUID
    );

    if (handlerIndex !== -1) {
      // Remove from handlers
      subscriptionItem.handlers.splice(handlerIndex, 1);

      if (subscriptionItem.handlers.length === 0) {
        // Unsubscribe from the channel if it was the last handler
        console.log(
          "[unsubscribeBars]: Unsubscribe from streaming. Channel:",
          pairIndex
        );
        // socket.emit("SubRemove", { subs: [channelString] });
        channelToSubscription.delete(pairIndex);
        break;
      }
    }
  }
}
