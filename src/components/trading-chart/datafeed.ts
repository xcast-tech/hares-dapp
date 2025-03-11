import type {
  Bar,
  LibrarySymbolInfo,
  IBasicDataFeed,
  DatafeedConfiguration,
  ResolutionString,
} from "~@/libraries/charting_library";

import { getChartTable } from "./getChartTable";
import { Trade } from "@/lib/types";
import {
  initialWatchEvents,
  subscribeOnStream,
  unsubscribeFromStream,
} from "./streaming";
import { removeDuplicateTrades } from "@/lib/utils";
import { fetchTradeDatas } from "@/lib/apis";

let subsriberCache: Function[] = [];

const lastTradesCache = new Map<
  string,
  {
    from: number;
    to: number;
    trades: Trade[];
  }
>();

// 更新缓存的方法
const updateCache = (
  key: string,
  data: {
    from: number;
    to: number;
    trades: Trade[];
  }
) => {
  const _trades = removeDuplicateTrades(data.trades);
  lastTradesCache.set(key, {
    from: data.from,
    to: data.to,
    trades: _trades,
  });
  return _trades;
};

// 主逻辑：根据 currentFrom 和 currentTo 来判断是否需要请求新的数据
const loadTrades = async (
  pairIndex: number,
  token: string,
  currentFrom: number,
  currentTo: number
) => {
  const key = `${token}-${pairIndex}`;
  const _lastTradesCache = lastTradesCache.get(key);
  console.log(
    "--- _lastTradesCache",
    _lastTradesCache,
    "currentFrom",
    currentFrom,
    "currentTo",
    currentTo
  );
  // 1. 没有缓存数据时，请求当前 to 之前的所有数据
  if (!_lastTradesCache) {
    const { list, noData } = await fetchTradeDatas(token, 0, currentTo, 1000);
    return {
      list: updateCache(key, {
        from: noData ? 0 : Math.min(list[0].timestamp, currentFrom),
        to: currentTo,
        trades: list,
      }),
      noData,
    };
  }

  // 2. 有缓存数据，且当前 to 大于缓存数据的 to 时，请求期间的数据并更新到 cache
  if (_lastTradesCache && currentTo > _lastTradesCache.to) {
    const { list, noData } = await fetchTradeDatas(
      token,
      _lastTradesCache.to,
      currentTo,
      1000
    );
    return {
      list: updateCache(key, {
        from: _lastTradesCache.from,
        to: noData
          ? currentTo
          : Math.min(list[list.length - 1].timestamp, _lastTradesCache.to),
        trades: [..._lastTradesCache.trades, ...list],
      }),
      noData,
    };
  }

  // 3. 有缓存数据，且当前 from 小于缓存数据的 from 时，请求期间的数据并更新到 cache
  if (_lastTradesCache && currentFrom < _lastTradesCache.from) {
    const { list, noData } = await fetchTradeDatas(
      token,
      0,
      _lastTradesCache.from,
      1000
    );

    return {
      list: updateCache(key, {
        from: noData ? 0 : Math.max(list[0].timestamp, currentFrom),
        to: _lastTradesCache.to,
        trades: [...list, ..._lastTradesCache.trades],
      }),
      noData,
    };
  }

  return {
    list: _lastTradesCache.trades,
    noData: true,
  };
};

const lastBarsCache = new Map<string, Bar>();
const minPrice: Number = 0;
const maxPrice: Number = 0;
// DatafeedConfiguration implementation
const configurationData: DatafeedConfiguration = {
  // Represents the resolutions for bars supported by your datafeed
  supported_resolutions: [
    "1",
    "5",
    "15",
    "45",
    "60",
    "240",
    "1440",
  ] as ResolutionString[],
};

export function getDataFeed({
  pairIndex, // panel index
  name,
  token,
  nativeTokenPrice,
  defaultTrades,
  tradesCallBack,
}: {
  name: string;
  pairIndex: number;
  token: `0x${string}`;
  nativeTokenPrice: number;
  defaultTrades: Trade[];
  tradesCallBack: (trades: Trade[]) => void;
}): IBasicDataFeed {
  return {
    onReady: (callback) => {
      console.log("[onReady]: Method call");
      const key = `${token}-${pairIndex}`;
      const to = defaultTrades[defaultTrades.length - 1]?.timestamp || 0;
      const from = defaultTrades[0]?.timestamp || 0;
      updateCache(key, {
        from,
        to,
        trades: [...defaultTrades],
      });

      setTimeout(() => {
        callback(configurationData);
        initialWatchEvents(token, nativeTokenPrice);
      }, 0);
    },

    searchSymbols: () => {
      console.log("[searchSymbols]: Method call");
    },

    resolveSymbol: async (
      symbolName,
      onSymbolResolvedCallback,
      _onResolveErrorCallback,
      _extension
    ) => {
      console.log("[resolveSymbol]: Method call", symbolName);

      // Symbol information object
      const symbolInfo: LibrarySymbolInfo = {
        ticker: name,
        name: name,
        description: name,
        type: "crypto",
        session: "24x7",
        timezone: "Etc/UTC",
        minmov: 1,
        pricescale: 1e10,
        exchange: "USDT",
        has_intraday: true,
        has_daily: true,
        visible_plots_set: "ohlc",
        has_weekly_and_monthly: false,
        supported_resolutions: configurationData.supported_resolutions,
        volume_precision: 2,
        data_status: "streaming",
        format: "price",
        listed_exchange: "",
      };

      console.log("[resolveSymbol]: Symbol resolved", symbolName);
      setTimeout(() => onSymbolResolvedCallback(symbolInfo));
    },

    getBars: async (
      symbolInfo: LibrarySymbolInfo,
      resolution,
      periodParams,
      onHistoryCallback,
      onErrorCallback
    ) => {
      const { from, to, firstDataRequest } = periodParams;
      console.log("[getBars]: Method call", symbolInfo, resolution, from, to);

      try {
        const { list, noData } = await loadTrades(pairIndex, token, from, to);
        tradesCallBack(list);

        console.log(
          "----- get bars trades",
          list,
          "format list",
          list.map((item) => {
            return {
              ...item,
              timestamp: new Date(item.timestamp * 1000).toISOString(),
            };
          })
        );
        const chartTable = await getChartTable({
          token,
          pairIndex: pairIndex,
          from: Math.min(from, list[0]?.timestamp || from),
          to,
          range: +resolution,
          trades: list,
          nativeTokenPrice,
        });

        if (!chartTable || !chartTable.table) {
          // "noData" should be set if there is no data in the requested period
          onHistoryCallback([], {
            noData: true,
          });
          return;
        }

        let bars: Bar[] = [];

        chartTable.table.forEach((bar: Bar) => {
          // if (bar.time >= from && bar.time < to) {
          bars = [...bars, { ...bar, time: bar.time * 1000 }];
          // }
        });

        // console.log(
        //   "--- chartTable",
        //   chartTable.table,
        //   "bars",
        //   bars,
        //   "format bars",
        //   bars.map((item) => {
        //     return {
        //       ...item,
        //       timestamp: new Date(item.time).toISOString(),
        //     };
        //   })
        // );

        if (firstDataRequest) {
          lastBarsCache.set(symbolInfo.name, {
            ...bars[bars.length - 1],
          });
        }
        console.log(`[getBars]: returned ${bars.length} bar(s)`);
        onHistoryCallback(bars, {
          noData: noData,
        });
      } catch (error: any) {
        console.log("[getBars]: Get error", error);
        onErrorCallback(error);
      }
    },

    subscribeBars: async (
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

      subscribeOnStream(
        symbolInfo,
        resolution,
        onRealtimeCallback,
        subscriberUID,
        onResetCacheNeededCallback,
        lastBarsCache.get(symbolInfo.name)!,
        pairIndex,
        tradesCallBack
      );
    },

    unsubscribeBars: (subscriberUID) => {
      console.log(
        "[unsubscribeBars]: Method call with subscriberUID:",
        subscriberUID
      );
      unsubscribeFromStream(subscriberUID);
    },
  };
}
